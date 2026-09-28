'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Zap, DollarSign, Leaf, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { PageHeader } from '../../components/common/PageHeader';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CHART_STYLE = {
  tooltip: { contentStyle: { background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11, color: '#CBD5E1' } },
  grid: { stroke: 'rgba(255,255,255,0.04)', strokeDasharray: '3 3' },
  axis: { tick: { fill: '#64748B', fontSize: 10 }, axisLine: false, tickLine: false },
};

export default function AnalyticsPage() {
  const [energy, setEnergy] = useState<any>(null);
  const [savings, setSavings] = useState<any>(null);
  const [peak, setPeak] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetchApi('/api/analytics/energy'),
      fetchApi('/api/analytics/savings'),
      fetchApi('/api/analytics/peak-demand'),
    ]).then(([eRes, sRes, pRes]) => {
      if (eRes.status === 'fulfilled') setEnergy(eRes.value.data);
      if (sRes.status === 'fulfilled') setSavings(sRes.value.data);
      if (pRes.status === 'fulfilled') setPeak(pRes.value.data);
    }).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Total Consumption', value: energy?.summary?.totalKwh?.toFixed(1) ?? '—', unit: 'kWh', icon: Zap, color: 'text-emerald-400', trend: '+2.3%' },
    { label: 'Total Cost', value: `$${energy?.summary?.totalCost?.toFixed(2) ?? '—'}`, icon: DollarSign, color: 'text-cyan-400', trend: '-5.1%' },
    { label: 'CO₂ Emissions', value: energy?.summary?.co2Kg?.toFixed(1) ?? '—', unit: 'kg', icon: Leaf, color: 'text-green-400', trend: '-3.8%' },
    { label: 'Energy Saved', value: savings?.summary?.totalSavedKwh?.toFixed(1) ?? '—', unit: 'kWh', icon: TrendingDown, color: 'text-purple-400', trend: '+12%' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Energy Analytics" subtitle="Consumption trends, peak demand analysis, and cost breakdown" icon={BarChart3} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="card-industrial p-4 rounded-xl border border-white/8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div className="text-xl font-bold text-white">{k.value} <span className="text-xs font-normal text-slate-400">{k.unit}</span></div>
            <div className={`text-[11px] font-mono mt-1 flex items-center gap-1 ${k.trend.startsWith('+') && k.label !== 'Total Consumption' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {k.trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {k.trend} vs last period
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2].map(i => <div key={i} className="card-industrial p-6 rounded-2xl border border-white/8 animate-pulse h-72" />)}
        </div>
      ) : (
        <>
          {/* Energy trend */}
          {energy?.hourly?.length > 0 && (
            <div className="card-industrial p-5 rounded-2xl border border-white/8">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" /> Hourly Energy Consumption (kWh)
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={energy.hourly} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...CHART_STYLE.grid} />
                  <XAxis dataKey="hour" {...CHART_STYLE.axis} />
                  <YAxis {...CHART_STYLE.axis} />
                  <Tooltip {...CHART_STYLE.tooltip} />
                  <Area type="monotone" dataKey="kwh" stroke="#10B981" strokeWidth={2} fill="url(#energyGrad)" name="kWh" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Savings by machine */}
          {savings?.byMachine?.length > 0 && (
            <div className="card-industrial p-5 rounded-2xl border border-white/8">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-purple-400" /> Energy Savings by Machine (kWh)
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={savings.byMachine} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid {...CHART_STYLE.grid} />
                  <XAxis dataKey="machineId" {...CHART_STYLE.axis} />
                  <YAxis {...CHART_STYLE.axis} />
                  <Tooltip {...CHART_STYLE.tooltip} />
                  <Bar dataKey="savedKwh" fill="#A855F7" radius={[4, 4, 0, 0]} name="Saved kWh" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Peak demand */}
          {peak?.timeline?.length > 0 && (
            <div className="card-industrial p-5 rounded-2xl border border-white/8">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> Peak Demand Profile (kW)
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={peak.timeline} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...CHART_STYLE.grid} />
                  <XAxis dataKey="time" {...CHART_STYLE.axis} />
                  <YAxis {...CHART_STYLE.axis} />
                  <Tooltip {...CHART_STYLE.tooltip} />
                  <Area type="monotone" dataKey="powerKw" stroke="#06B6D4" strokeWidth={2} fill="url(#peakGrad)" name="kW" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Fallback if no data yet */}
          {!energy?.hourly?.length && !savings?.byMachine?.length && !peak?.timeline?.length && (
            <div className="text-center py-16 card-industrial rounded-2xl border border-white/8">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400 text-sm">Analytics data is accumulating — check back after the simulation runs for a few minutes.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
