'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSocket } from '../../context/SocketContext';
import { fetchApi } from '../../lib/api';
import { Machine, MachineStatus, Department } from '@powerguard/shared-types';
import { MachineStatusBadge } from '../../components/common/MachineStatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Cpu, Search, Filter, ExternalLink, Zap, Gauge } from 'lucide-react';

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const { telemetries } = useSocket();

  useEffect(() => {
    fetchApi('/api/machines')
      .then((res) => {
        if (res.data) setMachines(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Overlay live telemetry
  const liveMachines = machines.map((m) => {
    const live = telemetries.find((t) => t.machineId === m.machineId);
    if (live) {
      return {
        ...m,
        status: live.status,
        powerKw: live.powerKw,
        loadPercentage: live.loadPercentage,
        temperature: live.temperature,
        powerFactor: live.powerFactor,
      };
    }
    return m;
  });

  const filteredMachines = liveMachines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.machineId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || m.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-industrial p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            Machine Monitoring & Digital Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time sensory telemetry, load percentages, operational states, and safe simulation controls.
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-surface-100 border border-white/5 text-slate-300">
          Total Fleet: <strong className="text-emerald-400">{filteredMachines.length}</strong> / 8 Units
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-industrial p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID or Machine name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-300 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Department & Status Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-surface-300 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="ALL">All Departments</option>
            <option value="Production">Production</option>
            <option value="Assembly">Assembly</option>
            <option value="Packaging">Packaging</option>
            <option value="Utilities">Utilities</option>
            <option value="HVAC">HVAC</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-surface-300 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="RUNNING">RUNNING</option>
            <option value="IDLE">IDLE</option>
            <option value="STANDBY">STANDBY</option>
            <option value="FAULT">FAULT</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {filteredMachines.map((m) => (
          <article key={m.machineId} className="card-industrial group p-4 transition-transform hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-cyan-200/15 bg-cyan-200/[0.045] text-cyan-100"><Cpu className="h-4 w-4" /></div>
                <div className="min-w-0"><div className="command-label text-[9px] text-cyan-100/80">{m.machineId} · {m.department}</div><h2 className="mt-1 truncate text-sm font-semibold text-slate-100">{m.name}</h2><p className="mt-0.5 truncate text-[10px] text-slate-500">{m.type}</p></div>
              </div>
              <MachineStatusBadge status={m.status} />
            </div>

            <div className="mt-4 grid grid-cols-3 border-y border-white/[0.07] py-3">
              <div><div className="command-label text-[8px]">Active power</div><div className="telemetry-value mt-1.5 flex items-center gap-1 text-xs text-slate-100"><Zap className="h-3 w-3 text-cyan-100" />{m.powerKw.toFixed(1)} kW</div></div>
              <div className="border-l border-white/[0.07] pl-3"><div className="command-label text-[8px]">Load</div><div className="telemetry-value mt-1.5 text-xs text-slate-100">{m.loadPercentage.toFixed(0)}%</div></div>
              <div className="border-l border-white/[0.07] pl-3"><div className="command-label text-[8px]">Temperature</div><div className={`telemetry-value mt-1.5 text-xs ${m.temperature > 65 ? 'text-amber-200' : 'text-slate-100'}`}>{m.temperature.toFixed(1)}°C</div></div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2"><PriorityBadge priority={m.productionPriority} /><span className="font-mono text-[9px] text-slate-500">PF {m.powerFactor.toFixed(2)} · EFF {m.efficiencyScore.toFixed(0)}%</span></div>
              <Link href={`/machines/${m.machineId}`} aria-label={`Open controls for ${m.name}`} className="inline-flex h-8 items-center gap-1.5 border border-white/10 px-2.5 text-[10px] text-slate-300 transition-colors hover:border-cyan-200/30 hover:text-cyan-100">Controls <ExternalLink className="h-3 w-3" /></Link>
            </div>
            <div className="mt-3 h-1 overflow-hidden bg-white/[0.06]"><div className={`h-full transition-all ${m.loadPercentage > 85 ? 'bg-amber-300' : 'bg-cyan-200/70'}`} style={{ width: `${Math.min(100, m.loadPercentage)}%` }} /></div>
          </article>
        ))}
        {filteredMachines.length === 0 && <div className="col-span-full border border-dashed border-white/10 px-4 py-12 text-center"><Cpu className="mx-auto mb-3 h-5 w-5 text-slate-600" /><p className="command-label">No equipment matches this filter</p><p className="mt-1 text-xs text-slate-500">Adjust the fleet filters to inspect another machine.</p></div>}
      </div>
    </div>
  );
}
