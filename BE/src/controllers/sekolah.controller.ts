import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const sekolahSchema = z.object({
  namaSekolah: z.string().trim().min(2, 'Nama sekolah minimal 2 karakter.'),
  akreditasi: z.enum(['A', 'B', 'C', '-'], {
    message: 'Akreditasi harus A, B, C, atau -.',
  }),
});

type SekolahPayload = z.infer<typeof sekolahSchema>;

export async function listSekolah(req: Request, res: Response) {
  const sekolah = await prisma.sekolah.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return res.status(200).json({ data: sekolah });
}

export async function createSekolah(req: Request, res: Response) {
  const parsed = sekolahSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { namaSekolah, akreditasi } = parsed.data;

  const sekolah = await prisma.sekolah.create({
    data: { namaSekolah, akreditasi },
  });

  return res.status(201).json({
    message: 'Sekolah berhasil ditambahkan.',
    data: sekolah,
  });
}

export async function getSekolah(req: Request, res: Response) {
  const { id } = req.params;

  const sekolah = await prisma.sekolah.findUnique({ where: { id } });
  if (!sekolah) {
    return res.status(404).json({ message: 'Sekolah tidak ditemukan.' });
  }

  return res.status(200).json({ data: sekolah });
}

export async function updateSekolah(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = sekolahSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { namaSekolah, akreditasi } = parsed.data;

  const sekolah = await prisma.sekolah.update({
    where: { id },
    data: { namaSekolah, akreditasi },
  });

  return res.status(200).json({
    message: 'Sekolah berhasil diperbarui.',
    data: sekolah,
  });
}

export async function deleteSekolah(req: Request, res: Response) {
  const { id } = req.params;

  await prisma.sekolah.delete({ where: { id } });

  return res.status(200).json({ message: 'Sekolah berhasil dihapus.' });
}
