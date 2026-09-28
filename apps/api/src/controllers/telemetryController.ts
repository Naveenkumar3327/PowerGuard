import { Request, Response } from 'express';
import { simulator } from '../simulator/SimulationEngine';
import { TelemetryModel } from '../models';
import { isConnectedToDb } from '../config/database';

export async function getLatestTelemetry(req: Request, res: Response): Promise<void> {
  const machines = simulator.getMachines();
  const telemetries = machines.map((m) => ({
    machineId: m.machineId,
    timestamp: new Date().toISOString(),
    voltage: m.voltage,
    current: m.current,
    powerFactor: m.powerFactor,
    powerKw: m.powerKw,
    energyKwh: m.energyKwh,
    loadPercentage: m.loadPercentage,
    temperature: m.temperature,
    status: m.status,
    isAnomaly: m.status === 'FAULT' || m.powerKw > m.ratedPowerKw * 1.15,
  }));

  res.json({
    success: true,
    data: telemetries,
  });
}

export async function getMachineTelemetryHistory(req: Request, res: Response): Promise<void> {
  const { machineId } = req.params;
  const limit = parseInt(req.query.limit as string || '50', 10);

  if (isConnectedToDb) {
    try {
      const records = await TelemetryModel.find({ machineId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
      
      if (records && records.length > 0) {
        res.json({
          success: true,
          count: records.length,
          data: records.reverse(),
        });
        return;
      }
    } catch {}
  }

  // Generate synthetic high-fidelity 50-point history for instant chart rendering
  const machine = simulator.getMachine(machineId);
  const basePower = machine ? machine.powerKw : 25.0;
  const baseTemp = machine ? machine.temperature : 42.0;
  const baseLoad = machine ? machine.loadPercentage : 70.0;
  const now = Date.now();

  const generated = [];
  for (let i = limit; i >= 0; i--) {
    const t = new Date(now - i * 5000);
    const wave = Math.sin(i * 0.3) * 3.5;
    generated.push({
      machineId,
      timestamp: t.toISOString(),
      powerKw: Math.max(1.0, Math.round((basePower + wave) * 10) / 10),
      temperature: Math.round((baseTemp + (wave * 0.4)) * 10) / 10,
      loadPercentage: Math.max(5.0, Math.min(100.0, Math.round((baseLoad + (wave * 2.0)) * 10) / 10)),
      voltage: 400.0 + Math.sin(i * 0.5) * 3.0,
      current: Math.round(((basePower * 1000) / (Math.sqrt(3) * 400.0 * 0.92)) * 10) / 10,
      powerFactor: 0.92,
      status: machine?.status || 'RUNNING',
    });
  }

  res.json({
    success: true,
    count: generated.length,
    data: generated,
  });
}
