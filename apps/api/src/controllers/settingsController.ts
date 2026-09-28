import { Request, Response } from 'express';
import { AIMode } from '@powerguard/shared-types';
import { config } from '../config/environment';
import { orchestrator } from '../orchestration/AgentOrchestrator';
import { simulator } from '../simulator/SimulationEngine';
import { SystemSettingModel } from '../models';
import { isConnectedToDb } from '../config/database';

export async function getSettings(req: Request, res: Response): Promise<void> {
  const settings = {
    factoryName: 'Apex Precision Manufacturing Digital Twin',
    electricityTariff: config.energyTariff,
    peakTariff: config.peakTariff,
    emissionFactor: config.emissionFactor,
    peakDemandThresholdKw: config.peakDemandThresholdKw,
    aiMode: orchestrator.getAIMode(),
    simulationSpeed: simulator.getStatus().speedMultiplier,
    alertCooldownSeconds: 30,
    forecastHorizonHours: 24,
  };

  res.json({
    success: true,
    data: settings,
  });
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const updates = req.body;

  if (updates.electricityTariff !== undefined) config.energyTariff = parseFloat(updates.electricityTariff);
  if (updates.peakTariff !== undefined) config.peakTariff = parseFloat(updates.peakTariff);
  if (updates.emissionFactor !== undefined) config.emissionFactor = parseFloat(updates.emissionFactor);
  if (updates.peakDemandThresholdKw !== undefined) config.peakDemandThresholdKw = parseFloat(updates.peakDemandThresholdKw);
  
  if (updates.aiMode) {
    orchestrator.setAIMode(updates.aiMode as AIMode);
  }

  if (updates.simulationSpeed) {
    simulator.setSpeed(parseInt(updates.simulationSpeed, 10));
  }

  if (isConnectedToDb) {
    try {
      await SystemSettingModel.findOneAndUpdate({}, updates, { upsert: true, new: true });
    } catch {}
  }

  res.json({
    success: true,
    message: 'System settings updated successfully',
    data: {
      electricityTariff: config.energyTariff,
      peakTariff: config.peakTariff,
      emissionFactor: config.emissionFactor,
      peakDemandThresholdKw: config.peakDemandThresholdKw,
      aiMode: orchestrator.getAIMode(),
      simulationSpeed: simulator.getStatus().speedMultiplier,
    },
  });
}
