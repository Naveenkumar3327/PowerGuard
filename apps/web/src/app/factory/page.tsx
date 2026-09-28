'use client';

import Link from 'next/link';
import { ArrowUpRight, Factory, Gauge, Zap } from 'lucide-react';
import { FactoryTwin } from '../../components/factory/FactoryTwin';
import { useSocket } from '../../context/SocketContext';

export default function FactoryDigitalTwinPage() {
  const { summary, isConnected } = useSocket();

  return <div className="space-y-5">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="command-label mb-2 flex items-center gap-2 text-[9px]"><Factory className="h-3.5 w-3.5 text-cyan-200" /> DIGITAL TWIN / FLOOR 01</div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Factory floor</h1>
        <p className="mt-1 text-xs text-slate-500">Live equipment states, power draw, and AI-monitored production zones</p>
      </div>
      <Link href="/machines" className="inline-flex items-center gap-2 self-start border border-white/10 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-300 hover:border-cyan-200/30 hover:text-cyan-100 sm:self-auto">Fleet telemetry <ArrowUpRight className="h-3.5 w-3.5" /></Link>
    </div>
    <div className="grid grid-cols-3 border-y border-white/[0.08]">
      <div className="py-3 pr-3 sm:py-4"><div className="command-label text-[8px]">Equipment monitored</div><div className="telemetry-value mt-1.5 text-lg text-slate-100">{summary.totalMachines}<span className="ml-1 text-xs text-slate-500">units</span></div></div>
      <div className="border-l border-white/[0.08] px-3 py-3 sm:px-5 sm:py-4"><div className="command-label text-[8px]">Active fleet</div><div className="telemetry-value mt-1.5 flex items-center gap-2 text-lg text-emerald-200"><Gauge className="h-4 w-4" />{summary.activeMachines}<span className="text-xs text-slate-500">running</span></div></div>
      <div className="border-l border-white/[0.08] pl-3 py-3 sm:pl-5 sm:py-4"><div className="command-label text-[8px]">Total power</div><div className="telemetry-value mt-1.5 flex items-center gap-2 text-lg text-cyan-100"><Zap className="h-4 w-4" />{summary.totalPowerKw.toFixed(1)}<span className="text-xs text-slate-500">kW</span></div></div>
    </div>
    <FactoryTwin />
    <div className="flex items-center justify-between border-t border-white/[0.07] pt-3">
      <span className="command-label text-[8px]">Spatial equipment map · live machine records</span>
      <span className={`font-mono text-[9px] ${isConnected ? 'text-emerald-200' : 'text-amber-200'}`}>{isConnected ? 'SOCKET STREAM ONLINE' : 'RECONNECTING TO STREAM'}</span>
    </div>
  </div>;
}