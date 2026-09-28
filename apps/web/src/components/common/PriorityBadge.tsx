import React from 'react';
import { ProductionPriority } from '@powerguard/shared-types';

interface Props {
  priority: ProductionPriority;
}

export function PriorityBadge({ priority }: Props) {
  const map: Record<ProductionPriority, { bg: string; text: string; border: string }> = {
    CRITICAL: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/30',
    },
    HIGH: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    },
    MEDIUM: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
    },
    LOW: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
    },
  };

  const style = map[priority] || map.MEDIUM;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold border ${style.bg} ${style.text} ${style.border}`}
    >
      {priority}
    </span>
  );
}
