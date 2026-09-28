'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Activity,
  Gauge,
  User,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@powerguard/shared-types';

export function Header() {
  const { summary, alerts, isConnected } = useSocket();
  const { user, switchDemoRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [alertMenuOpen, setAlertMenuOpen] = useState(false);

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const peakRatio = summary.totalPowerKw / summary.peakThresholdKw;

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 border-b border-white/[0.08] bg-[#070c11]/90 px-4 backdrop-blur-xl sm:px-6">
      {/* Left: Factory Identity & Telemetry Status */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="hidden h-8 w-8 shrink-0 items-center justify-center border border-cyan-300/25 bg-cyan-300/[0.07] text-cyan-200 sm:flex lg:hidden">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="truncate text-xs font-semibold tracking-wide text-slate-100 sm:text-sm">
              Apex Precision Manufacturing
            </span>
            <span className="hidden border border-white/10 bg-white/[0.035] px-1.5 py-0.5 font-mono text-[9px] text-slate-400 sm:inline">
              PLANT 01
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 sm:gap-3">
            <span className="flex items-center gap-1.5">
              <span
                className={`status-dot h-1.5 w-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-400 text-emerald-400' : 'bg-red-400 text-red-400'
                }`}
              ></span>
              <span className="font-mono text-[9px] uppercase tracking-wider">
                {isConnected ? 'SYSTEM ONLINE · LIVE' : 'DATA LINK CONNECTING'}
              </span>
            </span>
            <span className="hidden font-mono text-[9px] uppercase tracking-wider text-cyan-200/80 sm:inline">
              AI ENGINE ACTIVE
            </span>
            <span className="hidden font-mono text-[9px] sm:inline">
              {summary.activeMachines}/{summary.totalMachines} UNITS
            </span>
          </div>
        </div>
      </div>

      {/* Center/Right: Peak Demand Warning & Controls */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Peak Demand Gauge Pill */}
        <div
          className={`hidden items-center gap-2.5 border px-3 py-1.5 text-[10px] font-mono transition-colors sm:flex ${
            summary.isPeakWarning
              ? 'border-amber-300/25 bg-amber-300/[0.06] text-amber-200'
              : 'border-white/10 bg-white/[0.025] text-slate-300'
          }`}
        >
          <Gauge className={`h-4 w-4 ${summary.isPeakWarning ? 'text-amber-300' : 'text-cyan-200'}`} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[9px]">LOAD / LIMIT</span>
              <strong>{summary.totalPowerKw.toFixed(1)} kW</strong> / {summary.peakThresholdKw} kW
            </div>
            {/* Small progress bar */}
            <div className="mt-1 h-1 w-28 overflow-hidden bg-white/10">
              <div
                className={`h-full transition-all duration-500 ${
                  peakRatio >= 1.0 ? 'bg-red-400' : peakRatio > 0.85 ? 'bg-amber-300' : 'bg-emerald-300'
                }`}
                style={{ width: `${Math.min(100, peakRatio * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setAlertMenuOpen(!alertMenuOpen)}
            aria-label={`${activeAlerts.length} active alerts`}
            className="relative flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.025] text-slate-300 transition-colors hover:border-cyan-200/30 hover:text-white"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-red-400 px-1 font-mono text-[9px] font-bold text-[#120909]">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {/* Quick Alert Dropdown */}
          {alertMenuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-80 border border-white/10 bg-[#0b1218] p-3 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
                <span className="text-xs font-semibold text-white">Active Factory Alerts</span>
                <Link
                  href="/alerts"
                  onClick={() => setAlertMenuOpen(false)}
                  className="text-[10px] font-mono text-cyan-200 hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-500 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    All operational parameters normal
                  </div>
                ) : (
                  activeAlerts.slice(0, 4).map((alt) => (
                    <div
                      key={alt.id}
                      className="border border-white/[0.06] bg-white/[0.025] p-2 text-[11px]"
                    >
                      <div className="flex items-center justify-between font-semibold text-white">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          {alt.machineId}
                        </span>
                        <span className="text-[10px] font-mono text-red-400">{alt.severity}</span>
                      </div>
                      <p className="text-slate-400 mt-0.5 line-clamp-1">{alt.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User / Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 border border-white/10 bg-white/[0.025] px-2 py-1.5 text-xs transition-colors hover:border-cyan-200/30 sm:px-3"
          >
            <div className="flex h-6 w-6 items-center justify-center border border-cyan-200/20 bg-cyan-200/10 text-[10px] font-bold text-cyan-100">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-white leading-none text-xs">{user?.name}</div>
                <div className="mt-1 font-mono text-[9px] uppercase leading-none text-emerald-300">
                Role: {user?.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Role Dropdown */}
          {roleMenuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-64 border border-white/10 bg-[#0b1218] p-2 shadow-2xl">
              <div className="px-2 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-white/5">
                Switch Demo Persona (1-Click)
              </div>
              {(['ADMIN', 'ENERGY_MANAGER', 'OPERATOR', 'VIEWER'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchDemoRole(r);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    user?.role === r
                      ? 'border border-cyan-200/20 bg-cyan-200/[0.08] text-cyan-100'
                        : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    {r}
                  </span>
                  {user?.role === r && <span className="text-[10px] font-mono">ACTIVE</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
