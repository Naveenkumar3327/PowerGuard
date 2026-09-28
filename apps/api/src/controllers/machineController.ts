import { Request, Response } from 'express';
import { simulator } from '../simulator/SimulationEngine';
import { MachineModel } from '../models';
import { isConnectedToDb } from '../config/database';

export async function getMachines(req: Request, res: Response): Promise<void> {
  const machines = simulator.getMachines();
  res.json({
    success: true,
    count: machines.length,
    data: machines,
  });
}

export async function getMachineById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const machine = simulator.getMachine(id);

  if (!machine) {
    res.status(404).json({ success: false, error: `Machine with ID ${id} not found` });
    return;
  }

  res.json({
    success: true,
    data: machine,
  });
}

export async function updateMachine(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const updates = req.body;
  const machine = simulator.getMachine(id);

  if (!machine) {
    res.status(404).json({ success: false, error: `Machine with ID ${id} not found` });
    return;
  }

  // Update in-memory machine object
  Object.assign(machine, updates);

  if (isConnectedToDb) {
    try {
      await MachineModel.findOneAndUpdate({ machineId: id }, updates, { new: true });
    } catch {}
  }

  res.json({
    success: true,
    message: `Machine ${id} updated successfully`,
    data: machine,
  });
}
