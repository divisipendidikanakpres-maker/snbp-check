import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const lookupSchema = z.object({
  nama: z.string().trim().min(1, 'Nama wajib diisi.'),
});

export async function listKelompok(req: Request, res: Response) {
  const data = await prisma.kelompok.findMany({ orderBy: { nama: 'asc' } });
  return res.status(200).json({ data });
}

export async function createKelompok(req: Request, res: Response) {
  const parsed = lookupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const existing = await prisma.kelompok.findUnique({
    where: { nama: parsed.data.nama },
  });
  if (existing) {
    return res.status(409).json({ message: 'Kelompok sudah ada.' });
  }

  const data = await prisma.kelompok.create({ data: parsed.data });
  return res.status(201).json({ message: 'Kelompok berhasil ditambahkan.', data });
}

export async function deleteKelompok(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.kelompok.delete({ where: { id } });
  return res.status(200).json({ message: 'Kelompok berhasil dihapus.' });
}

export async function listJenjang(req: Request, res: Response) {
  const data = await prisma.jenjang.findMany({ orderBy: { nama: 'asc' } });
  return res.status(200).json({ data });
}

export async function createJenjang(req: Request, res: Response) {
  const parsed = lookupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const existing = await prisma.jenjang.findUnique({
    where: { nama: parsed.data.nama },
  });
  if (existing) {
    return res.status(409).json({ message: 'Jenjang sudah ada.' });
  }

  const data = await prisma.jenjang.create({ data: parsed.data });
  return res.status(201).json({ message: 'Jenjang berhasil ditambahkan.', data });
}

export async function deleteJenjang(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.jenjang.delete({ where: { id } });
  return res.status(200).json({ message: 'Jenjang berhasil dihapus.' });
}
