'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Factory,
  Cpu,
  Bot,
  Sparkles,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  PiggyBank,
  MessageSquareCode,
  PlayCircle,
  Settings,
  Zap,
  Shield,
  Layers,
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Factory Digital Twin', href: '/factory', icon: Factory },
  { name: 'Machine Monitoring', href: '/machines', icon: Cpu },
  { name: 'AI Agent Center', href: '/agents', icon: Bot },
  { name: 'AI Decision Center', href: '/decisions', icon: Sparkles },
  { name: 'Alert & Incidents', href: '/alerts', icon: AlertTriangle, hasBadge: true },
  { name: 'Energy Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Demand Forecast', href: '/forecast', icon: TrendingUp },
  { name: 'Energy Savings', href: '/savings', icon: PiggyBank },
  { name: 'AI Assistant', href: '/assistant', icon: MessageSquareCode },
  { name: 'Simulation & Demos', href: '/simulation', icon: PlayCircle },
  { name: 'System Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { summary, alerts, decisions } = useSocket();
  const { user } = useAuth();

  const activeAlertCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const pendingDecCount = decisions.filter((d) => d.status === 'PENDING').length;

  return (
    <aside aria-label="Main Navigation" className="fixed inset-x-0 bottom-0 z-40 flex h-[68px] select-none border-t border-white/10 bg-[#080d12]/95 backdrop-blur-xl lg:left-0 lg:right-auto lg:top-0 lg:h-screen lg:w-60 lg:flex-col lg:border-r lg:border-t-0">
      {/* Brand Header */}
      <div className="hidden h-[76px] items-center justify-between border-b border-white/5 px-5 lg:flex">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center border border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-200">
            <Zap className="h-4 w-4" />
            </div>
          <div>
            <span className="block text-[13px] font-bold tracking-[0.12em] text-white">POWERGUARD</span>
            <span className="command-label mt-0.5 block text-[9px]">Industrial intelligence</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex min-w-0 flex-1 items-stretch overflow-x-auto px-1.5 py-1.5 lg:block lg:space-y-1 lg:overflow-x-hidden lg:overflow-y-auto lg:px-3 lg:py-5">
        <div className="hidden px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 lg:block">
          Core Platform
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              className={`group flex w-[68px] shrink-0 flex-col items-center justify-center gap-1 px-1 py-1.5 text-[9px] font-medium transition-colors lg:w-full lg:flex-row lg:justify-between lg:rounded-sm lg:px-3 lg:py-2.5 lg:text-[11px] ${
                isActive
                  ? 'text-cyan-200 lg:border-l-2 lg:border-cyan-300 lg:bg-cyan-300/[0.08] lg:font-semibold'
                  : 'text-slate-500 hover:text-slate-100 lg:text-slate-400 lg:hover:bg-white/[0.035]'
              }`}
            >
              <div className="flex flex-col items-center gap-1 lg:flex-row lg:gap-2.5">
                <Icon
                  className={`h-[17px] w-[17px] transition-colors lg:h-4 lg:w-4 ${
                    isActive ? 'text-cyan-200' : 'text-slate-500 group-hover:text-slate-200'
                  }`}
                />
                <span className="max-w-full truncate lg:max-w-none">{item.name.replace('Factory Digital Twin', 'Factory').replace('Machine Monitoring', 'Machines').replace('AI Agent Center', 'Agents').replace('AI Decision Center', 'Decisions').replace('Alert & Incidents', 'Alerts').replace('Energy Analytics', 'Energy').replace('Demand Forecast', 'Forecast').replace('Energy Savings', 'Savings').replace('Simulation & Demos', 'Simulation').replace('System Settings', 'Settings').replace('Dashboard', 'Overview')}</span>
              </div>

              {/* Badges */}
              {item.name === 'Alert & Incidents' && activeAlertCount > 0 && (
                <span className="absolute right-2 top-1 px-1 text-[9px] font-mono text-red-300 lg:static lg:rounded-full lg:border lg:border-red-400/25 lg:bg-red-400/10 lg:px-1.5 lg:py-0.5">
                  {activeAlertCount}
                </span>
              )}
              {item.name === 'AI Decision Center' && pendingDecCount > 0 && (
                <span className="absolute right-2 top-1 px-1 text-[9px] font-mono text-amber-200 lg:static lg:rounded-full lg:border lg:border-amber-300/25 lg:bg-amber-300/10 lg:px-1.5 lg:py-0.5">
                  {pendingDecCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status & User Footer */}
      <div className="hidden space-y-2 border-t border-white/5 bg-black/10 p-3 lg:block">
        <div className="border border-white/5 bg-white/[0.025] p-2.5">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-400 flex items-center gap-1 font-mono">
              <Layers className="w-3 h-3 text-cyan-400" /> Multi-Agent State
            </span>
              <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-300">
              <span className="status-dot h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              7 Agents
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Current Role:</span>
            <span className="text-xs font-mono font-semibold text-white px-1.5 py-0.5 rounded bg-surface-100 border border-white/10 flex items-center gap-1">
              <Shield className="w-3 h-3 text-cyan-400" />
              {user?.role || 'VIEWER'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
