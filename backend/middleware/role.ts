import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export function authorizeRoles(...allowedRoles: Array<'admin' | 'trainer' | 'member'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] roles. Your current role is '${req.user.role}'.`,
      });
    }

    next();
  };
}
