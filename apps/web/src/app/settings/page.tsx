'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Zap, DollarSign, Bot, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { AIMode } from '@powerguard/shared-types';
import { PageHeader } from '../../components/common/PageHeader';

const AI_MODES: { value: AIMode; label: string; desc: string; color: string }[] = [
  { value: 'AUTO', label: 'AUTO', desc: 'AI executes approved decisions automatically without operator confirmation', color: 'emerald' },
  { value: 'ASSISTED', label: 'ASSISTED', desc: 'AI recommends actions; operator approves before execution (default)', color: 'cyan' },
  { value: 'MANUAL', label: 'MANUAL', desc: 'AI monitors only; all actions require manual operator initiation', color: 'amber' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const canEdit = ['ADMIN', 'ENERGY_MANAGER'].includes(user?.role || '');

  useEffect(() => {
    fetchApi('/api/settings').then(r => {
      if (r.data) { setSettings(r.data); setForm(r.data); }
    }).finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: any) => {
    setForm((f: any) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await fetchApi('/api/settings', { method: 'PUT', body: JSON.stringify(form) });
      setSettings(form);
      setMsg('Settings saved successfully');
      setTimeout(() => setMsg(''), 4000);
    } catch (e: any) {
      setError(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="System Settings" subtitle="Configure energy tariffs, AI mode, and operational thresholds" icon={Settings} />
        <div className="card-industrial p-6 rounded-2xl border border-white/8 animate-pulse h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" subtitle="Configure energy tariffs, AI mode, and operational thresholds" icon={Settings}>
        {canEdit && (
          <button
            id="settings-save-btn"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-medium transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        )}
      </PageHeader>

      {msg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4" /> {msg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {!canEdit && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          <AlertCircle className="w-4 h-4" /> You have read-only access. Settings can only be modified by ADMIN or ENERGY_MANAGER roles.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General */}
        <div className="card-industrial p-5 rounded-2xl border border-white/8">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" /> General Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Factory Name</label>
              <input
                id="settings-factory-name"
                value={form.factoryName || ''}
                onChange={e => handleChange('factoryName', e.target.value)}
                disabled={!canEdit}
                className="w-full bg-surface-300 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Peak Demand Threshold (kW)</label>
              <input
                id="settings-peak-threshold"
                type="number"
                value={form.peakDemandThresholdKw || 160}
                onChange={e => handleChange('peakDemandThresholdKw', parseFloat(e.target.value))}
                disabled={!canEdit}
                className="w-full bg-surface-300 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Forecast Horizon (hours)</label>
              <input
                id="settings-forecast-horizon"
                type="number"
                value={form.forecastHorizonHours || 24}
                onChange={e => handleChange('forecastHorizonHours', parseInt(e.target.value))}
                disabled={!canEdit}
                className="w-full bg-surface-300 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Tariff settings */}
        <div className="card-industrial p-5 rounded-2xl border border-white/8">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" /> Energy Tariff Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Standard Tariff ($/kWh)</label>
              <input
                id="settings-tariff"
                type="number"
                step="0.01"
                value={form.electricityTariff || 0.15}
                onChange={e => handleChange('electricityTariff', parseFloat(e.target.value))}
                disabled={!canEdit}
                className="w-full bg-surface-300 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Peak Tariff ($/kWh)</label>
              <input
                id="settings-peak-tariff"
                type="number"
                step="0.01"
                value={form.peakTariff || 0.28}
                onChange={e => handleChange('peakTariff', parseFloat(e.target.value))}
                disabled={!canEdit}
                className="w-full bg-surface-300 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">CO₂ Emission Factor (kg/kWh)</label>
              <input
                id="settings-emission-factor"
                type="number"
                step="0.01"
                value={form.emissionFactor || 0.42}
                onChange={e => handleChange('emissionFactor', parseFloat(e.target.value))}
                disabled={!canEdit}
                className="w-full bg-surface-300 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* AI Mode */}
        <div className="card-industrial p-5 rounded-2xl border border-white/8 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" /> AI Engine Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {AI_MODES.map(mode => {
              const isActive = form.aiMode === mode.value;
              const colorClass = mode.color === 'emerald' ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' :
                                 mode.color === 'cyan' ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300' :
                                 'border-amber-500/40 bg-amber-500/15 text-amber-300';
              return (
                <button
                  key={mode.value}
                  id={`ai-mode-${mode.value.toLowerCase()}`}
                  onClick={() => canEdit && handleChange('aiMode', mode.value)}
                  disabled={!canEdit}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isActive ? colorClass : 'border-white/8 bg-white/3 hover:border-white/20 text-slate-400'
                  } disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold font-mono">{mode.label}</span>
                    {isActive && <Zap className="w-4 h-4" />}
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-80">{mode.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
