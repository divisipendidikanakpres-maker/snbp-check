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
  const riwayats = await prisma.riwayat.findMany({
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
  });

  return res.status(200).json({ data: riwayats });
}
