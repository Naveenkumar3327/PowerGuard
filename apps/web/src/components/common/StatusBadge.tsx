import React from 'react';

type StatusVariant = 'active' | 'idle' | 'standby' | 'fault' | 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'executed' | 'approved' | 'rejected';

const variantStyles: Record<StatusVariant, string> = {
  active:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  success:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  executed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  idle:     'bg-slate-500/15 text-slate-400 border-slate-500/30',
  standby:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  info:     'bg-blue-500/15 text-blue-400 border-blue-500/30',
  pending:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  warning:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  fault:    'bg-red-500/15 text-red-400 border-red-500/30',
  danger:   'bg-red-500/15 text-red-400 border-red-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
};

interface StatusBadgeProps {
  status: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, pulse = false, size = 'sm' }: StatusBadgeProps) {
  const key = status.toLowerCase() as StatusVariant;
  const style = variantStyles[key] || variantStyles.info;
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono ${textSize} font-medium ${style}`}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {status}
    </span>
  );
}
