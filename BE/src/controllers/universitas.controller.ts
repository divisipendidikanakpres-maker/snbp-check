import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { searchPT } from '../lib/pddikti';

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
  const limit = Number(req.query.limit) || 20;

  // — PDDikti: search by explicit query —
  if (search) {
    try {
      const pddiktiResults = await searchPT(search);
      if (pddiktiResults && pddiktiResults.length > 0) {
        const total = pddiktiResults.length;
        const startIndex = (page - 1) * limit;
        const paginated = pddiktiResults.slice(startIndex, startIndex + limit);
        const transformed = paginated.map((pt) => ({
          id: pt.id,
          namaUniversitas: pt.nama,
          singkatan: pt.nama_singkat || '',
          provinsi: 'Indonesia',
          ranking: null,
          jumlahProdi: 0,
          nilaiRataRata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        return res.status(200).json({ data: transformed, total, page, limit });
      }
    } catch {
      // Fallback to local database if PDDikti fetch fails
    }
  }

  // — PDDikti: no search → load broad list from PDDikti with multiple keyword queries —
  if (!search) {
    try {
      const BROAD_QUERIES = ['universitas', 'institut', 'politeknik', 'sekolah tinggi', 'akademi'];
      const results = await Promise.allSettled(BROAD_QUERIES.map((q) => searchPT(q)));

      // Merge & de-duplicate by id
      const seen = new Set<string>();
      const merged: any[] = [];
      for (const r of results) {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) {
          for (const pt of r.value) {
            if (!seen.has(pt.id)) {
              seen.add(pt.id);
              merged.push(pt);
            }
          }
        }
      }

      if (merged.length > 0) {
        const total = merged.length;
        const startIndex = (page - 1) * limit;
        const paginated = merged.slice(startIndex, startIndex + limit);
        const transformed = paginated.map((pt) => ({
          id: pt.id,
          namaUniversitas: pt.nama,
          singkatan: pt.nama_singkat || '',
          provinsi: 'Indonesia',
          ranking: null,
          jumlahProdi: 0,
          nilaiRataRata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        return res.status(200).json({ data: transformed, total, page, limit });
      }
    } catch {
      // Fallback to local database
    }
  }

  // — Fallback: local DB —
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
