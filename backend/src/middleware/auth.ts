import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/index.js';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'SuperSecretKeyForDevelopmentPurposesMustBeAtLeast32BytesLong2026!';

// Fast O(1) in-memory token verification cache to avoid repeated JWT crypto parsing on parallel calls
const tokenCache = new Map<string, { user: AuthUser; expMs: number }>();

export function generateToken(user: AuthUser, expiresIn = '24h'): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    },
    JWT_SECRET,
    { expiresIn: expiresIn as any, issuer: 'JobAgentPlatform', audience: 'JobAgentClients' }
  );
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authorization token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const now = Date.now();

  // Check fast cache first
  const cached = tokenCache.get(token);
  if (cached) {
    if (now < cached.expMs) {
      req.user = cached.user;
      next();
      return;
    }
    tokenCache.delete(token);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'JobAgentPlatform',
      audience: 'JobAgentClients'
    }) as any;

    const authUser: AuthUser = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName
    };

    const expMs = decoded.exp ? decoded.exp * 1000 : now + 24 * 60 * 60 * 1000;
    // Bound cache size cleanly
    if (tokenCache.size > 2000) {
      tokenCache.clear();
    }
    tokenCache.set(token, { user: authUser, expMs });

    req.user = authUser;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden: Insufficient role permissions' });
      return;
    }
    next();
  };
}
