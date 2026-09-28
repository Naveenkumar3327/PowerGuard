import { Request, Response } from 'express';
import { SimulatedCommandType, MachineCommand } from '@powerguard/shared-types';
import { simulator } from '../simulator/SimulationEngine';
import { AuthRequest } from '../middleware/authMiddleware';

const inMemoryCommands: MachineCommand[] = [];

export async function getCommands(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    count: inMemoryCommands.length,
    data: inMemoryCommands,
  });
}

export async function simulateCommand(req: AuthRequest, res: Response): Promise<void> {
  const { machineId, command, parameters } = req.body;

  if (!machineId || !command) {
    res.status(400).json({ success: false, error: 'machineId and command are required' });
    return;
  }

  const result = simulator.executeSimulatedCommand(machineId, command as SimulatedCommandType, parameters);

  const cmdRecord: MachineCommand = {
    id: `cmd-${Date.now()}`,
    machineId,
    command: command as SimulatedCommandType,
    parameters,
    source: req.user?.name || 'Manual Operator Console',
    simulation: true,
    status: result.success ? 'EXECUTED' : 'FAILED',
    timestamp: new Date().toISOString(),
  };

  inMemoryCommands.unshift(cmdRecord);
  if (inMemoryCommands.length > 100) inMemoryCommands.pop();

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.message,
      command: cmdRecord,
    });
    return;
  }

  res.json({
    success: true,
    message: result.message,
    command: cmdRecord,
    machine: result.machine,
  });
}
