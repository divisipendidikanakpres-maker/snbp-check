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
  const search = String(req.query.search ?? '').trim();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit || req.query.perPage) || 20;

  try {
    const endpoint = search
      ? `https://api-sekolah-indonesia.vercel.app/sekolah/s?sekolah=${encodeURIComponent(search)}&page=${page}&perPage=${limit}`
      : `https://api-sekolah-indonesia.vercel.app/sekolah/sma?page=${page}&perPage=${limit}`;

    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(6000),
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const json: any = await response.json();
      if (json.dataSekolah && Array.isArray(json.dataSekolah)) {
        const transformed = json.dataSekolah.map((item: any) => ({
          id: item.npsn || item.id,
          npsn: item.npsn || '',
          namaSekolah: (item.sekolah || '').trim(),
          provinsi: (item.propinsi || '').trim(),
          kota: (item.kabupaten_kota || '').trim(),
          kecamatan: (item.kecamatan || '').trim(),
          bentuk: (item.bentuk || '').trim(),
          status: (item.status || '').trim(),
          akreditasi: item.status === 'N' ? 'A' : 'B',
        }));

        return res.status(200).json({
          data: transformed,
          total: Number(json.total_data) || transformed.length,
          page,
          limit,
        });
      }
    }
  } catch (error) {
    console.warn('[listSekolah] Failed to fetch external school API, falling back to database:', error);
  }

  // Fallback to local database
  const where = search
    ? {
        OR: [
          { namaSekolah: { contains: search, mode: 'insensitive' as const } },
          { akreditasi: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : undefined;

  const skip = (page - 1) * limit;
  const total = await prisma.sekolah.count({ where });

  const sekolah = await prisma.sekolah.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  return res.status(200).json({
    data: sekolah.map((s) => ({
      id: s.id,
      npsn: '',
      namaSekolah: s.namaSekolah,
      provinsi: '',
      kota: '',
      kecamatan: '',
      bentuk: 'SMA',
      status: 'N',
      akreditasi: s.akreditasi,
    })),
    total,
    page,
    limit,
  });
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
