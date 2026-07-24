import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { z } from 'zod';
import { COOKIE_MAX_AGE_MS, signToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter.'),
  phone: z.string().trim().min(8, 'Nomor telepon tidak valid.'),
  email: z.string().trim().email('Email tidak valid.'),
  password: z.string().min(8, 'Password minimal 8 karakter.'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Email tidak valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
});

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  secure: isProduction,
  path: '/',
  maxAge: COOKIE_MAX_AGE_MS,
};

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { fullName, phone, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'Email sudah terdaftar.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { fullName, phone, email, password: hashedPassword },
  });

  return res.status(201).json({
    message: 'Registrasi berhasil.',
    user: { id: user.id, fullName: user.fullName, email: user.email },
  });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Email atau password salah.' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Email atau password salah.' });
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.cookie('token', token, COOKIE_OPTIONS);

  return res.status(200).json({
    message: 'Login berhasil.',
    user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
  });
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('token', { ...COOKIE_OPTIONS, maxAge: undefined });
  return res.status(200).json({ message: 'Logout berhasil.' });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, fullName: true, phone: true, email: true, role: true },
  });

  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan.' });
  }

  return res.status(200).json({ user });
}
