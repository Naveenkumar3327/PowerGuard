import mongoose, { Schema, Document } from 'mongoose';
import { AIMode } from '@powerguard/shared-types';

export interface ISystemSettingDocument extends Document {
  factoryName: string;
  electricityTariff: number;
  peakTariff: number;
  emissionFactor: number;
  peakDemandThresholdKw: number;
  aiMode: AIMode;
  simulationSpeed: number;
  alertCooldownSeconds: number;
  forecastHorizonHours: number;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSettingDocument>(
  {
    factoryName: { type: String, default: 'Apex Precision Manufacturing Facility' },
    electricityTariff: { type: Number, default: 0.15 },
    peakTariff: { type: Number, default: 0.28 },
    emissionFactor: { type: Number, default: 0.42 },
    peakDemandThresholdKw: { type: Number, default: 160.0 },
    aiMode: {
      type: String,
      enum: ['AUTO', 'ASSISTED', 'MANUAL'],
      default: 'ASSISTED',
    },
    simulationSpeed: { type: Number, default: 1 },
    alertCooldownSeconds: { type: Number, default: 30 },
    forecastHorizonHours: { type: Number, default: 24 },
  },
  { timestamps: true }
);

export const SystemSettingModel = mongoose.models.SystemSetting || mongoose.model<ISystemSettingDocument>('SystemSetting', SystemSettingSchema);
