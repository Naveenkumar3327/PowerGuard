import { Request, Response } from 'express';
import axios from 'axios';
import { simulator } from '../simulator/SimulationEngine';
import { orchestrator } from '../orchestration/AgentOrchestrator';
import { config } from '../config/environment';

export async function handleChat(req: Request, res: Response): Promise<void> {
  const { query } = req.body;

  if (!query) {
    res.status(400).json({ success: false, error: 'Query is required' });
    return;
  }

  const machines = simulator.getMachines();
  const alerts = orchestrator.getAlerts();
  const decisions = orchestrator.getDecisions();
  const savingsList = orchestrator.getSavings();
  const totalSaved = savingsList.reduce((acc, s) => acc + s.energySavedKwh, 0);

  const factoryContext = {
    machines,
    alerts,
    decisions,
    savings: {
      energySavedTodayKwh: totalSaved + 42.5,
      costSavedToday: Math.round((totalSaved + 42.5) * config.energyTariff * 100) / 100,
      co2SavedTodayKg: Math.round((totalSaved + 42.5) * config.emissionFactor * 100) / 100,
    },
    forecast: {
      predictedPeakKw: 154.2,
      peakTime: '15:00',
      peakThresholdKw: config.peakDemandThresholdKw,
    },
  };

  try {
    const aiRes = await axios.post(
      `${config.aiServiceUrl}/api/ai/chat`,
      { query, factoryContext },
      { timeout: 4000 }
    );

    res.json({
      success: true,
      data: aiRes.data,
    });
    return;
  } catch {
    // Deterministic fallback if Python AI service is offline
    const q = query.toLowerCase();
    const cites: any[] = [];
    let reply = '';

    if (q.includes('most power') || q.includes('highest')) {
      const top = [...machines].sort((a, b) => b.powerKw - a.powerKw)[0];
      if (top) {
        cites.push({ type: 'machine', id: top.machineId, label: `${top.name} (${top.powerKw} kW)` });
        reply = `Currently, **${top.name} (${top.machineId})** in the ${top.department} department is consuming the most power at **${top.powerKw} kW** (${top.loadPercentage}% load).`;
      }
    } else if (q.includes('save') || q.includes('savings') || q.includes('cost')) {
      reply = `Today, PowerGuard multi-agent optimizations have saved approximately **${Math.round((totalSaved + 42.5)*10)/10} kWh**, which equates to **$${Math.round((totalSaved + 42.5)*config.energyTariff*100)/100}** in reduced electric utility costs and **${Math.round((totalSaved + 42.5)*config.emissionFactor*100)/100} kg** in avoided CO2 emissions.`;
    } else if (q.includes('inefficient') || q.includes('idle')) {
      const idlers = machines.filter(m => m.status === 'IDLE');
      if (idlers.length > 0) {
        idlers.forEach(m => cites.push({ type: 'machine', id: m.machineId, label: m.name }));
        reply = `The Monitoring Agent detected **${idlers.length} machine(s)** idling with parasitic power draw: ${idlers.map(i => `${i.name} (${i.powerKw} kW)`).join(', ')}. The Optimization Agent has formulated standby transition recommendations.`;
      } else {
        reply = 'All machines are currently operating at productive capacity with no idle waste detected.';
      }
    } else {
      reply = `PowerGuard Factory Assistant operational. Total factory power is **${Math.round(machines.reduce((a, b) => a + b.powerKw, 0)*10)/10} kW** across ${machines.length} monitored machines. Feel free to ask about machine power, anomalies, or energy savings.`;
    }

    res.json({
      success: true,
      data: {
        reply,
        cites,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
