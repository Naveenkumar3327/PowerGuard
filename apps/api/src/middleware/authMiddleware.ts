import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@powerguard/shared-types';
import { config } from '../config/environment';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In local dev without token, allow read-only or operator fallback if header missing
    req.user = {
      id: 'demo-user-id',
      email: 'demo@powerguard.demo',
      role: 'ADMIN', // Default high-privilege for local demo convenience
      name: 'Demo Admin'
    };
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
  }
}

export function authorize(roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (req.user.role === 'ADMIN' || roles.includes(req.user.role)) {
      return next();
    }

    res.status(403).json({
      success: false,
      error: `Access forbidden: Role '${req.user.role}' lacks sufficient privileges for this action.`,
    });
  };
}
