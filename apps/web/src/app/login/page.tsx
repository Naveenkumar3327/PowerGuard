'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Zap, Eye, EyeOff, Shield, ChevronRight, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'ADMIN', label: 'Admin', email: 'admin@powerguard.demo', pass: 'Admin@123', color: 'emerald', desc: 'Full control' },
  { role: 'ENERGY_MANAGER', label: 'Manager', email: 'manager@powerguard.demo', pass: 'Manager@123', color: 'cyan', desc: 'Analytics access' },
  { role: 'OPERATOR', label: 'Operator', email: 'operator@powerguard.demo', pass: 'Operator@123', color: 'purple', desc: 'Machine control' },
  { role: 'VIEWER', label: 'Viewer', email: 'viewer@powerguard.demo', pass: 'Viewer@123', color: 'slate', desc: 'Read only' },
];

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [filling, setFilling] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  const handleDemoLogin = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    setFilling(acc.role);
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
    try {
      await login(acc.email, acc.pass);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setFilling('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl pointer-events-none" />

      {/* Grid background */}
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
          <p className="text-slate-400 text-sm">Sign in to access the industrial energy management platform</p>
        </div>

        {/* Login Card */}
        <div className="card-industrial p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Operator Sign In
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@powerguard.demo"
                className="w-full bg-surface-300 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface-300 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>Sign In <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-slate-500 text-xs">Don&apos;t have an account? </span>
            <Link href="/register" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              Create account
            </Link>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-5">
          <div className="text-xs text-slate-500 font-mono uppercase tracking-wider text-center mb-3">
            Quick Demo Access — Click to Sign In
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.role}
                id={`demo-login-${acc.role.toLowerCase()}`}
                onClick={() => handleDemoLogin(acc)}
                disabled={filling === acc.role || loading}
                className="card-industrial p-3 rounded-xl border border-white/8 hover:border-emerald-500/30 text-left transition-all group disabled:opacity-60"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{acc.label}</span>
                  {filling === acc.role ? (
                    <div className="w-3 h-3 border border-emerald-400/50 border-t-emerald-400 rounded-full animate-spin" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{acc.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6 font-mono">
          POWERGUARD AI Energy OS &bull; Final Year Project &bull; 2026
        </p>
      </div>
    </div>
  );
}
