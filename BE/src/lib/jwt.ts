import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = '7d';
export const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
