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
  ranking: z.coerce.number().int().min(1, 'Ranking tidak valid.').optional().nullable(),
});

type UniversitasPayload = z.infer<typeof universitasSchema>;

async function withProdiStats<T extends { id: string }>(universitasList: T[]) {
  const stats = await prisma.prodi.groupBy({
    by: ['universitasId'],
    _count: { _all: true },
    _avg: { nilai: true },
  });

  const statsMap = new Map(
    stats.map((s) => [s.universitasId, { jumlahProdi: s._count._all, nilaiRataRata: s._avg.nilai }])
  );

  return universitasList.map((u) => ({
    ...u,
    jumlahProdi: statsMap.get(u.id)?.jumlahProdi ?? 0,
    nilaiRataRata: statsMap.get(u.id)?.nilaiRataRata ?? null,
  }));
}

export async function listUniversitas(req: Request, res: Response) {
  const sort = String(req.query.sort ?? 'ranking_tertinggi');
  const search = String(req.query.search ?? '').trim();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  // default: ranking tertinggi => ranking ASC (1,2,3)
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'ranking_tertinggi') {
    orderBy = { ranking: 'asc' };
  } else if (sort === 'ranking_terendah') {
    orderBy = { ranking: 'desc' };
  }

  const where = search
    ? {
        OR: [
          { namaUniversitas: { contains: search, mode: 'insensitive' as const } },
          { singkatan: { contains: search, mode: 'insensitive' as const } },
          { provinsi: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : undefined;

  const skip = (page - 1) * limit;
  const total = await prisma.universitas.count({ where });

  const universitas = await prisma.universitas.findMany({
    where,
    orderBy,
    skip,
    take: limit,
  });
  const withStats = await withProdiStats(universitas);
  return res.status(200).json({ data: withStats, total, page, limit });
}

export async function createUniversitas(req: Request, res: Response) {
  const parsed = universitasSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { namaUniversitas, singkatan, provinsi, ranking } = parsed.data;

  const universitas = await prisma.universitas.create({
    data: { namaUniversitas, singkatan, provinsi, ranking: ranking ?? null },
  });

  return res.status(201).json({
    message: 'Universitas berhasil ditambahkan.',
    data: { ...universitas, jumlahProdi: 0, nilaiRataRata: null },
  });
}

export async function getUniversitas(req: Request, res: Response) {
  const { id } = req.params;

  const universitas = await prisma.universitas.findUnique({ where: { id } });
  if (!universitas) {
    return res.status(404).json({ message: 'Universitas tidak ditemukan.' });
  }

  const [withStats] = await withProdiStats([universitas]);
  return res.status(200).json({ data: withStats });
}

export async function updateUniversitas(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = universitasSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { namaUniversitas, singkatan, provinsi, ranking } = parsed.data;

  const universitas = await prisma.universitas.update({
    where: { id },
    data: { namaUniversitas, singkatan, provinsi, ranking: ranking ?? null },
  });

  const [withStats] = await withProdiStats([universitas]);
  return res.status(200).json({
    message: 'Universitas berhasil diperbarui.',
    data: withStats,
  });
}

export async function deleteUniversitas(req: Request, res: Response) {
  const { id } = req.params;

  await prisma.universitas.delete({ where: { id } });

  return res.status(200).json({ message: 'Universitas berhasil dihapus.' });
}
