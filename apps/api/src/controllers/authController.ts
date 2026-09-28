import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@powerguard/shared-types';
import { config } from '../config/environment';
import { UserModel } from '../models';
import { isConnectedToDb } from '../config/database';
import { AuthRequest } from '../middleware/authMiddleware';

// Demo accounts in-memory registry for instant access
const DEMO_USERS: Record<string, { id: string; name: string; role: UserRole; pass: string }> = {
  'admin@powerguard.demo': { id: 'usr-admin', name: 'Factory Director Admin', role: 'ADMIN', pass: 'Admin@123' },
  'manager@powerguard.demo': { id: 'usr-mgr', name: 'Chief Energy Manager', role: 'ENERGY_MANAGER', pass: 'Manager@123' },
  'operator@powerguard.demo': { id: 'usr-op', name: 'Lead Floor Operator', role: 'OPERATOR', pass: 'Operator@123' },
  'viewer@powerguard.demo': { id: 'usr-view', name: 'Sustainability Auditor', role: 'VIEWER', pass: 'Viewer@123' },
};

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check Demo users first for instant zero-config testing
  if (DEMO_USERS[normalizedEmail]) {
    const demo = DEMO_USERS[normalizedEmail];
    if (password === demo.pass || password === 'password' || password === 'demo123') {
      const token = jwt.sign(
        { id: demo.id, email: normalizedEmail, role: demo.role, name: demo.name },
        config.jwtSecret,
        { expiresIn: '7d' }
      );
      res.json({
        success: true,
        token,
        user: { id: demo.id, email: normalizedEmail, name: demo.name, role: demo.role }
      });
      return;
    }
  }

  if (isConnectedToDb) {
    try {
      const user = await UserModel.findOne({ email: normalizedEmail });
      if (user && (await bcrypt.compare(password, user.passwordHash))) {
        const token = jwt.sign(
          { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
          config.jwtSecret,
          { expiresIn: '7d' }
        );
        res.json({
          success: true,
          token,
          user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
        return;
      }
    } catch (err: any) {
      console.error('[Auth] Database error during login:', err.message);
    }
  }

  res.status(401).json({ success: false, error: 'Invalid email or password' });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole: UserRole = role || 'VIEWER';

    if (isConnectedToDb) {
      const existing = await UserModel.findOne({ email: normalizedEmail });
      if (existing) {
        res.status(409).json({ success: false, error: 'Email already registered' });
        return;
      }

      const user = await UserModel.create({
        name,
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
        department: department || 'Production',
      });

      const token = jwt.sign(
        { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        token,
        user: { id: user._id, email: user.email, name: user.name, role: user.role }
      });
      return;
    }

    // In-memory register
    const newId = `usr-${Date.now()}`;
    const token = jwt.sign(
      { id: newId, email: normalizedEmail, role: assignedRole, name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      success: true,
      token,
      user: { id: newId, email: normalizedEmail, name, role: assignedRole }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  res.json({
    success: true,
    user: req.user
  });
}

export async function getDemoAccounts(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    accounts: [
      { email: 'admin@powerguard.demo', role: 'ADMIN', name: 'Factory Director Admin', description: 'Full access to all controls, AI policies, and configurations' },
      { email: 'manager@powerguard.demo', role: 'ENERGY_MANAGER', name: 'Chief Energy Manager', description: 'Access to analytics, forecast models, and decision approvals' },
      { email: 'operator@powerguard.demo', role: 'OPERATOR', name: 'Lead Floor Operator', description: 'Access to machine monitoring, digital twin controls, and alerts' },
      { email: 'viewer@powerguard.demo', role: 'VIEWER', name: 'Sustainability Auditor', description: 'Read-only access to dashboards and environmental reports' },
    ]
  });
}
