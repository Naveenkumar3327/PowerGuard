'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Telemetry, 
  FactorySummary, 
  Alert, 
  AIDecision, 
  EnergySaving, 
  AgentActivityLog 
} from '@powerguard/shared-types';
import { getSocket } from '../lib/socket';
import { fetchApi } from '../lib/api';

interface SocketContextType {
  telemetries: Telemetry[];
  summary: FactorySummary;
  alerts: Alert[];
  decisions: AIDecision[];
  activities: AgentActivityLog[];
  savings: EnergySaving[];
  isConnected: boolean;
  refreshData: () => Promise<void>;
}

const defaultSummary: FactorySummary = {
  totalPowerKw: 0,
  totalEnergyKwh: 0,
  activeMachines: 0,
  totalMachines: 0,
  factoryEfficiency: 0,
  energySavedTodayKwh: 0,
  costSavedToday: 0,
  co2SavedTodayKg: 0,
  activeAlertsCount: 0,
  pendingDecisionsCount: 0,
  currentPeakKw: 0,
  peakThresholdKw: 0,
  isPeakWarning: false,
  simulationSpeed: 1,
  simulationRunning: true,
  aiMode: 'ASSISTED',
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [telemetries, setTelemetries] = useState<Telemetry[]>([]);
  const [summary, setSummary] = useState<FactorySummary>(defaultSummary);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [activities, setActivities] = useState<AgentActivityLog[]>([]);
  const [savings, setSavings] = useState<EnergySaving[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const refreshData = async () => {
    try {
      const [telRes, alertRes, decRes, actRes] = await Promise.allSettled([
        fetchApi('/api/telemetry'),
        fetchApi('/api/alerts'),
        fetchApi('/api/decisions'),
        fetchApi('/api/agents/activity'),
      ]);

      if (telRes.status === 'fulfilled' && telRes.value?.data) {
        setTelemetries(telRes.value.data);
      }
      if (alertRes.status === 'fulfilled' && alertRes.value?.data) {
        setAlerts(alertRes.value.data);
      }
      if (decRes.status === 'fulfilled' && decRes.value?.data) {
        setDecisions(decRes.value.data);
      }
      if (actRes.status === 'fulfilled' && actRes.value?.data) {
        setActivities(actRes.value.data);
      }
    } catch (err) {
      console.error('[SocketContext] Error loading initial data:', err);
    }
  };

  useEffect(() => {
    refreshData();

    const socket = getSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleTelemetry = (data: Telemetry[]) => {
      setTelemetries(data);
    };

    const handleSummary = (data: FactorySummary) => {
      setSummary(data);
    };

    const handleAlertCreated = (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev.filter((a) => a.id !== alert.id)]);
    };

    const handleDecisionCreated = (dec: AIDecision) => {
      setDecisions((prev) => [dec, ...prev.filter((d) => d.id !== dec.id)]);
    };

    const handleDecisionUpdated = (dec: AIDecision) => {
      setDecisions((prev) => prev.map((d) => (d.id === dec.id ? dec : d)));
    };

    const handleActivity = (act: AgentActivityLog) => {
      setActivities((prev) => [act, ...prev.slice(0, 49)]);
    };

    const handleSaving = (sav: EnergySaving) => {
      setSavings((prev) => [sav, ...prev]);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('machineTelemetryUpdated', handleTelemetry);
    socket.on('factorySummaryUpdated', handleSummary);
    socket.on('alertCreated', handleAlertCreated);
    socket.on('decisionCreated', handleDecisionCreated);
    socket.on('decisionUpdated', handleDecisionUpdated);
    socket.on('agentActivity', handleActivity);
    socket.on('savingRecorded', handleSaving);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('machineTelemetryUpdated', handleTelemetry);
      socket.off('factorySummaryUpdated', handleSummary);
      socket.off('alertCreated', handleAlertCreated);
      socket.off('decisionCreated', handleDecisionCreated);
      socket.off('decisionUpdated', handleDecisionUpdated);
      socket.off('agentActivity', handleActivity);
      socket.off('savingRecorded', handleSaving);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        telemetries,
        summary,
        alerts,
        decisions,
        activities,
        savings,
        isConnected,
        refreshData,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
