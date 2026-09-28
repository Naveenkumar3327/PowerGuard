import mongoose, { Schema, Document } from 'mongoose';
import { MachineStatus, ProductionPriority, Department } from '@powerguard/shared-types';

export interface IMachineDocument extends Document {
  machineId: string;
  name: string;
  type: string;
  department: Department;
  status: MachineStatus;
  voltage: number;
  current: number;
  powerFactor: number;
  powerKw: number;
  energyKwh: number;
  loadPercentage: number;
  temperature: number;
  operatingHours: number;
  productionPriority: ProductionPriority;
  efficiencyScore: number;
  ratedPowerKw: number;
  lastMaintenanceDate?: Date;
  updatedAt: Date;
}

const MachineSchema = new Schema<IMachineDocument>(
  {
    machineId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    department: {
      type: String,
      enum: ['Production', 'Assembly', 'Packaging', 'Utilities', 'HVAC'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['RUNNING', 'IDLE', 'STANDBY', 'MAINTENANCE', 'OFFLINE', 'FAULT'],
      default: 'IDLE',
      index: true,
    },
    voltage: { type: Number, default: 400.0 },
    current: { type: Number, default: 0.0 },
    powerFactor: { type: Number, default: 0.90 },
    powerKw: { type: Number, default: 0.0 },
    energyKwh: { type: Number, default: 0.0 },
    loadPercentage: { type: Number, default: 0.0 },
    temperature: { type: Number, default: 30.0 },
    operatingHours: { type: Number, default: 0.0 },
    productionPriority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    efficiencyScore: { type: Number, default: 90.0 },
    ratedPowerKw: { type: Number, default: 30.0 },
    lastMaintenanceDate: { type: Date },
  },
  { timestamps: true }
);

export const MachineModel = mongoose.models.Machine || mongoose.model<IMachineDocument>('Machine', MachineSchema);
