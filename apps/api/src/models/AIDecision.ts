import mongoose, { Schema, Document } from 'mongoose';
import { DecisionStatus, ProductionPriority, SimulatedCommandType } from '@powerguard/shared-types';

export interface IAIDecisionDocument extends Document {
  machineId: string;
  agent: string;
  problem: string;
  recommendation: string;
  expectedSavingKwh: number;
  confidence: number;
  status: DecisionStatus;
  affectedProduction: string;
  priority: ProductionPriority;
  explanation: {
    problem: string;
    evidence: string;
    analysis: string;
    recommendation: string;
    expectedImpact: string;
    risk: string;
    confidence: number;
  };
  simulatedCommand?: SimulatedCommandType;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

const AIDecisionSchema = new Schema<IAIDecisionDocument>(
  {
    machineId: { type: String, required: true },
    agent: { type: String, default: 'SupervisorAgent' },
    problem: { type: String, required: true },
    recommendation: { type: String, required: true },
    expectedSavingKwh: { type: Number, default: 0.0 },
    confidence: { type: Number, default: 0.85 },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'SIMULATED'],
      default: 'PENDING',
    },
    affectedProduction: { type: String, default: 'None' },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    explanation: {
      problem: { type: String, required: true },
      evidence: { type: String, required: true },
      analysis: { type: String, required: true },
      recommendation: { type: String, required: true },
      expectedImpact: { type: String, required: true },
      risk: { type: String, required: true },
      confidence: { type: Number, required: true },
    },
    simulatedCommand: { type: String },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

AIDecisionSchema.index({ status: 1, createdAt: -1 });
AIDecisionSchema.index({ machineId: 1 });

export const AIDecisionModel = mongoose.models.AIDecision || mongoose.model<IAIDecisionDocument>('AIDecision', AIDecisionSchema);
