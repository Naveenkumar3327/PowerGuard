import mongoose, { Schema, Document } from 'mongoose';

export interface IEnergySavingDocument extends Document {
  machineId: string;
  action: string;
  baselinePowerKw: number;
  optimizedPowerKw: number;
  durationMinutes: number;
  energySavedKwh: number;
  costSaved: number;
  co2ReducedKg: number;
  createdAt: Date;
}

const EnergySavingSchema = new Schema<IEnergySavingDocument>(
  {
    machineId: { type: String, required: true },
    action: { type: String, required: true },
    baselinePowerKw: { type: Number, required: true },
    optimizedPowerKw: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    energySavedKwh: { type: Number, required: true },
    costSaved: { type: Number, required: true },
    co2ReducedKg: { type: Number, required: true },
  },
  { timestamps: true }
);

EnergySavingSchema.index({ createdAt: -1 });
EnergySavingSchema.index({ machineId: 1 });

export const EnergySavingModel = mongoose.models.EnergySaving || mongoose.model<IEnergySavingDocument>('EnergySaving', EnergySavingSchema);
