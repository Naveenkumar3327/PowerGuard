'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useSocket } from '../../context/SocketContext';
import { Layers } from 'lucide-react';
import { Department } from '@powerguard/shared-types';

const COLORS = ['#10B981', '#06B6D4', '#F59E0B', '#8B5CF6', '#3B82F6'];

export function DepartmentEnergyChart() {
  const { telemetries } = useSocket();

  // Machine to department map
  const deptMap: Record<Department, number> = {
    Production: 0,
    Assembly: 0,
    Packaging: 0,
    Utilities: 0,
    HVAC: 0,
  };

  // Pre-seed with machines if telemetries loaded
  telemetries.forEach((t) => {
    let dept: Department = 'Production';
    if (['M-001', 'M-003'].includes(t.machineId)) dept = 'Production';
    else if (['M-004', 'M-007'].includes(t.machineId)) dept = 'Assembly';
    else if (['M-008'].includes(t.machineId)) dept = 'Packaging';
    else if (['M-002', 'M-005'].includes(t.machineId)) dept = 'Utilities';
    else if (['M-006'].includes(t.machineId)) dept = 'HVAC';

    deptMap[dept] = Math.round(((deptMap[dept] || 0) + t.powerKw) * 10) / 10;
  });

  const data = Object.entries(deptMap).map(([dept, powerKw]) => ({
    department: dept,
    powerKw,
  }));

  return (
    <div className="card-industrial p-5 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Department Load Distribution
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Current power draw partitioned by manufacturing zone
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] w-full">
        {telemetries.length === 0 ? (
          <div className="flex h-full min-h-[220px] items-center justify-center text-center font-mono text-[10px] text-slate-500">
            Waiting for live department telemetry
          </div>
        ) : <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} />
            <YAxis
              type="category"
              dataKey="department"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
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
            <Bar dataKey="powerKw" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>}
      </div>
    </div>
  );
}
