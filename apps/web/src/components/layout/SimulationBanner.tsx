'use client';

import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export function SimulationBanner() {
  const { summary } = useSocket();

  return (
    <aside aria-label="Simulation Mode Banner" className="bg-gradient-to-r from-emerald-950/40 via-surface-100 to-cyan-950/40 border-b border-emerald-500/20 px-4 py-1.5 text-xs flex items-center justify-between z-30">
      <div className="flex items-center space-x-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 inline" /> Simulation Mode:
        </span>
        <span className="text-slate-300 hidden sm:inline">
          Academic Digital Twin Active — All machine controls operate safely on virtualized industrial states.
        </span>
      </div>

      <div className="flex items-center space-x-3 font-mono text-[11px]">
        <span className="bg-surface-200/80 px-2 py-0.5 rounded border border-white/5 text-slate-300">
          Speed: <strong className="text-emerald-400">{summary.simulationSpeed}X</strong>
        </span>
        <span className="bg-surface-200/80 px-2 py-0.5 rounded border border-white/5 text-slate-300">
          AI Mode: <strong className={summary.aiMode === 'AUTO' ? 'text-cyan-400' : 'text-amber-400'}>{summary.aiMode}</strong>
        </span>
        <span className="hidden md:flex items-center gap-1 text-emerald-400/80">
          <ShieldCheck className="w-3.5 h-3.5" /> Zero Hardware Risk
        </span>
      </div>
    </aside>
  );
}
