'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Eye, Shield } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import { Alert } from '@powerguard/shared-types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, WARNING: 2, INFO: 3 };

function AlertCard({ alert, onAck, onResolve, canAct }: {
  alert: Alert;
  onAck: (id: string) => void;
  onResolve: (id: string) => void;
  canAct: boolean;
}) {
  const borderColor =
    alert.severity === 'CRITICAL' ? 'border-red-500/40' :
    alert.severity === 'HIGH' ? 'border-orange-500/40' :
    alert.severity === 'WARNING' ? 'border-amber-500/35' : 'border-white/10';

  const iconColor =
    alert.severity === 'CRITICAL' ? 'text-red-400' :
    alert.severity === 'HIGH' ? 'text-orange-400' :
    alert.severity === 'WARNING' ? 'text-amber-300' : 'text-slate-400';

  return (
    <div id={`alert-${alert.id}`} className={`card-industrial border-l-2 p-4 ${borderColor} transition-all`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
            <AlertTriangle className="w-4.5 h-4.5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-semibold text-white">{alert.title}</h3>
              <StatusBadge status={alert.severity} />
              <StatusBadge status={alert.status} />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">{alert.description}</p>
            {alert.recommendedAction && (
              <div className="p-2 rounded-lg bg-white/3 border border-white/5 text-[11px] text-cyan-300 flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-cyan-400" />
                <span>{alert.recommendedAction}</span>
              </div>
            )}
            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-mono">
              <span>Machine: {alert.machineId}</span>
              <span>·</span>
              <span>Agent: {alert.agent}</span>
              <span>·</span>
              <span>{new Date(alert.detectedTime).toLocaleString()}</span>
            </div>
          </div>
        </div>
        {canAct && alert.status === 'ACTIVE' && (
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              id={`ack-alert-${alert.id}`}
              onClick={() => onAck(alert.id)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs hover:bg-amber-500/25 transition-all font-medium flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> Acknowledge
            </button>
            <button
              id={`resolve-alert-${alert.id}`}
              onClick={() => onResolve(alert.id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs hover:bg-emerald-500/25 transition-all font-medium flex items-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Resolve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { alerts, refreshData } = useSocket();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');

  const canAct = ['ADMIN', 'ENERGY_MANAGER', 'OPERATOR'].includes(user?.role || '');

  const filtered = (filter === 'ALL' ? alerts : alerts.filter(a => a.status === filter))
    .slice()
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9));

  const handleAck = async (id: string) => {
    try { await fetchApi(`/api/alerts/${id}/acknowledge`, { method: 'POST' }); await refreshData(); } catch {}
  };
  const handleResolve = async (id: string) => {
    try { await fetchApi(`/api/alerts/${id}/resolve`, { method: 'POST' }); await refreshData(); } catch {}
  };

  const active = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Alerts & Incidents" subtitle="Industrial safety events, anomaly detections, and thermal warnings" icon={AlertTriangle} iconColor="text-red-400">
        {active > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-mono text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            {active} Active Alert{active !== 1 ? 's' : ''}
          </span>
        )}
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active', value: alerts.filter(a => a.status === 'ACTIVE').length, color: 'text-red-400' },
          { label: 'Acknowledged', value: alerts.filter(a => a.status === 'ACKNOWLEDGED').length, color: 'text-amber-400' },
          { label: 'Resolved', value: alerts.filter(a => a.status === 'RESOLVED').length, color: 'text-emerald-400' },
          { label: 'Critical', value: alerts.filter(a => a.severity === 'CRITICAL').length, color: 'text-red-500' },
        ].map(k => (
          <div key={k.label} className="card-industrial p-4 rounded-xl border border-white/8">
            <div className="text-xs text-slate-400 mb-1">{k.label}</div>
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'] as const).map(f => (
          <button
            key={f}
            id={`alerts-filter-${f.toLowerCase()}`}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
              filter === f ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="command-label text-[9px]">Incident timeline · newest critical events first</div>
      <div className="relative space-y-3 border-l border-white/[0.08] pl-4 sm:pl-5">
        {filtered.length === 0 ? (
          <div className="-ml-4 border border-dashed border-white/10 py-12 text-center text-slate-500 sm:-ml-5">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="command-label">No active incidents</p>
            <p className="mt-1 text-xs">Factory operating within monitored energy limits.</p>
          </div>
        ) : (
          filtered.map((alert) => (
            <div key={alert.id} className="relative before:absolute before:-left-[21px] before:top-5 before:h-2 before:w-2 before:border before:border-[#05080c] before:bg-cyan-200 sm:before:-left-[26px]">
              <AlertCard alert={alert} onAck={handleAck} onResolve={handleResolve} canAct={canAct} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
