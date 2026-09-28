'use client';

import React, { useState, useEffect } from 'react';
import { PlayCircle, Pause, Zap, AlertTriangle, RotateCcw, Settings, ChevronRight } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DemoScenarioId } from '@powerguard/shared-types';

const SCENARIOS: { id: DemoScenarioId; label: string; desc: string; color: string }[] = [
  { id: 'NORMAL', label: 'Normal Operation', desc: 'Balanced load across all machines', color: 'emerald' },
  { id: 'HIGH_CONSUMPTION', label: 'High Consumption', desc: 'M-003 surge to 98% load', color: 'amber' },
  { id: 'ANOMALY', label: 'Machine Anomaly', desc: 'M-002 PF drops to 0.68 + thermal spike', color: 'orange' },
  { id: 'PEAK_DEMAND', label: 'Peak Demand Threat', desc: 'Factory approaches 160 kW threshold', color: 'red' },
  { id: 'IDLE_MACHINE', label: 'Idle Machine Waste', desc: 'M-004 idle drawing 11 kW', color: 'cyan' },
  { id: 'FAULT', label: 'Machine Fault', desc: 'M-007 trips thermal safety at 89°C', color: 'red' },
  { id: 'ENERGY_OPTIMIZATION', label: 'Full Optimization', desc: 'Idle → Standby → Savings loop', color: 'purple' },
];

const FAULTS = [
  { machineId: 'M-001', label: 'CNC Lathe' },
  { machineId: 'M-002', label: 'Air Compressor' },
  { machineId: 'M-003', label: 'Injection Molder' },
  { machineId: 'M-007', label: 'Spot Welder' },
];

const COLOR_MAP: Record<string, string> = {
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  orange: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  red: 'border-red-500/30 bg-red-500/10 text-red-400',
  cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
};

export default function SimulationPage() {
  const { summary } = useSocket();
  const { user } = useAuth();
  const [status, setStatus] = useState<any>(null);
  const [activeScenario, setActiveScenario] = useState<DemoScenarioId>('NORMAL');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState('');

  const canControl = ['ADMIN', 'ENERGY_MANAGER', 'OPERATOR'].includes(user?.role || '');

  useEffect(() => {
    fetchApi('/api/simulation/status').then(r => setStatus(r.data)).catch(() => {});
    const i = setInterval(() => fetchApi('/api/simulation/status').then(r => setStatus(r.data)).catch(() => {}), 5000);
    return () => clearInterval(i);
  }, []);

  const callApi = async (path: string, body: object = {}) => {
    try {
      const res = await fetchApi(path, { method: 'POST', body: JSON.stringify(body) });
      setMsg(res.message || 'Done');
      setTimeout(() => setMsg(''), 4000);
      const updated = await fetchApi('/api/simulation/status');
      setStatus(updated.data);
      return res;
    } catch (e: any) { setMsg(e.message); }
  };

  const handleScenario = async (id: DemoScenarioId) => {
    setLoading(id);
    await callApi('/api/simulation/scenario', { scenario: id });
    setActiveScenario(id);
    setLoading('');
  };

  const handleSpeed = async (speed: number) => {
    setLoading(`speed-${speed}`);
    await callApi('/api/simulation/speed', { speed });
    setLoading('');
  };

  const handleFault = async (machineId: string) => {
    setLoading(`fault-${machineId}`);
    await callApi('/api/simulation/fault', { machineId });
    setLoading('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Simulation & Demos" subtitle="Control the digital twin simulation engine and trigger demonstration scenarios" icon={PlayCircle}>
        {msg && <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">{msg}</span>}
      </PageHeader>

      {/* Status */}
      {status && (
        <div className="card-industrial p-4 rounded-2xl border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2"><Settings className="w-4 h-4 text-cyan-400" /> Simulation Status</h2>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border ${status.isRunning ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-400 bg-white/5 border-white/10'}`}>
                <span className={`w-2 h-2 rounded-full ${status.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                {status.isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-xs text-slate-400 mb-1">Speed</div><div className="text-xl font-bold text-white">{status.speedMultiplier}x</div></div>
            <div><div className="text-xs text-slate-400 mb-1">Machines</div><div className="text-xl font-bold text-white">{status.machineCount}</div></div>
            <div><div className="text-xs text-slate-400 mb-1">Tick</div><div className="text-xl font-bold text-white">{status.tickIntervalMs}ms</div></div>
          </div>
        </div>
      )}

      {/* Start/Stop controls */}
      {canControl && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            id="sim-start-btn"
            onClick={() => callApi('/api/simulation/start')}
            className="card-industrial p-4 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 flex items-center gap-2 justify-center text-sm font-medium transition-all"
          >
            <PlayCircle className="w-5 h-5" /> Start Simulation
          </button>
          <button
            id="sim-stop-btn"
            onClick={() => callApi('/api/simulation/stop')}
            className="card-industrial p-4 rounded-xl border border-red-500/20 hover:border-red-500/40 text-red-400 flex items-center gap-2 justify-center text-sm font-medium transition-all"
          >
            <Pause className="w-5 h-5" /> Stop Simulation
          </button>
          <button
            id="sim-reset-btn"
            onClick={() => handleScenario('NORMAL')}
            className="card-industrial p-4 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 flex items-center gap-2 justify-center text-sm font-medium transition-all"
          >
            <RotateCcw className="w-5 h-5" /> Reset to Normal
          </button>
        </div>
      )}

      {/* Speed control */}
      {canControl && (
        <div className="card-industrial p-4 rounded-2xl border border-white/8">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Simulation Speed</h2>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 5, 10].map(speed => (
              <button
                key={speed}
                id={`sim-speed-${speed}x`}
                onClick={() => handleSpeed(speed)}
                disabled={loading === `speed-${speed}`}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  summary.simulationSpeed === speed
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Demo scenarios */}
      <div className="card-industrial p-4 rounded-2xl border border-white/8">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-purple-400" /> Demo Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {SCENARIOS.map(sc => {
            const colorClass = COLOR_MAP[sc.color] || COLOR_MAP.emerald;
            const isActive = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                id={`scenario-${sc.id.toLowerCase()}`}
                onClick={() => handleScenario(sc.id)}
                disabled={!canControl || loading === sc.id}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isActive ? colorClass : 'bg-white/3 border-white/8 hover:border-white/20 text-slate-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{sc.label}</span>
                  {loading === sc.id ? (
                    <div className="w-4 h-4 border border-current/40 border-t-current rounded-full animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  )}
                </div>
                <p className="text-[11px] opacity-70">{sc.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fault injection */}
      {canControl && (
        <div className="card-industrial p-4 rounded-2xl border border-red-500/15">
          <h2 className="text-sm font-semibold text-red-300 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> Fault Injection</h2>
          <p className="text-xs text-slate-400 mb-3">Simulate a machine fault to test the anomaly detection and alert pipeline.</p>
          <div className="flex flex-wrap gap-2">
            {FAULTS.map(f => (
              <button
                key={f.machineId}
                id={`inject-fault-${f.machineId}`}
                onClick={() => handleFault(f.machineId)}
                disabled={!!loading}
                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
              >
                {loading === `fault-${f.machineId}` ? '...' : `⚡ ${f.machineId} – ${f.label}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
