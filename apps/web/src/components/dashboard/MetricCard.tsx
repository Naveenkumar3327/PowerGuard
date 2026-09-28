import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'cyan' | 'amber' | 'danger' | 'purple';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export function MetricCard({
  title,
  value,
  unit,
  subtext,
  icon: Icon,
  variant = 'emerald',
  trend,
}: Props) {
  const variantStyles = {
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'group-hover:shadow-glow',
    },
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      glow: 'group-hover:shadow-glow-cyan',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: 'group-hover:shadow-glow-amber',
    },
    danger: {
      border: 'border-red-500/20 hover:border-red-500/40',
      iconBg: 'bg-red-500/10 text-red-400',
      glow: 'group-hover:shadow-glow-danger',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400',
      glow: 'group-hover:shadow-glow',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`card-industrial p-4 rounded-xl relative overflow-hidden group transition-all duration-300 ${style.border} ${style.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            {title}
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              {value}
            </span>
            {unit && <span className="text-xs font-mono text-slate-400">{unit}</span>}
          </div>
        </div>

        <div className={`p-2.5 rounded-xl ${style.iconBg} transition-transform group-hover:scale-110 duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
          {subtext && <span className="text-slate-400 line-clamp-1">{subtext}</span>}
          {trend && (
            <span
              className={`font-mono font-medium ml-auto ${
                trend.isPositive ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
