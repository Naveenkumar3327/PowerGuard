'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import { Zap, Eye, EyeOff, UserPlus, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

const ROLES = [
  { value: 'VIEWER', label: 'Viewer', desc: 'Read-only access to dashboards' },
  { value: 'OPERATOR', label: 'Operator', desc: 'Machine monitoring & control' },
  { value: 'ENERGY_MANAGER', label: 'Energy Manager', desc: 'Analytics & decision approvals' },
  { value: 'ADMIN', label: 'Administrator', desc: 'Full platform access' },
];

const DEPARTMENTS = ['Production', 'Engineering', 'Energy', 'Maintenance', 'Executive', 'Sustainability', 'IT'];

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'OPERATOR', department: 'Production' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (res.token && res.user) {
        setSuccess('Account created! Redirecting...');
        // Auto-login after register
        await login(form.email, form.password);
        router.replace('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/25">
              <div className="w-full h-full bg-surface-400 rounded-[10px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white tracking-wider">POWERGUARD</div>
              <div className="text-[11px] font-mono text-emerald-400/80 uppercase tracking-widest -mt-0.5">AI Energy OS</div>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Create your operator account</p>
        </div>

        {/* Register Card */}
        <div className="card-industrial p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            Create Account
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reg-name">
                Full Name
              </label>
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. John Smith"
                className="w-full bg-surface-300 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reg-email">
                Email Address
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@company.com"
                className="w-full bg-surface-300 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reg-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full bg-surface-300 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label="Toggle password"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reg-role">
                  Role
                </label>
                <select
                  id="reg-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full bg-surface-300 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reg-dept">
                  Department
                </label>
                <select
                  id="reg-dept"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full bg-surface-300 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role description */}
            <div className="p-2.5 rounded-lg bg-surface-300/50 border border-white/5 text-[11px] text-slate-400 font-mono">
              {ROLES.find(r => r.value === form.role)?.desc}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>Create Account <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-slate-500 text-xs">Already have an account? </span>
            <Link href="/login" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              Sign in
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6 font-mono">
          POWERGUARD AI Energy OS &bull; Final Year Project &bull; 2026
        </p>
      </div>
    </div>
  );
}
