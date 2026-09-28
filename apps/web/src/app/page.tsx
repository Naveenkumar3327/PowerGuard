'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, ArrowUpRight, BatteryCharging, Bot, CheckCircle2, ChevronRight, Cpu, Gauge, Leaf, Play, RotateCcw, Sparkles, Zap } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { AgentActivityFeed } from '../components/dashboard/AgentActivityFeed';
import { DepartmentEnergyChart } from '../components/dashboard/DepartmentEnergyChart';
import { PowerTrendChart } from '../components/dashboard/PowerTrendChart';
import { RecentDecisionsTable } from '../components/dashboard/RecentDecisionsTable';
import { FactoryTwin } from '../components/factory/FactoryTwin';
import { DemoScenarioId } from '@powerguard/shared-types';
import { fetchApi } from '../lib/api';

const DEMO_SCENARIOS: { id: DemoScenarioId; label: string; desc: string }[] = [
  { id: 'NORMAL', label: 'Normal operation', desc: 'Balanced operational load across all machines' },
  { id: 'HIGH_CONSUMPTION', label: 'High energy', desc: 'Surges injection molding load' },
  { id: 'ANOMALY', label: 'Machine anomaly', desc: 'Compressor power factor drops with thermal spike' },
  { id: 'PEAK_DEMAND', label: 'Peak demand', desc: 'Factory total power approaches the peak tariff threshold' },
  { id: 'IDLE_MACHINE', label: 'Idle machine waste', desc: 'Idle conveyor draw triggers AI standby recommendation' },
  { id: 'FAULT', label: 'Machine fault', desc: 'Welder trips the thermal safety interlock' },
  { id: 'ENERGY_OPTIMIZATION', label: 'Optimization loop', desc: 'Detect, recommend, execute, and record savings' },
];

export default function DashboardPage() {
  const { summary, isConnected, alerts, decisions, activities, telemetries, refreshData } = useSocket();
  const [activeScenario, setActiveScenario] = useState<DemoScenarioId>('NORMAL');
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioMsg, setScenarioMsg] = useState<string | null>(null);
  const livePower = telemetries.length
    ? telemetries.reduce((total, machine) => total + machine.powerKw, 0)
    : summary.totalPowerKw;
  const pendingDecision = decisions.find((decision) => decision.status === 'PENDING');
  const activeAlerts = alerts.filter((alert) => alert.status === 'ACTIVE');

  const handleTriggerScenario = async () => {
    setScenarioLoading(true);
    try {
      const response = await fetchApi('/api/simulation/scenario', {
        method: 'POST',
        body: JSON.stringify({ scenario: activeScenario }),
      });
      setScenarioMsg(response.message || 'Scenario applied');
      await refreshData();
      window.setTimeout(() => setScenarioMsg(null), 4000);
    } catch (error) {
      setScenarioMsg(error instanceof Error ? error.message : 'Scenario could not be started');
    } finally {
      setScenarioLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="command-label mb-2 flex items-center gap-2 text-[9px]">
            <span className={`status-dot h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-300 text-emerald-300' : 'bg-amber-300 text-amber-300'}`} />
            {isConnected ? 'Command link established' : 'Telemetry link reconnecting'}
            <span className="text-slate-700">/</span> 01 — Operations
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-[28px]">Factory command center</h1>
          <p className="mt-1 text-xs text-slate-500">Live energy intelligence for Apex Precision Manufacturing</p>
        </div>
        <Link href="/factory" className="inline-flex items-center gap-2 self-start border border-white/10 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-300 transition-colors hover:border-cyan-200/30 hover:text-cyan-100 sm:self-auto">
          Open digital twin <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <section className="grid grid-cols-2 border-y border-white/[0.09] md:grid-cols-4" aria-label="Live factory metrics">
        <Metric label="Factory power" value={livePower.toFixed(1)} unit="kW" icon={Zap} tint="text-cyan-200" detail={`Peak threshold ${summary.peakThresholdKw} kW`} />
        <Metric label="Energy consumed" value={summary.totalEnergyKwh.toLocaleString()} unit="kWh" icon={BatteryCharging} tint="text-slate-200" detail="Cumulative factory load" />
        <Metric label="Factory efficiency" value={summary.factoryEfficiency.toFixed(1)} unit="%" icon={Gauge} tint="text-emerald-200" detail={`${summary.activeMachines} of ${summary.totalMachines} units running`} />
        <Metric label="Saved today" value={summary.energySavedTodayKwh.toFixed(1)} unit="kWh" icon={Leaf} tint="text-emerald-200" detail={`${summary.co2SavedTodayKg.toFixed(1)} kg CO₂ avoided`} />
      </section>

      <div className="flex flex-col gap-2 border border-white/[0.08] bg-[#0a1016]/80 p-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-cyan-200/80" />
          <span className="command-label shrink-0 text-[9px]">Simulation scenario</span>
          <select aria-label="Choose a simulation scenario" value={activeScenario} onChange={(event) => setActiveScenario(event.target.value as DemoScenarioId)} className="min-w-0 flex-1 border-0 bg-transparent py-1 text-xs text-slate-200 outline-none focus:ring-0">
            {DEMO_SCENARIOS.map((scenario) => <option key={scenario.id} value={scenario.id} className="bg-[#0b1218]">{scenario.label} · {scenario.desc}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {scenarioMsg && <span className="max-w-48 truncate text-[10px] text-emerald-200" role="status">{scenarioMsg}</span>}
          <button onClick={handleTriggerScenario} disabled={scenarioLoading} className="inline-flex h-8 shrink-0 items-center gap-2 border border-cyan-200/20 bg-cyan-200/[0.07] px-3 text-[10px] font-mono uppercase tracking-wider text-cyan-100 transition-colors hover:bg-cyan-200/[0.13] disabled:opacity-50">
            {scenarioLoading ? <RotateCcw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            {scenarioLoading ? 'Applying' : 'Run scenario'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-12">
        <div className="2xl:col-span-8"><FactoryTwin compact /></div>
        <aside className="flex flex-col border border-white/[0.09] bg-[#0a1016]/90 2xl:col-span-4" aria-label="AI and incident intelligence">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
            <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-cyan-200" /><h2 className="command-label text-[9px] text-slate-300">AI intelligence</h2></div>
            <span className="font-mono text-[9px] text-emerald-200">{summary.aiMode} MODE</span>
          </div>
          <div className="flex-1 p-4">
            <div className="command-label text-[9px]">Recommended action</div>
            {pendingDecision ? (
              <div className="mt-3 border-l border-amber-300/50 pl-3">
                <div className="flex items-center justify-between gap-2"><span className="font-mono text-[10px] text-amber-200">{pendingDecision.machineId} · REVIEW</span><span className="font-mono text-[9px] text-slate-500">{(pendingDecision.confidence * 100).toFixed(0)}% CONF.</span></div>
                <h3 className="mt-2 text-sm font-semibold text-slate-100">{pendingDecision.recommendation}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{pendingDecision.problem}</p>
                <div className="mt-3 flex items-baseline gap-1.5"><span className="telemetry-value text-xl text-emerald-200">{pendingDecision.expectedSavingKwh.toFixed(1)}</span><span className="command-label text-[8px]">kWh / hour projected saving</span></div>
                <Link href="/decisions" className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase text-cyan-100 hover:text-white">Review decision <ChevronRight className="h-3 w-3" /></Link>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 border-l border-emerald-300/40 pl-3 text-xs text-slate-400"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" />No pending decisions. Agents are monitoring the live fleet.</div>
            )}
          </div>
          <div className="border-t border-white/[0.07] px-4 py-3">
            <div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2"><AlertTriangle className={`h-3.5 w-3.5 ${activeAlerts.length ? 'text-amber-200' : 'text-slate-500'}`} /><span className="command-label text-[9px]">Active incidents</span></div><Link href="/alerts" className="font-mono text-[9px] text-slate-500 hover:text-cyan-100">ALL ALERTS ↗</Link></div>
            {activeAlerts.length ? activeAlerts.slice(0, 2).map((alert) => <div key={alert.id} className="flex items-center justify-between gap-3 border-t border-white/[0.05] py-2"><div className="min-w-0"><p className="truncate text-[11px] text-slate-200">{alert.title}</p><p className="mt-0.5 truncate font-mono text-[9px] text-slate-500">{alert.machineId} · {alert.severity}</p></div><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" /></div>) : <p className="border-t border-white/[0.05] pt-2 text-[11px] text-slate-500">No active incidents. Factory parameters are within monitored limits.</p>}
          </div>
          <div className="grid grid-cols-2 border-t border-white/[0.07]">
            <div className="p-3"><div className="command-label text-[8px]">Agent events</div><div className="telemetry-value mt-1.5 text-sm text-slate-200">{activities.length}</div></div>
            <div className="border-l border-white/[0.07] p-3"><div className="command-label text-[8px]">AI status</div><div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-200"><span className="status-dot h-1.5 w-1.5 rounded-full bg-emerald-300 text-emerald-300" /> ACTIVE</div></div>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8"><PowerTrendChart /></div>
        <div className="xl:col-span-4"><DepartmentEnergyChart /></div>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-2"><AgentActivityFeed /></div>
        <div className="xl:col-span-3"><RecentDecisionsTable /></div>
      </div>
      <div className="flex items-center justify-between border-t border-white/[0.07] pt-3">
        <span className="command-label text-[8px]">POWERGUARD · Industrial energy intelligence</span>
        <span className="flex items-center gap-1.5 font-mono text-[9px] text-slate-600"><Cpu className="h-3 w-3" /> SIMULATION {summary.simulationRunning ? 'RUNNING' : 'PAUSED'}</span>
      </div>
    </div>
  );
}

function Metric({ label, value, unit, icon: Icon, tint, detail }: {
  label: string;
  value: string;
  unit: string;
  icon: typeof Zap;
  tint: string;
  detail: string;
}) {
  return <div className="min-w-0 border-r border-white/[0.07] px-3 py-4 first:pl-0 last:border-r-0 sm:px-5 sm:py-5">
    <div className="flex items-center gap-2"><Icon className={`h-3.5 w-3.5 ${tint}`} /><span className="command-label truncate text-[8px] sm:text-[9px]">{label}</span></div>
    <div className="mt-2 flex items-baseline gap-1.5"><span className="telemetry-value truncate text-xl font-medium tracking-tight text-slate-100 sm:text-2xl">{value}</span><span className="command-label text-[8px]">{unit}</span></div>
    <p className="mt-1 truncate text-[9px] text-slate-600 sm:text-[10px]">{detail}</p>
  </div>;
}