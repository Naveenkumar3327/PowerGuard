'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@powerguard/shared-types';
import { fetchApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('powerguard_token');
    const savedUser = localStorage.getItem('powerguard_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {}
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('powerguard_token', res.token);
        localStorage.setItem('powerguard_user', JSON.stringify(res.user));
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('powerguard_token');
    localStorage.removeItem('powerguard_user');
  };

  const switchDemoRole = async (role: UserRole) => {
    const roleEmailMap: Record<UserRole, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@powerguard.demo', pass: 'Admin@123' },
      ENERGY_MANAGER: { email: 'manager@powerguard.demo', pass: 'Manager@123' },
      OPERATOR: { email: 'operator@powerguard.demo', pass: 'Operator@123' },
      VIEWER: { email: 'viewer@powerguard.demo', pass: 'Viewer@123' },
    };
    const target = roleEmailMap[role];
    await login(target.email, target.pass);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
