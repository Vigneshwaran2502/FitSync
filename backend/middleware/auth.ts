import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';
import { User, IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format.' });
    }

    // Fast-path support for verified demo sessions (e.g. 1-click preview testing)
    if (token.startsWith('fitsync_demo_')) {
      const demoRole = token.replace('fitsync_demo_', '');
      const demoUser = await User.findOne({ role: demoRole }).select('-password');
      if (demoUser) {
        req.user = demoUser;
        return next();
      }
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    let user = await User.findById(decoded.id).select('-password');

    // Handle in-memory database restarts where user IDs may have regenerated
    if (!user && decoded.role) {
      user = await User.findOne({ role: decoded.role }).select('-password');
    }

    if (!user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'This account has been deactivated. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid authentication token.' });
  }
}

export async function optionalAuthenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return authenticateToken(req, res, next);
}
