'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SimulationBanner } from './SimulationBanner';

const PUBLIC_ROUTES = ['/login', '/register'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      router.replace('/login');
    }
    if (!loading && user && isPublicRoute) {
      router.replace('/');
    }
  }, [user, loading, isPublicRoute, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          <span className="text-sm text-slate-400 font-mono">Initializing POWERGUARD...</span>
        </div>
      </div>
    );
  }

  // Public pages (login, register) — no sidebar/header
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Unauthenticated — render nothing (router will redirect)
  if (!user) {
    return null;
  }

  // Authenticated — full app shell
  return (
    <>
      <div className="lg:pl-60">
        <SimulationBanner />
      </div>
      <Sidebar />
      <div className="min-h-screen min-w-0 flex-1 pb-[76px] lg:pl-60 lg:pb-0">
        <Header />
        <main className="mx-auto w-full max-w-[1760px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {children}
        </main>
      </div>
    </>
  );
}
