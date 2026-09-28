import React from 'react';
import { MachineStatus } from '@powerguard/shared-types';

interface Props {
  status: MachineStatus;
  showPulse?: boolean;
}

export function MachineStatusBadge({ status, showPulse = true }: Props) {
  const configMap: Record<MachineStatus, { bg: string; text: string; dot: string; border: string }> = {
    RUNNING: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
      border: 'border-emerald-500/30',
    },
    IDLE: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
      border: 'border-amber-500/30',
    },
    STANDBY: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      dot: 'bg-cyan-400',
      border: 'border-cyan-500/30',
    },
    FAULT: {
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      dot: 'bg-red-500',
      border: 'border-red-500/40',
    },
    MAINTENANCE: {
      bg: 'bg-slate-500/15',
      text: 'text-slate-300',
      dot: 'bg-slate-400',
      border: 'border-slate-500/30',
    },
    OFFLINE: {
      bg: 'bg-zinc-800/40',
      text: 'text-zinc-400',
      dot: 'bg-zinc-500',
      border: 'border-zinc-700/30',
    },
  };

  const current = configMap[status] || configMap.IDLE;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${current.bg} ${current.text} ${current.border}`}
    >
      {showPulse && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${current.dot} ${
            status === 'RUNNING' || status === 'FAULT' ? 'animate-pulse' : ''
          }`}
        ></span>
      )}
      {status}
    </span>
  );
}
