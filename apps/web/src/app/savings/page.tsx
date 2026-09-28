'use client';

import React from 'react';
import { PiggyBank, Leaf, DollarSign, Zap } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { EnergySaving } from '@powerguard/shared-types';
import { PageHeader } from '../../components/common/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_STYLE = {
  tooltip: { contentStyle: { background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11, color: '#CBD5E1' } },
  grid: { stroke: 'rgba(255,255,255,0.04)', strokeDasharray: '3 3' },
  axis: { tick: { fill: '#64748B', fontSize: 10 }, axisLine: false, tickLine: false },
};

function SavingCard({ saving }: { saving: EnergySaving }) {
  return (
    <div className="card-industrial p-4 rounded-xl border border-white/8 hover:border-emerald-500/20 transition-all">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="text-xs font-mono text-slate-400 mb-0.5">{saving.machineId}</div>
          <div className="text-sm font-semibold text-white">{saving.action}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-emerald-400">{saving.energySavedKwh.toFixed(1)}</div>
          <div className="text-[10px] text-slate-400 font-mono">kWh saved</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-white/3 border border-white/5">
          <DollarSign className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
          <div className="text-xs font-bold text-white">${saving.costSaved.toFixed(2)}</div>
          <div className="text-[9px] text-slate-500">Cost</div>
        </div>
        <div className="p-2 rounded-lg bg-white/3 border border-white/5">
          <Leaf className="w-3.5 h-3.5 text-green-400 mx-auto mb-1" />
          <div className="text-xs font-bold text-white">{saving.co2ReducedKg.toFixed(1)}</div>
          <div className="text-[9px] text-slate-500">kg CO₂</div>
        </div>
        <div className="p-2 rounded-lg bg-white/3 border border-white/5">
          <Zap className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
          <div className="text-xs font-bold text-white">{saving.durationMinutes}m</div>
          <div className="text-[9px] text-slate-500">Duration</div>
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-mono">
        <span>{saving.baselinePowerKw.toFixed(1)} kW → {saving.optimizedPowerKw.toFixed(1)} kW</span>
        <span>{new Date(saving.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

export default function SavingsPage() {
  const { savings } = useSocket();

  const totalKwh = savings.reduce((s, sv) => s + sv.energySavedKwh, 0);
  const totalCost = savings.reduce((s, sv) => s + sv.costSaved, 0);
  const totalCo2 = savings.reduce((s, sv) => s + sv.co2ReducedKg, 0);

  // Build chart data by machine
  const byMachine: Record<string, number> = {};
  savings.forEach(s => {
    byMachine[s.machineId] = (byMachine[s.machineId] || 0) + s.energySavedKwh;
  });
  const chartData = Object.entries(byMachine).map(([machineId, savedKwh]) => ({ machineId, savedKwh: parseFloat(savedKwh.toFixed(1)) }));

  return (
    <div className="space-y-6">
      <PageHeader title="Energy Savings" subtitle="Verified savings from AI-executed optimization interventions" icon={PiggyBank} />

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Energy Saved', value: `${totalKwh.toFixed(1)} kWh`, icon: Zap, color: 'text-emerald-400', sub: 'All interventions' },
          { label: 'Cost Savings', value: `$${totalCost.toFixed(2)}`, icon: DollarSign, color: 'text-cyan-400', sub: '@ $0.15/kWh' },
          { label: 'CO₂ Avoided', value: `${totalCo2.toFixed(1)} kg`, icon: Leaf, color: 'text-green-400', sub: '0.42 kg/kWh factor' },
        ].map(k => (
          <div key={k.label} className="card-industrial p-5 rounded-2xl border border-white/8">
            <div className="flex justify-between items-center mb-3">
              <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center`}>
                <k.icon className={`w-5 h-5 ${k.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{k.value}</div>
            <div className="text-xs text-slate-400">{k.label}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card-industrial p-5 rounded-2xl border border-white/8">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-emerald-400" /> Energy Saved Per Machine (kWh)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid {...CHART_STYLE.grid} />
              <XAxis dataKey="machineId" {...CHART_STYLE.axis} />
              <YAxis {...CHART_STYLE.axis} />
              <Tooltip {...CHART_STYLE.tooltip} />
              <Bar dataKey="savedKwh" fill="#10B981" radius={[4, 4, 0, 0]} name="kWh Saved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Savings log */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Savings Log ({savings.length} events)</h2>
        {savings.length === 0 ? (
          <div className="text-center py-12 card-industrial rounded-2xl border border-white/8 text-slate-500">
            <PiggyBank className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No savings recorded yet — run the AI in ASSISTED or AUTO mode to generate interventions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savings.slice(0, 30).map(s => <SavingCard key={s.id} saving={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
