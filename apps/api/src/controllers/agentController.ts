import { Request, Response } from 'express';
import { AgentStatus } from '@powerguard/shared-types';
import { orchestrator } from '../orchestration/AgentOrchestrator';

export async function getAgents(req: Request, res: Response): Promise<void> {
  const activities = orchestrator.getRecentActivities();
  const decisions = orchestrator.getDecisions();
  const alerts = orchestrator.getAlerts();

  const agents: AgentStatus[] = [
    {
      agentId: 'agent-1',
      name: 'Energy Monitoring Agent',
      type: 'Telemetry & Real Power Analyst',
      status: 'ACTIVE',
      lastExecution: activities[0]?.timestamp || new Date().toLocaleTimeString(),
      tasksProcessed: 1420 + activities.length * 3,
      decisionsMade: 0,
      confidence: 0.96,
      currentActivity: 'Scanning 3-phase voltages, currents, and real-power factors across 8 machines',
    },
    {
      agentId: 'agent-2',
      name: 'Anomaly Detection Agent',
      type: 'ML Outlier & Isolation Forest Engine',
      status: 'ACTIVE',
      lastExecution: activities[0]?.timestamp || new Date().toLocaleTimeString(),
      tasksProcessed: 1240 + alerts.length,
      decisionsMade: alerts.length,
      confidence: 0.92,
      currentActivity: 'Running multivariate Isolation Forest & Z-Score standard deviation tracking',
    },
    {
      agentId: 'agent-3',
      name: 'Energy Forecasting Agent',
      type: 'Predictive Demand & Peak Analyst',
      status: 'ACTIVE',
      lastExecution: activities[0]?.timestamp || new Date().toLocaleTimeString(),
      tasksProcessed: 890,
      decisionsMade: 0,
      confidence: 0.89,
      currentActivity: 'Projecting 1h, 6h, and 24h factory load curves with diurnal harmonics',
    },
    {
      agentId: 'agent-4',
      name: 'Energy Optimization Agent',
      type: 'Constraint-Aware Schedule & Load Optimizer',
      status: 'ACTIVE',
      lastExecution: activities[0]?.timestamp || new Date().toLocaleTimeString(),
      tasksProcessed: 640 + decisions.length,
      decisionsMade: decisions.length,
      confidence: 0.94,
      currentActivity: 'Evaluating idle equipment standby opportunities under priority constraints',
    },
    {
      agentId: 'agent-5',
      name: 'Machine Control Agent',
      type: 'Safe Digital Twin Command Dispatcher',
      status: 'ACTIVE',
      lastExecution: activities[0]?.timestamp || new Date().toLocaleTimeString(),
      tasksProcessed: 320,
      decisionsMade: decisions.filter(d => d.status === 'EXECUTED').length,
      confidence: 0.99,
      currentActivity: 'Managing virtual machine commands with hardware lockout safety interlocks',
    },
    {
      agentId: 'agent-6',
      name: 'Alert & Incident Agent',
      type: 'Industrial Safety & Triage Manager',
      status: 'ACTIVE',
      lastExecution: activities[0]?.timestamp || new Date().toLocaleTimeString(),
      tasksProcessed: 780,
      decisionsMade: alerts.length,
      confidence: 0.95,
      currentActivity: 'Triaging thermal runaway risks and peak demand threshold warnings',
    },
    {
      agentId: 'agent-7',
      name: 'Supervisor / Explainability Agent',
      type: 'Cross-Agent Arbiter & Explainable AI',
      status: 'ACTIVE',
      lastExecution: activities[0]?.timestamp || new Date().toLocaleTimeString(),
      tasksProcessed: 590 + decisions.length,
      decisionsMade: decisions.length,
      confidence: 0.93,
      currentActivity: 'Synthesizing evidence, impact, and operational risk into human-readable rationale',
    },
  ];

  res.json({
    success: true,
    count: agents.length,
    data: agents,
  });
}

export async function getAgentActivity(req: Request, res: Response): Promise<void> {
  const activities = orchestrator.getRecentActivities();
  res.json({
    success: true,
    count: activities.length,
    data: activities,
  });
}
