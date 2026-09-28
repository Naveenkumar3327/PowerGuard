'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bot, Activity, Cpu, CheckCircle, AlertTriangle, Clock, Zap, Brain, Shield, TrendingUp, BarChart2, Eye, LucideIcon } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { useSocket } from '../../context/SocketContext';
import { AgentActivityLog } from '@powerguard/shared-types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';

interface AgentStatus {
  agentId: string;
  name: string;
  type: string;
  status: string;
  lastExecution: string;
  tasksProcessed: number;
  decisionsMade: number;
  confidence: number;
  currentActivity: string;
}

const AGENT_ICONS: Record<string, LucideIcon> = {
  'agent-1': Zap,
  'agent-2': Brain,
  'agent-3': TrendingUp,
  'agent-4': BarChart2,
  'agent-5': Shield,
  'agent-6': AlertTriangle,
  'agent-7': Eye,
};

const AGENT_COLORS: Record<string, string> = {
  'agent-1': 'emerald',
  'agent-2': 'red',
  'agent-3': 'cyan',
  'agent-4': 'purple',
  'agent-5': 'blue',
  'agent-6': 'amber',
  'agent-7': 'slate',
};

const COLOR_STYLES: Record<string, { border: string; icon: string; bar: string; ring: string; glow: string }> = {
  emerald: { border: 'border-emerald-500/30', icon: 'text-emerald-400', bar: 'bg-emerald-500', ring: 'stroke-emerald-400', glow: 'shadow-emerald-500/20' },
  red:     { border: 'border-red-500/30', icon: 'text-red-400', bar: 'bg-red-500', ring: 'stroke-red-400', glow: 'shadow-red-500/20' },
  cyan:    { border: 'border-cyan-500/30', icon: 'text-cyan-400', bar: 'bg-cyan-500', ring: 'stroke-cyan-400', glow: 'shadow-cyan-500/20' },
  purple:  { border: 'border-purple-500/30', icon: 'text-purple-400', bar: 'bg-purple-500', ring: 'stroke-purple-400', glow: 'shadow-purple-500/20' },
  blue:    { border: 'border-blue-500/30', icon: 'text-blue-400', bar: 'bg-blue-500', ring: 'stroke-blue-400', glow: 'shadow-blue-500/20' },
  amber:   { border: 'border-amber-500/30', icon: 'text-amber-400', bar: 'bg-amber-500', ring: 'stroke-amber-400', glow: 'shadow-amber-500/20' },
  slate:   { border: 'border-slate-500/30', icon: 'text-slate-400', bar: 'bg-slate-500', ring: 'stroke-slate-400', glow: 'shadow-slate-500/20' },
};

function ConfidenceRing({ value, color }: { value: number; color: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value * circumference);
  const styles = COLOR_STYLES[color];
  const pct = Math.round(value * 100);

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={radius} fill="none"
          className={styles.ring}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-sm font-bold ${styles.icon}`}>{pct}%</span>
        <span className="text-[8px] text-slate-500 font-mono">CONF</span>
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  activities,
  isSelected,
  onClick,
}: {
  agent: AgentStatus;
  activities: AgentActivityLog[];
  isSelected: boolean;
  onClick: () => void;
}) {
  const color = AGENT_COLORS[agent.agentId] || 'slate';
  const styles = COLOR_STYLES[color];
  const Icon = AGENT_ICONS[agent.agentId] || Bot;
  const agentActivities = activities.filter(a => a.agent?.toLowerCase().includes(agent.name.split(' ')[0].toLowerCase())).slice(0, 3);

  return (
    <div
      id={`agent-card-${agent.agentId}`}
      onClick={onClick}
      className={`card-industrial p-4 rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-lg ${styles.glow} ${
        isSelected ? `${styles.border} shadow-lg ${styles.glow}` : 'border-white/8 hover:border-white/20'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl border ${styles.border} flex items-center justify-center flex-shrink-0 bg-white/5`}>
            <Icon className={`w-5 h-5 ${styles.icon}`} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white leading-tight truncate">{agent.name}</h3>
            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{agent.type}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} pulse={agent.status === 'ACTIVE'} />
      </div>

      {/* Confidence ring + stats */}
      <div className="flex items-center gap-4 mb-4">
        <ConfidenceRing value={agent.confidence} color={color} />
        <div className="flex-1 space-y-2">
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
              <span>Tasks Processed</span>
              <span className="text-white">{agent.tasksProcessed.toLocaleString()}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full ${styles.bar} rounded-full transition-all duration-1000`}
                style={{ width: `${Math.min(100, (agent.tasksProcessed / 2000) * 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
              <span>Decisions Made</span>
              <span className="text-white">{agent.decisionsMade}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full ${styles.bar} rounded-full opacity-60 transition-all duration-1000`}
                style={{ width: `${Math.min(100, (agent.decisionsMade / 50) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current activity */}
      <div className="p-2.5 rounded-lg bg-white/3 border border-white/5 mb-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Activity className={`w-3 h-3 ${styles.icon}`} />
          <span className="text-[10px] font-mono uppercase text-slate-400">Current Activity</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">{agent.currentActivity}</p>
      </div>

      {/* Last execution */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
        <Clock className="w-3 h-3" />
        Last run: {agent.lastExecution}
      </div>

      {/* Recent activities preview */}
      {agentActivities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
          {agentActivities.map((act, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                act.severity === 'SUCCESS' ? 'bg-emerald-400' :
                act.severity === 'WARNING' ? 'bg-amber-400' :
                act.severity === 'ALERT' ? 'bg-red-400' : 'bg-slate-400'
              }`} />
              <span className="text-[10px] text-slate-400 truncate">{act.action}</span>
              <span className="text-[10px] text-slate-600 font-mono ml-auto flex-shrink-0">{act.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgentsPage() {
  const { activities: socketActivities } = useSocket();
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetchApi('/api/agents');
      if (res.data) setAgents(res.data);
    } catch {}
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    fetchAgents().finally(() => setLoading(false));
    const interval = setInterval(fetchAgents, 4000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  const selectedAgent = agents.find(a => a.agentId === selectedAgentId);
  const selectedActivities = selectedAgentId
    ? socketActivities.filter(a => a.agent?.toLowerCase().includes(selectedAgent?.name.split(' ')[0].toLowerCase() || ''))
    : socketActivities;

  const totalTasks = agents.reduce((s, a) => s + a.tasksProcessed, 0);
  const totalDecisions = agents.reduce((s, a) => s + a.decisionsMade, 0);
  const avgConfidence = agents.length ? agents.reduce((s, a) => s + a.confidence, 0) / agents.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agent Monitor"
        subtitle="Real-time status and activity log for all 7 multi-agent pipeline nodes"
        icon={Bot}
      >
        <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Live — {lastRefresh.toLocaleTimeString()}
        </span>
        <button
          id="agents-refresh-btn"
          onClick={fetchAgents}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
        >
          Refresh
        </button>
      </PageHeader>

      <section className="card-industrial overflow-hidden" aria-label="Live multi-agent pipeline">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
          <div><div className="command-label text-[9px]">Live orchestration path</div><p className="mt-1 text-[10px] text-slate-500">Agent states from the orchestration service</p></div>
          <span className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-200"><span className="status-dot h-1.5 w-1.5 rounded-full bg-emerald-300 text-emerald-300" />{agents.length} AGENTS</span>
        </div>
        <div className="flex items-center overflow-x-auto px-4 py-4">
          {agents.map((agent, index) => {
            const active = agent.status === 'ACTIVE' || agent.status === 'BUSY';
            return <div key={agent.agentId} className="flex shrink-0 items-center">
              <button onClick={() => setSelectedAgentId((current) => current === agent.agentId ? null : agent.agentId)} aria-pressed={selectedAgentId === agent.agentId} className={`w-[132px] border p-2.5 text-left transition-colors ${selectedAgentId === agent.agentId ? 'border-cyan-200/40 bg-cyan-200/[0.07]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'}`}>
                <div className="flex items-center justify-between gap-2"><span className="command-label truncate text-[8px]">{agent.name}</span><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-emerald-300' : agent.status === 'ERROR' ? 'bg-red-300' : 'bg-slate-500'}`} /></div>
                <p className={`mt-2 font-mono text-[9px] ${agent.status === 'ERROR' ? 'text-red-300' : active ? 'text-emerald-200' : 'text-slate-500'}`}>{agent.status}</p>
                <p className="mt-1 truncate text-[9px] text-slate-500">{agent.currentActivity}</p>
              </button>
              {index < agents.length - 1 && <div aria-hidden="true" className={`h-px w-7 ${active ? 'bg-cyan-200/50' : 'bg-white/10'}`} />}
            </div>;
          })}
          {!loading && agents.length === 0 && <p className="py-2 text-xs text-slate-500">Agent state is unavailable while the service reconnects.</p>}
        </div>
      </section>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Agents', value: agents.filter(a => a.status === 'ACTIVE').length + ' / ' + agents.length, icon: Bot, color: 'text-emerald-400' },
          { label: 'Total Tasks', value: totalTasks.toLocaleString(), icon: Cpu, color: 'text-cyan-400' },
          { label: 'Total Decisions', value: totalDecisions, icon: CheckCircle, color: 'text-purple-400' },
          { label: 'Avg Confidence', value: (avgConfidence * 100).toFixed(1) + '%', icon: Activity, color: 'text-amber-400' },
        ].map(kpi => (
          <div key={kpi.label} className="card-industrial p-4 rounded-xl border border-white/8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-mono">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Agent filter indicator */}
      {selectedAgentId && (
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className="text-slate-400">Showing activity for:</span>
          <span className="font-semibold text-white">{selectedAgent?.name}</span>
          <button
            onClick={() => setSelectedAgentId(null)}
            className="text-xs text-emerald-400 hover:text-emerald-300 ml-1 underline"
          >
            Show All
          </button>
        </div>
      )}

      {/* Main grid: agent cards + activity log */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Agent cards grid */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="card-industrial p-4 rounded-2xl border border-white/8 animate-pulse h-52">
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/5 rounded w-3/4" />
                      <div className="h-2 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-16 bg-white/5 rounded-lg" />
                </div>
              ))
            : agents.map(agent => (
                <AgentCard
                  key={agent.agentId}
                  agent={agent}
                  activities={socketActivities}
                  isSelected={selectedAgentId === agent.agentId}
                  onClick={() => setSelectedAgentId(prev => prev === agent.agentId ? null : agent.agentId)}
                />
              ))
          }
        </div>

        {/* Live activity log */}
        <div className="xl:col-span-1">
          <div className="card-industrial rounded-2xl border border-white/8 h-full flex flex-col" style={{ maxHeight: '780px' }}>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">
                  {selectedAgent ? `${selectedAgent.name.split(' ')[0]} Log` : 'Live Activity Feed'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{selectedActivities.length} events</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {selectedActivities.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Waiting for agent activity...
                </div>
              ) : (
                selectedActivities.slice(0, 50).map((act, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-bold font-mono uppercase ${
                        act.severity === 'SUCCESS' ? 'text-emerald-400' :
                        act.severity === 'WARNING' ? 'text-amber-400' :
                        act.severity === 'ALERT' ? 'text-red-400' : 'text-cyan-400'
                      }`}>{act.action}</span>
                      <span className="text-[9px] text-slate-500 font-mono flex-shrink-0">{act.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{act.details}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-slate-500 font-mono">{act.agent}</span>
                      {act.machineId && (
                        <>
                          <span className="text-slate-700">·</span>
                          <span className="text-[9px] text-slate-500 font-mono">{act.machineId}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
