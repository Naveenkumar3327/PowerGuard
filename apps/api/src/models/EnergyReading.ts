import mongoose, { Schema, Document } from 'mongoose';

export interface IEnergyReadingDocument extends Document {
  timestamp: Date;
  totalEnergyKwh: number;
  totalPowerKw: number;
  baselineKwh: number;
  actualKwh: number;
  savingsKwh: number;
  departmentBreakdown: {
    department: string;
    consumptionKwh: number;
    cost: number;
  }[];
  createdAt: Date;
}

const EnergyReadingSchema = new Schema<IEnergyReadingDocument>(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    totalEnergyKwh: { type: Number, required: true },
    totalPowerKw: { type: Number, required: true },
    baselineKwh: { type: Number, required: true },
    actualKwh: { type: Number, required: true },
    savingsKwh: { type: Number, default: 0.0 },
    departmentBreakdown: [
      {
        department: { type: String, required: true },
        consumptionKwh: { type: Number, required: true },
        cost: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

EnergyReadingSchema.index({ timestamp: -1 });

export const EnergyReadingModel = mongoose.models.EnergyReading || mongoose.model<IEnergyReadingDocument>('EnergyReading', EnergyReadingSchema);
