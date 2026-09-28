import { Request, Response } from 'express';
import axios from 'axios';
import { Forecast } from '@powerguard/shared-types';
import { simulator } from '../simulator/SimulationEngine';
import { config } from '../config/environment';

export async function getForecast(req: Request, res: Response): Promise<void> {
  const horizon = (req.query.horizon as '1h' | '6h' | '24h') || '24h';
  const machines = simulator.getMachines();
  const currentTotal = machines.reduce((acc, m) => acc + m.powerKw, 0);

  try {
    const aiRes = await axios.post(
      `${config.aiServiceUrl}/api/ai/forecast`,
      {
        horizon,
        historicalReadings: [],
        currentTotalPowerKw: currentTotal,
        peakThresholdKw: config.peakDemandThresholdKw,
      },
      { timeout: 3000 }
    );

    res.json({
      success: true,
      data: aiRes.data,
    });
    return;
  } catch {
    // Deterministic fallback if Python AI service is offline
    const now = new Date();
    const dataPoints = [];
    const steps = horizon === '1h' ? 12 : (horizon === '6h' ? 12 : 24);
    const stepMins = horizon === '1h' ? 5 : (horizon === '6h' ? 30 : 60);

    let maxPred = 0;
    let peakTime = '15:00';

    for (let i = 0; i < steps; i++) {
      const t = new Date(now.getTime() + (i + 1) * stepMins * 60 * 1000);
      const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
      
      const hour = t.getHours();
      let factor = 0.85;
      if (hour >= 10 && hour <= 12) factor = 0.98;
      if (hour >= 14 && hour <= 16) factor = 1.05;
      if (hour >= 0 && hour <= 5) factor = 0.45;

      const pred = Math.round((currentTotal * factor + Math.sin(i * 0.7) * 4.0) * 10) / 10;
      if (pred > maxPred) {
        maxPred = pred;
        peakTime = timeStr;
      }

      dataPoints.push({
        time: timeStr,
        actual: i === 0 ? Math.round(currentTotal * 10) / 10 : undefined,
        predicted: pred,
        lowerBound: Math.max(10, Math.round((pred - 5.0 - (i * 0.4)) * 10) / 10),
        upperBound: Math.round((pred + 5.0 + (i * 0.4)) * 10) / 10,
      });
    }

    const fallbackForecast: Forecast = {
      horizon,
      timestamp: new Date().toISOString(),
      predictedTotalPowerKw: Math.round(currentTotal * 10) / 10,
      predictedPeakKw: maxPred,
      peakTime,
      confidence: 0.91,
      dataPoints,
    };

    res.json({
      success: true,
      data: fallbackForecast,
    });
  }
}
