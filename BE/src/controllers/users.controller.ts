import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const updateRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], { message: 'Role harus USER atau ADMIN.' }),
});

const updateUserSchema = z.object({
  fullName: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter.'),
  email: z.string().trim().email('Email tidak valid.'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter.')
    .optional()
    .or(z.literal('')),
});

export async function listUsers(req: Request, res: Response) {
  const search = String(req.query.search ?? '').trim();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : undefined;

  const skip = (page - 1) * limit;
  const total = await prisma.user.count({ where });

  const users = await prisma.user.findMany({
    where,
    select: { id: true, fullName: true, phone: true, email: true, role: true },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });
  return res.status(200).json({ data: users, total, page, limit });
}

export async function updateUserRole(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  if (id === req.user!.userId) {
    return res
      .status(400)
      .json({ message: 'Tidak bisa mengubah akun sendiri.' });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, fullName: true, phone: true, email: true, role: true },
  });

  return res.status(200).json({
    message: 'Role user berhasil diperbarui.',
    data: user,
  });
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { fullName, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { email, NOT: { id } },
  });
  if (existing) {
    return res.status(409).json({ message: 'Email sudah digunakan.' });
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      fullName,
      email,
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    },
    select: { id: true, fullName: true, phone: true, email: true, role: true },
  });

  return res.status(200).json({
    message: 'Akun berhasil diperbarui.',
    data: user,
  });
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  if (id === req.user!.userId) {
    return res
      .status(400)
      .json({ message: 'Tidak bisa menghapus akun sendiri.' });
  }

  await prisma.user.delete({ where: { id } });

  return res.status(200).json({ message: 'User berhasil dihapus.' });
}
