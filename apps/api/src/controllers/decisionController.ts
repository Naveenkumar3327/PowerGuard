import { Request, Response } from 'express';
import { orchestrator } from '../orchestration/AgentOrchestrator';
import { AuthRequest } from '../middleware/authMiddleware';

export async function getDecisions(req: Request, res: Response): Promise<void> {
  const statusFilter = req.query.status as string;
  let decisions = orchestrator.getDecisions();

  if (statusFilter && statusFilter !== 'ALL') {
    decisions = decisions.filter((d) => d.status === statusFilter);
  }

  res.json({
    success: true,
    count: decisions.length,
    data: decisions,
  });
}

export async function getDecisionById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const decision = orchestrator.getDecisions().find((d) => d.id === id);

  if (!decision) {
    res.status(404).json({ success: false, error: 'Decision not found' });
    return;
  }

  res.json({
    success: true,
    data: decision,
  });
}

export async function approveDecision(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const operatorName = req.user?.name || 'Authorized Operator';

  const result = orchestrator.approveDecision(id, operatorName);

  if (!result.success) {
    res.status(400).json({ success: false, error: result.message });
    return;
  }

  res.json({
    success: true,
    message: result.message,
    data: result.decision,
  });
}

export async function rejectDecision(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const operatorName = req.user?.name || 'Authorized Operator';

  const result = orchestrator.rejectDecision(id, operatorName);

  if (!result.success) {
    res.status(400).json({ success: false, error: result.message });
    return;
  }

  res.json({
    success: true,
    message: result.message,
  });
}
