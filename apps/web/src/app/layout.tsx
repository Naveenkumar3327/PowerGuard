import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { AppShell } from '../components/layout/AppShell';

export const metadata: Metadata = {
  title: 'POWERGUARD - AI Industrial Energy Management & Multi-Agent System',
  description: 'AI-Based Factory Energy Management, Predictive Demand Forecasting, Anomaly Detection, and Multi-Agent Machine Control Digital Twin.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 min-h-screen flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
        <AuthProvider>
          <SocketProvider>
            <AppShell>{children}</AppShell>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
