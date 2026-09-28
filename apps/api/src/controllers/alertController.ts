import { Request, Response } from 'express';
import { orchestrator } from '../orchestration/AgentOrchestrator';
import { AuthRequest } from '../middleware/authMiddleware';

export async function getAlerts(req: Request, res: Response): Promise<void> {
  const { severity, status, machineId } = req.query;
  let alerts = orchestrator.getAlerts();

  if (severity && severity !== 'ALL') {
    alerts = alerts.filter((a) => a.severity === severity);
  }

  if (status && status !== 'ALL') {
    alerts = alerts.filter((a) => a.status === status);
  }

  if (machineId && machineId !== 'ALL') {
    alerts = alerts.filter((a) => a.machineId === machineId);
  }

  res.json({
    success: true,
    count: alerts.length,
    data: alerts,
  });
}

export async function acknowledgeAlert(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const alert = orchestrator.getAlerts().find((a) => a.id === id);

  if (!alert) {
    res.status(404).json({ success: false, error: 'Alert not found' });
    return;
  }

  alert.status = 'ACKNOWLEDGED';
  alert.acknowledgedBy = req.user?.name || 'Operator';
  alert.acknowledgedAt = new Date().toISOString();

  res.json({
    success: true,
    message: `Alert '${alert.title}' acknowledged`,
    data: alert,
  });
}

export async function resolveAlert(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const alert = orchestrator.getAlerts().find((a) => a.id === id);

  if (!alert) {
    res.status(404).json({ success: false, error: 'Alert not found' });
    return;
  }

  alert.status = 'RESOLVED';
  alert.resolvedBy = req.user?.name || 'Operator';
  alert.resolvedAt = new Date().toISOString();

  res.json({
    success: true,
    message: `Alert '${alert.title}' resolved`,
    data: alert,
  });
}
