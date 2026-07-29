import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const riwayatSchema = z.object({
  sekolahId: z.string().trim().optional(),
  sekolahNama: z.string().trim().min(1, 'Nama sekolah wajib diisi.'),
  universitasId: z.string().trim().min(1, 'Universitas wajib dipilih.'),
  universitasNama: z.string().trim().min(1, 'Nama universitas wajib diisi.'),
  prodiId: z.string().trim().min(1, 'Program studi wajib dipilih.'),
  prodiNama: z.string().trim().min(1, 'Nama program studi wajib diisi.'),
  avgRapor: z.coerce.number().min(0, 'Nilai rapor tidak valid.').max(100, 'Nilai rapor tidak valid.'),
  avgTKA: z.coerce.number().min(0, 'Nilai TKA tidak valid.').max(100, 'Nilai TKA tidak valid.').optional().nullable(),
  nilaiAkhir: z.coerce.number().min(0, 'Nilai akhir tidak valid.').max(100, 'Nilai akhir tidak valid.'),
  persentase: z.coerce.number().int().min(0, 'Persentase tidak valid.').max(100, 'Persentase tidak valid.'),
  selisih: z.coerce.number(),
});

export async function createRiwayat(req: Request, res: Response) {
  const parsed = riwayatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const {
    sekolahId,
    sekolahNama,
    universitasId,
    universitasNama,
    prodiId,
    prodiNama,
    avgRapor,
    avgTKA,
    nilaiAkhir,
    persentase,
    selisih,
  } = parsed.data;

  const riwayat = await prisma.riwayat.create({
    data: {
      userId: req.user!.userId,
      sekolahId: sekolahId ?? null,
      sekolahNama,
      universitasId,
      universitasNama,
      prodiId,
      prodiNama,
      avgRapor,
      avgTKA: avgTKA ?? null,
      nilaiAkhir,
      persentase,
      selisih,
    },
  });

  return res.status(201).json({ message: 'Riwayat berhasil disimpan.', data: riwayat });
}

export async function listRiwayat(req: Request, res: Response) {
  const search = String(req.query.search ?? '').trim();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  const where = search
    ? {
        OR: [
          { sekolahNama: { contains: search, mode: 'insensitive' as const } },
          { universitasNama: { contains: search, mode: 'insensitive' as const } },
          { prodiNama: { contains: search, mode: 'insensitive' as const } },
          { user: { fullName: { contains: search, mode: 'insensitive' as const } } },
        ],
      }
    : undefined;

  const skip = (page - 1) * limit;
  const total = await prisma.riwayat.count({ where });

  const riwayats = await prisma.riwayat.findMany({
    where,
    include: {
      user: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: limit,
  });

  return res.status(200).json({ data: riwayats, total, page, limit });
}

export async function deleteRiwayat(req: Request, res: Response) {
  const id = String(req.params.id || '');
  if (!id) {
    return res.status(400).json({ message: 'ID riwayat tidak valid.' });
  }

  const existing = await prisma.riwayat.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Riwayat tidak ditemukan.' });
  }

  await prisma.riwayat.delete({ where: { id } });
  return res.status(200).json({ message: 'Riwayat berhasil dihapus.' });
}
