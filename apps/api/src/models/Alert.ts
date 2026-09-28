import mongoose, { Schema, Document } from 'mongoose';
import { AlertSeverity, AlertStatus } from '@powerguard/shared-types';

export interface IAlertDocument extends Document {
  title: string;
  machineId: string;
  severity: AlertSeverity;
  detectedTime: Date;
  agent: string;
  description: string;
  recommendedAction: string;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
}

const AlertSchema = new Schema<IAlertDocument>(
  {
    title: { type: String, required: true },
    machineId: { type: String, required: true },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'HIGH', 'CRITICAL'],
      default: 'INFO',
    },
    detectedTime: { type: Date, default: Date.now },
    agent: { type: String, default: 'AlertIncidentAgent' },
    description: { type: String, required: true },
    recommendedAction: { type: String, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'ACTIVE',
    },
    acknowledgedBy: { type: String },
    acknowledgedAt: { type: Date },
    resolvedBy: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

AlertSchema.index({ status: 1, severity: 1 });
AlertSchema.index({ machineId: 1, createdAt: -1 });

export const AlertModel = mongoose.models.Alert || mongoose.model<IAlertDocument>('Alert', AlertSchema);
