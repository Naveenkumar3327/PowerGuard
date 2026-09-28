'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Activity, Crosshair, Factory, Gauge, Thermometer, Zap } from 'lucide-react';
import type { Machine } from '@powerguard/shared-types';
import { useSocket } from '../../context/SocketContext';
import { fetchApi } from '../../lib/api';

const FactoryScene = dynamic(() => import('./FactoryScene'), {
  ssr: false,
  loading: () => <div className="flex h-full min-h-[320px] items-center justify-center font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">Digital twin initializing</div>,
});

export function FactoryTwin({ compact = false }: { compact?: boolean }) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { telemetries, isConnected } = useSocket();

  useEffect(() => {
    fetchApi('/api/machines')
      .then((response) => {
        if (response.data) setMachines(response.data);
      })
      .catch(() => setLoadError(true));
  }, []);

  const liveMachines = machines.map((machine) => {
    const live = telemetries.find((entry) => entry.machineId === machine.machineId);
    return live ? {
      ...machine,
      status: live.status,
      powerKw: live.powerKw,
      loadPercentage: live.loadPercentage,
      temperature: live.temperature,
      voltage: live.voltage,
      current: live.current,
      powerFactor: live.powerFactor,
    } : machine;
  });
  const selectedMachine = liveMachines.find((machine) => machine.machineId === selectedId);
  const totalPower = liveMachines.reduce((total, machine) => total + machine.powerKw, 0);
  const runningCount = liveMachines.filter((machine) => machine.status === 'RUNNING').length;

  return (
    <section className={`card-industrial scanline relative overflow-hidden ${compact ? 'min-h-[400px]' : 'min-h-[560px]'}`} aria-label="Interactive digital factory twin">
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 border-b border-white/[0.07] bg-[#0a1016]/85 px-4 py-3 backdrop-blur-sm sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-cyan-200/20 bg-cyan-200/[0.06] text-cyan-200"><Factory className="h-4 w-4" /></div>
          <div className="min-w-0">
            <h2 className="truncate text-xs font-semibold tracking-[0.12em] text-slate-100">DIGITAL FACTORY TWIN</h2>
            <p className="command-label mt-1 truncate text-[9px]">Live equipment topology · interactive floor</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-right">
          <div className="hidden sm:block"><div className="command-label text-[9px]">Active units</div><div className="telemetry-value mt-1 text-xs text-slate-200">{runningCount} / {liveMachines.length}</div></div>
          <div><div className="command-label text-[9px]">Total load</div><div className="telemetry-value mt-1 text-xs text-cyan-100">{totalPower.toFixed(1)} kW</div></div>
        </div>
      </div>

      <div className="absolute inset-0 pt-[58px]">
        {liveMachines.length > 0 ? (
          <FactoryScene machines={liveMachines} selectedId={selectedId} onSelect={setSelectedId} />
        ) : (
          <div className="flex h-full items-center justify-center px-5 text-center">
            <div><Activity className="mx-auto mb-3 h-5 w-5 text-cyan-200/70" /><p className="command-label">{loadError ? 'Factory data unavailable' : 'Waiting for machine telemetry'}</p><p className="mt-2 text-xs text-slate-500">{loadError ? 'Reconnect to the API to load the digital twin.' : 'Equipment records will appear when the API responds.'}</p></div>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 border border-white/[0.08] bg-[#080e13]/90 px-2.5 py-2 backdrop-blur sm:bottom-4 sm:left-4">
        <span className={`status-dot h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-300 text-emerald-300' : 'bg-amber-300 text-amber-300'}`} />
        <span className="command-label text-[8px]">{isConnected ? 'Telemetry streaming' : 'Reconnecting'}</span>
        <span className="mx-1 h-3 border-l border-white/10" />
        <Crosshair className="h-3 w-3 text-slate-500" />
        <span className="command-label hidden text-[8px] sm:inline">Select equipment to inspect</span>
      </div>

      {selectedMachine && (
        <aside className="absolute bottom-14 right-3 z-20 w-[min(260px,calc(100%-24px))] border border-cyan-200/20 bg-[#0a1118]/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-4 sm:right-4" aria-label={`${selectedMachine.name} live details`}>
          <div className="flex items-start justify-between gap-3">
            <div><span className="command-label text-cyan-200">{selectedMachine.machineId}</span><h3 className="mt-1 text-sm font-semibold text-white">{selectedMachine.name}</h3><p className="mt-1 text-[10px] uppercase text-slate-500">{selectedMachine.status} · {selectedMachine.department}</p></div>
            <button className="text-[10px] text-slate-500 hover:text-white" aria-label="Close machine details" onClick={() => setSelectedId(null)}>CLOSE</button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/[0.08] pt-3">
            <TwinMetric icon={Zap} label="Power" value={`${selectedMachine.powerKw.toFixed(1)} kW`} />
            <TwinMetric icon={Gauge} label="Load" value={`${selectedMachine.loadPercentage.toFixed(0)}%`} />
            <TwinMetric icon={Thermometer} label="Temperature" value={`${selectedMachine.temperature.toFixed(1)}°C`} />
            <TwinMetric icon={Activity} label="Efficiency" value={`${selectedMachine.efficiencyScore.toFixed(0)}%`} />
          </div>
        </aside>
      )}
    </section>
  );
}

function TwinMetric({ icon: Icon, label, value }: { icon: typeof Zap; label: string; value: string }) {
  return <div><div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-slate-500"><Icon className="h-3 w-3 text-cyan-200/70" />{label}</div><div className="telemetry-value mt-1 text-xs text-slate-100">{value}</div></div>;
}