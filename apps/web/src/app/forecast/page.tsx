'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Gauge, AlertTriangle } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { PageHeader } from '../../components/common/PageHeader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CHART_STYLE = {
  tooltip: { contentStyle: { background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11, color: '#CBD5E1' } },
  grid: { stroke: 'rgba(255,255,255,0.04)', strokeDasharray: '3 3' },
  axis: { tick: { fill: '#64748B', fontSize: 10 }, axisLine: false, tickLine: false },
};

export default function ForecastPage() {
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/forecast').then(r => { if (r.data) setForecast(r.data); }).finally(() => setLoading(false));
    const i = setInterval(() => fetchApi('/api/forecast').then(r => { if (r.data) setForecast(r.data); }), 30000);
    return () => clearInterval(i);
  }, []);

  const peakThreshold = 160;

  return (
    <div className="space-y-6">
      <PageHeader title="Demand Forecast" subtitle="AI-powered 24-hour energy demand prediction with peak risk analysis" icon={TrendingUp}>
        {forecast && (
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">
            {(forecast.confidence * 100).toFixed(0)}% Confidence
          </span>
        )}
      </PageHeader>

      {/* Forecast KPIs */}
      {forecast && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Predicted Total', value: `${forecast.predictedTotalPowerKw?.toFixed(1)} kW`, icon: TrendingUp, color: 'text-cyan-400' },
            { label: 'Predicted Peak', value: `${forecast.predictedPeakKw?.toFixed(1)} kW`, icon: Gauge, color: forecast.predictedPeakKw > peakThreshold ? 'text-red-400' : 'text-emerald-400' },
            { label: 'Peak Time', value: forecast.peakTime || 'N/A', icon: Clock, color: 'text-amber-400' },
            { label: 'Peak Risk', value: forecast.predictedPeakKw > peakThreshold ? 'HIGH' : 'LOW', icon: AlertTriangle, color: forecast.predictedPeakKw > peakThreshold ? 'text-red-400' : 'text-emerald-400' },
          ].map(k => (
            <div key={k.label} className="card-industrial p-4 rounded-xl border border-white/8">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">{k.label}</span>
                <k.icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Forecast chart */}
      <div className="card-industrial p-5 rounded-2xl border border-white/8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> 24-Hour Load Forecast (kW)
          </h2>
          {forecast && <span className="text-[10px] text-slate-400 font-mono">Confidence: {(forecast.confidence * 100).toFixed(0)}%</span>}
        </div>

        {loading ? (
          <div className="h-64 animate-pulse bg-white/3 rounded-xl" />
        ) : forecast?.dataPoints?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecast.dataPoints} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...CHART_STYLE.grid} />
              <XAxis dataKey="time" {...CHART_STYLE.axis} />
              <YAxis {...CHART_STYLE.axis} domain={['auto', 'auto']} />
              <Tooltip {...CHART_STYLE.tooltip} />
              <ReferenceLine y={peakThreshold} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Peak Threshold', fill: '#EF4444', fontSize: 10 }} />
              {forecast.dataPoints[0]?.actual !== undefined && (
                <Area type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} fill="url(#actualGrad)" name="Actual kW" dot={false} />
              )}
              <Area type="monotone" dataKey="forecast" stroke="#06B6D4" strokeWidth={2} fill="url(#forecastGrad)" strokeDasharray="5 3" name="Forecast kW" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm flex-col gap-2">
            <TrendingUp className="w-10 h-10 opacity-20" />
            <p>Forecast data loading — simulation needs ~1 minute of data</p>
          </div>
        )}
      </div>

      {/* Peak risk indicator */}
      {forecast && (
        <div className={`card-industrial p-4 rounded-xl border ${forecast.predictedPeakKw > peakThreshold ? 'border-red-500/30 bg-red-500/5' : 'border-emerald-500/20'}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${forecast.predictedPeakKw > peakThreshold ? 'text-red-400' : 'text-emerald-400'}`} />
            <div>
              <div className={`text-sm font-semibold ${forecast.predictedPeakKw > peakThreshold ? 'text-red-300' : 'text-emerald-300'}`}>
                {forecast.predictedPeakKw > peakThreshold ? 'Peak Demand Surcharge Risk Detected' : 'Factory Load Within Safe Operating Range'}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Predicted peak of {forecast.predictedPeakKw?.toFixed(1)} kW vs threshold of {peakThreshold} kW.
                {forecast.predictedPeakKw > peakThreshold ? ' Consider load-shedding non-critical equipment around ' + forecast.peakTime + '.' : ' No immediate action required.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
