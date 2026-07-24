import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const updateRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], { message: 'Role harus USER atau ADMIN.' }),
});

export async function listUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: { id: true, fullName: true, phone: true, email: true, role: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.status(200).json({ data: users });
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
