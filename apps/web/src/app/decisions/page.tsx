'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Brain, AlertCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import { AIDecision } from '@powerguard/shared-types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';

function DecisionRow({ decision, onApprove, onReject, canAct }: {
  decision: AIDecision;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  canAct: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const exp = decision.explanation as any;

  return (
    <div id={`decision-${decision.id}`} className="card-industrial rounded-xl border border-white/8 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono text-slate-400">{decision.machineId}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono text-cyan-400">{decision.agent}</span>
              <StatusBadge status={decision.status} />
              {decision.priority && <StatusBadge status={decision.priority} size="sm" />}
            </div>
            <h3 className="text-sm font-semibold text-white leading-tight mb-1">{decision.recommendation}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{decision.problem}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-emerald-400">{(decision.confidence * 100).toFixed(0)}%</div>
            <div className="text-[10px] text-slate-500 font-mono">confidence</div>
            <div className="text-xs text-emerald-400 mt-1 font-mono">−{decision.expectedSavingKwh?.toFixed(1)} kWh</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Brain className="w-3.5 h-3.5" />
            {expanded ? 'Hide' : 'View'} AI Explanation
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <div className="flex-1" />
          {decision.status === 'PENDING' && canAct && (
            <>
              <button
                id={`approve-${decision.id}`}
                onClick={() => onApprove(decision.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs hover:bg-emerald-500/25 transition-all font-medium"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                id={`reject-${decision.id}`}
                onClick={() => onReject(decision.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs hover:bg-red-500/25 transition-all font-medium"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}
          <span className="text-[10px] text-slate-600 font-mono">{new Date(decision.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {expanded && exp && (
        <div className="border-t border-white/5 bg-white/2 p-4 space-y-3">
          {[
            { label: 'Problem', value: exp.problem, color: 'text-red-400' },
            { label: 'Evidence', value: exp.evidence, color: 'text-amber-400' },
            { label: 'Analysis', value: exp.analysis, color: 'text-cyan-400' },
            { label: 'Recommendation', value: exp.recommendation, color: 'text-purple-400' },
            { label: 'Expected Impact', value: exp.expectedImpact, color: 'text-emerald-400' },
            { label: 'Risk Assessment', value: exp.risk, color: 'text-slate-400' },
          ].filter(e => e.value).map(e => (
            <div key={e.label}>
              <div className={`text-[10px] font-mono uppercase tracking-wider ${e.color} mb-1`}>{e.label}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{e.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DecisionsPage() {
  const { decisions, refreshData } = useSocket();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'EXECUTED' | 'REJECTED'>('ALL');
  const [actioning, setActioning] = useState('');

  const canAct = ['ADMIN', 'ENERGY_MANAGER', 'OPERATOR'].includes(user?.role || '');

  const filtered = filter === 'ALL' ? decisions : decisions.filter(d => d.status === filter);

  const handleApprove = async (id: string) => {
    setActioning(id);
    try {
      await fetchApi(`/api/decisions/${id}/approve`, { method: 'POST', body: JSON.stringify({ operatorName: user?.name }) });
      await refreshData();
    } catch {} finally { setActioning(''); }
  };

  const handleReject = async (id: string) => {
    setActioning(id);
    try {
      await fetchApi(`/api/decisions/${id}/reject`, { method: 'POST', body: JSON.stringify({ operatorName: user?.name }) });
      await refreshData();
    } catch {} finally { setActioning(''); }
  };

  const pending = decisions.filter(d => d.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <PageHeader title="AI Decision Center" subtitle="Review, approve, or reject AI-generated machine control recommendations" icon={Sparkles}>
        {pending > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            {pending} Pending Approval
          </span>
        )}
      </PageHeader>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'EXECUTED', 'REJECTED'] as const).map(f => (
          <button
            key={f}
            id={`decisions-filter-${f.toLowerCase()}`}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
              filter === f
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
            }`}
          >
            {f} {f !== 'ALL' && `(${decisions.filter(d => d.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending', value: decisions.filter(d => d.status === 'PENDING').length, icon: Clock, color: 'text-amber-400' },
          { label: 'Executed', value: decisions.filter(d => d.status === 'EXECUTED').length, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Rejected', value: decisions.filter(d => d.status === 'REJECTED').length, icon: XCircle, color: 'text-red-400' },
        ].map(k => (
          <div key={k.label} className="card-industrial p-4 rounded-xl border border-white/8">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Decisions list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No {filter !== 'ALL' ? filter.toLowerCase() : ''} decisions found</p>
          </div>
        ) : (
          filtered.map(dec => (
            <DecisionRow
              key={dec.id}
              decision={dec}
              onApprove={handleApprove}
              onReject={handleReject}
              canAct={canAct && actioning !== dec.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
