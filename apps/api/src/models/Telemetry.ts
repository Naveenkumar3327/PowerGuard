import mongoose, { Schema, Document } from 'mongoose';
import { MachineStatus } from '@powerguard/shared-types';

export interface ITelemetryDocument extends Document {
  machineId: string;
  timestamp: Date;
  voltage: number;
  current: number;
  powerFactor: number;
  powerKw: number;
  energyKwh: number;
  loadPercentage: number;
  temperature: number;
  status: MachineStatus;
  isAnomaly: boolean;
}

const TelemetrySchema = new Schema<ITelemetryDocument>(
  {
    machineId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    voltage: { type: Number, required: true },
    current: { type: Number, required: true },
    powerFactor: { type: Number, required: true },
    powerKw: { type: Number, required: true },
    energyKwh: { type: Number, required: true },
    loadPercentage: { type: Number, required: true },
    temperature: { type: Number, required: true },
    status: { type: String, required: true },
    isAnomaly: { type: Boolean, default: false },
  },
  { timestamps: false }
);

// Fast time-series lookup
TelemetrySchema.index({ machineId: 1, timestamp: -1 });
TelemetrySchema.index({ timestamp: -1 });

export const TelemetryModel = mongoose.models.Telemetry || mongoose.model<ITelemetryDocument>('Telemetry', TelemetrySchema);
