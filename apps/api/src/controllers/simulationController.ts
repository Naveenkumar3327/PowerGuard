import { Request, Response } from 'express';
import { DemoScenarioId } from '@powerguard/shared-types';
import { simulator } from '../simulator/SimulationEngine';
import { orchestrator } from '../orchestration/AgentOrchestrator';

export async function getSimulationStatus(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    data: simulator.getStatus(),
  });
}

export async function startSimulation(req: Request, res: Response): Promise<void> {
  simulator.start();
  orchestrator.broadcastSummary();
  res.json({
    success: true,
    message: 'Machine Simulation started',
    data: simulator.getStatus(),
  });
}

export async function stopSimulation(req: Request, res: Response): Promise<void> {
  simulator.stop();
  orchestrator.broadcastSummary();
  res.json({
    success: true,
    message: 'Machine Simulation paused',
    data: simulator.getStatus(),
  });
}

export async function setSimulationSpeed(req: Request, res: Response): Promise<void> {
  const { speed } = req.body;
  const speedNum = parseInt(speed, 10) || 1;
  simulator.setSpeed(speedNum);
  orchestrator.broadcastSummary();
  res.json({
    success: true,
    message: `Simulation speed set to ${speedNum}X`,
    data: simulator.getStatus(),
  });
}

export async function setScenario(req: Request, res: Response): Promise<void> {
  const { scenario } = req.body;
  if (!scenario) {
    res.status(400).json({ success: false, error: 'Scenario ID is required' });
    return;
  }

  const result = simulator.setScenario(scenario as DemoScenarioId);
  orchestrator.broadcastSummary();

  res.json({
    success: true,
    message: result.message,
    scenario: result.scenario,
    data: simulator.getStatus(),
  });
}

export async function injectFault(req: Request, res: Response): Promise<void> {
  const { machineId, faultType } = req.body;
  if (!machineId) {
    res.status(400).json({ success: false, error: 'machineId is required' });
    return;
  }

  const ok = simulator.injectFault(machineId, faultType || 'OVERHEATING');
  if (!ok) {
    res.status(404).json({ success: false, error: `Machine ${machineId} not found` });
    return;
  }

  orchestrator.broadcastSummary();
  res.json({
    success: true,
    message: `Fault [${faultType || 'OVERHEATING'}] injected into machine ${machineId}. Status set to FAULT.`,
  });
}
