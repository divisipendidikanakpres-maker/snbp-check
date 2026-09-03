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

async function fetchFromSchoolApi(query: string, page: number, limit: number): Promise<{ data: any[]; total: number } | null> {
  const url = query
    ? `https://api-sekolah-indonesia.vercel.app/sekolah/s?sekolah=${encodeURIComponent(query)}&page=${page}&perPage=${limit}`
    : `https://api-sekolah-indonesia.vercel.app/sekolah/sma?page=${page}&perPage=${limit}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(6000),
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) return null;
  const json: any = await res.json();
  if (json.dataSekolah && Array.isArray(json.dataSekolah) && json.dataSekolah.length > 0) {
    return {
      data: json.dataSekolah,
      total: Number(json.total_data) || json.dataSekolah.length,
    };
  }
  return null;
}

export async function listSekolah(req: Request, res: Response) {
  const rawSearch = String(req.query.search ?? '').trim();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit || req.query.perPage) || 20;

  // Clean the search query: remove prefixes like "Kota", "Kab.", "Kabupaten", "Prov."
  let cleanSearch = rawSearch
    .replace(/^(Kota|Kab\.|Kabupaten|Prov\.)\s*/gi, '')
    .trim();

  let apiResult: { data: any[]; total: number } | null = null;

  if (cleanSearch) {
    // 1. Try with the full cleaned query
    try {
      apiResult = await fetchFromSchoolApi(cleanSearch, page, limit);
    } catch (e) {
      // ignore
    }

    // 2. Special case for Jakarta (e.g. "Jakarta Timur", "Jakarta Selatan" etc -> search "Jakarta")
    if (!apiResult && /jakarta/i.test(cleanSearch)) {
      try {
        apiResult = await fetchFromSchoolApi('Jakarta', page, limit);
      } catch (e) {
        // ignore
      }
    }

    // 3. If still not found and query contains multiple words, try first word or individual parts
    if (!apiResult && cleanSearch.includes(' ')) {
      const parts = cleanSearch.split(/\s+/).filter(Boolean);
      try {
        apiResult = await fetchFromSchoolApi(parts[0], page, limit);
      } catch (e) {
        // ignore
      }
      if (!apiResult && parts.length > 1) {
        try {
          apiResult = await fetchFromSchoolApi(parts.slice(1).join(' '), page, limit);
        } catch (e) {
          // ignore
        }
      }
    }
  } else {
    // No search -> default load SMA
    try {
      apiResult = await fetchFromSchoolApi('', page, limit);
    } catch (e) {
      // ignore
    }
  }

  if (apiResult && apiResult.data.length > 0) {
    const transformed = apiResult.data.map((item: any) => ({
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
      total: apiResult.total,
      page,
      limit,
    });
  }

  // Fallback to local database if external API is unreachable or returned empty
  const where = rawSearch
    ? {
        OR: [
          { namaSekolah: { contains: rawSearch, mode: 'insensitive' as const } },
          { akreditasi: { contains: rawSearch, mode: 'insensitive' as const } },
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
