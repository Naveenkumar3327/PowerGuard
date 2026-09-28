import mongoose, { Schema, Document } from 'mongoose';
import { SimulatedCommandType } from '@powerguard/shared-types';

export interface IMachineCommandDocument extends Document {
  machineId: string;
  command: SimulatedCommandType;
  parameters?: Record<string, any>;
  source: string;
  simulation: boolean;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  createdAt: Date;
}

const MachineCommandSchema = new Schema<IMachineCommandDocument>(
  {
    machineId: { type: String, required: true },
    command: { type: String, required: true },
    parameters: { type: Schema.Types.Mixed },
    source: { type: String, default: 'OptimizationAgent' },
    simulation: { type: Boolean, default: true, required: true }, // Strictly simulation
    status: {
      type: String,
      enum: ['PENDING', 'EXECUTED', 'FAILED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

MachineCommandSchema.index({ machineId: 1, createdAt: -1 });

export const MachineCommandModel = mongoose.models.MachineCommand || mongoose.model<IMachineCommandDocument>('MachineCommand', MachineCommandSchema);
