'use client';

import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Zap, 
  ShieldAlert, 
  Cpu, 
  TrendingDown 
} from 'lucide-react';
import { AIDecision } from '@powerguard/shared-types';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';

interface Props {
  decision: AIDecision | null;
  onClose: () => void;
  onActionComplete?: () => void;
}

export function DecisionModal({ decision, onClose, onActionComplete }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  if (!decision) return null;

  const canAction = user?.role === 'ADMIN' || user?.role === 'ENERGY_MANAGER' || user?.role === 'OPERATOR';

  const handleApprove = async () => {
    setLoading(true);
    try {
      await fetchApi(`/api/decisions/${decision.id}/approve`, { method: 'POST' });
      setMsg('Decision approved and safely executed in Digital Twin!');
      setTimeout(() => {
        onActionComplete?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await fetchApi(`/api/decisions/${decision.id}/reject`, { method: 'POST' });
      setMsg('Decision rejected.');
      setTimeout(() => {
        onActionComplete?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-200 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-surface-300/80 px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Explainable AI Rationale & Decision
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Machine ID: <strong className="text-white">{decision.machineId}</strong> | Agent: {decision.agent}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-100 hover:bg-surface-50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-sm">
          {msg && (
            <div className={`p-3 rounded-lg text-xs font-mono ${msg.startsWith('Error') ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              {msg}
            </div>
          )}

          {/* Section 1: Problem */}
          <div className="bg-surface-300/50 p-3.5 rounded-xl border border-white/5">
            <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-3.5 h-3.5" /> 1. Identified Problem
            </div>
            <p className="text-slate-200">{decision.explanation.problem}</p>
          </div>

          {/* Section 2: Concrete Telemetry Evidence */}
          <div className="bg-surface-300/50 p-3.5 rounded-xl border border-white/5">
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Cpu className="w-3.5 h-3.5" /> 2. Grounded Telemetry Evidence
            </div>
            <p className="text-slate-300 font-mono text-xs bg-surface-400/60 p-2 rounded border border-white/5">
              {decision.explanation.evidence}
            </p>
          </div>

          {/* Section 3: Multi-Agent Analysis */}
          <div className="bg-surface-300/50 p-3.5 rounded-xl border border-white/5">
            <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5" /> 3. Multi-Agent Coordinated Analysis
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">{decision.explanation.analysis}</p>
          </div>

          {/* Section 4: Recommendation & Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-surface-300/50 p-3.5 rounded-xl border border-white/5">
              <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <CheckCircle className="w-3.5 h-3.5" /> Proposed Control Action
              </div>
              <p className="text-white font-mono font-bold text-sm bg-emerald-950/40 p-2 rounded border border-emerald-500/20 text-emerald-300">
                {decision.simulatedCommand || decision.recommendation}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Simulation Mode: Target state strictly virtualized</span>
            </div>

            <div className="bg-surface-300/50 p-3.5 rounded-xl border border-white/5">
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-3.5 h-3.5" /> Expected Impact & Savings
              </div>
              <p className="text-white text-xs">{decision.explanation.expectedImpact}</p>
              <div className="mt-2 flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Model Confidence:</span>
                <span className="text-emerald-400 font-bold">{(decision.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Section 5: Risk & Production Constraints */}
          <div className="bg-surface-300/50 p-3.5 rounded-xl border border-white/5">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Operational Risk Assessment
            </div>
            <p className="text-slate-300 text-xs">{decision.explanation.risk}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-surface-300/80 px-6 py-4 border-t border-white/5 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Status: <strong className="text-white uppercase">{decision.status}</strong>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-100 hover:bg-surface-50 text-slate-300 text-xs font-medium transition-colors"
            >
              Close
            </button>

            {canAction && decision.status === 'PENDING' && (
              <>
                <button
                  disabled={loading}
                  onClick={handleReject}
                  className="px-4 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  disabled={loading}
                  onClick={handleApprove}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve & Simulate
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
