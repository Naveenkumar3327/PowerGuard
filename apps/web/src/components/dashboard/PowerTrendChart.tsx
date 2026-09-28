'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useSocket } from '../../context/SocketContext';
import { Activity } from 'lucide-react';

interface Point {
  time: string;
  powerKw: number;
}

export function PowerTrendChart() {
  const { telemetries, summary } = useSocket();
  const [data, setData] = useState<Point[]>([]);

  useEffect(() => {
    if (telemetries.length === 0) return;

    const totalKw = telemetries.reduce((acc, m) => acc + m.powerKw, 0);
    const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setData((prev) => {
      const next = [...prev, { time: nowStr, powerKw: Math.round(totalKw * 10) / 10 }];
      if (next.length > 25) next.shift();
      return next;
    });
  }, [telemetries]);

  return (
    <div className="card-industrial p-5 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Live Factory Aggregate Power (kW)
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Real-time streaming telemetry across all 8 active production & utility machines
          </span>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Total: <strong>{summary.totalPowerKw} kW</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></span>
            <span className="text-slate-400">Threshold: {summary.peakThresholdKw} kW</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
            Accumulating live electrical telemetry packets...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                domain={[0, (dataMax: number) => Math.max(200, Math.ceil(dataMax * 1.25))]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
                formatter={(value: any) => [`${value} kW`, 'Active Load']}
              />
              {summary.peakThresholdKw > 0 && (
                <ReferenceLine
                  y={summary.peakThresholdKw}
                  stroke="#EABF72"
                  strokeDasharray="4 4"
                  label={{
                    value: `Peak limit (${summary.peakThresholdKw} kW)`,
                    fill: '#EABF72',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="powerKw"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#powerGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
