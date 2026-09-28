'use client';

import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { AIDecision } from '@powerguard/shared-types';
import { DecisionModal } from '../common/DecisionModal';
import { Sparkles, CheckCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export function RecentDecisionsTable() {
  const { decisions, refreshData } = useSocket();
  const { user } = useAuth();
  const [selectedDecision, setSelectedDecision] = useState<AIDecision | null>(null);

  const canAction = user?.role === 'ADMIN' || user?.role === 'ENERGY_MANAGER' || user?.role === 'OPERATOR';

  return (
    <div className="card-industrial p-5 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2.5">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AI Recommendations & Explainable Actions
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Coordinated multi-agent interventions requiring review or automatically dispatched
          </span>
        </div>

        <Link
          href="/decisions"
          className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          View All Decisions →
        </Link>
      </div>

      <div className="overflow-x-auto flex-1">
        {decisions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
            No pending optimization interventions at this time. All machines optimized.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="pb-2">Machine</th>
                <th className="pb-2">Recommendation</th>
                <th className="pb-2">Expected Saving</th>
                <th className="pb-2">Confidence</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {decisions.slice(0, 5).map((dec) => (
                <tr key={dec.id} className="hover:bg-surface-100/50 transition-colors">
                  <td className="py-2.5 font-mono font-semibold text-white">
                    {dec.machineId}
                  </td>
                  <td className="py-2.5 text-slate-200">
                    <span className="font-semibold text-emerald-400 font-mono">
                      {dec.recommendation}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-slate-300">
                    ~{dec.expectedSavingKwh.toFixed(1)} kWh/hr
                  </td>
                  <td className="py-2.5 font-mono text-slate-300">
                    {(dec.confidence * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        dec.status === 'EXECUTED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : dec.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : dec.status === 'REJECTED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}
                    >
                      {dec.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => setSelectedDecision(dec)}
                      className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-50 border border-white/10 text-slate-300 hover:text-white transition-colors text-[11px] font-medium inline-flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3 text-cyan-400" />
                      Explain
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedDecision && (
        <DecisionModal
          decision={selectedDecision}
          onClose={() => setSelectedDecision(null)}
          onActionComplete={refreshData}
        />
      )}
    </div>
  );
}
