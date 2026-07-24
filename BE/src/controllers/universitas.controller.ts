import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const universitasSchema = z.object({
  namaUniversitas: z
    .string()
    .trim()
    .min(2, 'Nama universitas minimal 2 karakter.'),
  singkatan: z.string().trim().min(1, 'Singkatan wajib diisi.'),
  provinsi: z.string().trim().min(2, 'Provinsi wajib diisi.'),
});

type UniversitasPayload = z.infer<typeof universitasSchema>;

export async function listUniversitas(req: Request, res: Response) {
  const universitas = await prisma.universitas.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return res.status(200).json({ data: universitas });
}

export async function createUniversitas(req: Request, res: Response) {
  const parsed = universitasSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { namaUniversitas, singkatan, provinsi } = parsed.data;

  const universitas = await prisma.universitas.create({
    data: { namaUniversitas, singkatan, provinsi },
  });

  return res.status(201).json({
    message: 'Universitas berhasil ditambahkan.',
    data: universitas,
  });
}

export async function getUniversitas(req: Request, res: Response) {
  const { id } = req.params;

  const universitas = await prisma.universitas.findUnique({ where: { id } });
  if (!universitas) {
    return res.status(404).json({ message: 'Universitas tidak ditemukan.' });
  }

  return res.status(200).json({ data: universitas });
}

export async function updateUniversitas(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = universitasSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { namaUniversitas, singkatan, provinsi } = parsed.data;

  const universitas = await prisma.universitas.update({
    where: { id },
    data: { namaUniversitas, singkatan, provinsi },
  });

  return res.status(200).json({
    message: 'Universitas berhasil diperbarui.',
    data: universitas,
  });
}

export async function deleteUniversitas(req: Request, res: Response) {
  const { id } = req.params;

  await prisma.universitas.delete({ where: { id } });

  return res.status(200).json({ message: 'Universitas berhasil dihapus.' });
}
