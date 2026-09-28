'use client';

import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Bot, Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function AgentActivityFeed() {
  const { activities } = useSocket();

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ALERT':
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="card-industrial p-5 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            Live Multi-Agent Activity Pipeline
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Real-time inter-agent communication & thought coordination
          </span>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          STREAMING
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
            Orchestrator monitoring cycle initialized...
          </div>
        ) : (
          activities.slice(0, 15).map((act) => (
            <div
              key={act.id}
              className="p-2.5 rounded-xl bg-surface-300/60 border border-white/5 hover:border-white/10 transition-colors text-xs flex items-start space-x-2.5"
            >
              <div className="mt-0.5">{getSeverityIcon(act.severity)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 truncate">
                    {act.agent}
                    {act.machineId && (
                      <strong className="text-emerald-400 font-mono ml-1.5">[{act.machineId}]</strong>
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 ml-2 whitespace-nowrap">
                    {act.timestamp}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {act.details}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
