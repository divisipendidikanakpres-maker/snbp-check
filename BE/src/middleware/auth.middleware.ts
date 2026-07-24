import { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { verifyToken } from '../lib/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string; role: Role };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Belum login.' });
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Sesi tidak valid atau kedaluwarsa.' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Akses ditolak.' });
  }
  next();
}
