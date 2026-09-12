import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import manSchoolsData from '../data/sekolah-man-database.json';

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

interface SekolahItem {
  id: string;
  npsn: string;
  namaSekolah: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  bentuk: string;
  status: string;
  akreditasi: string;
}

function searchManDatabase(query: string): SekolahItem[] {
  if (!query) return manSchoolsData as SekolahItem[];
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  return (manSchoolsData as SekolahItem[]).filter((school) => {
    const text = `${school.namaSekolah} ${school.kota} ${school.provinsi} ${school.npsn}`.toLowerCase();
    return tokens.every((token) => text.includes(token));
  });
}

export async function listSekolah(req: Request, res: Response) {
  const rawSearch = String(req.query.search ?? '').trim();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit || req.query.perPage) || 20;

  // Clean the search query: remove prefixes like "Kota", "Kab.", "Kabupaten", "Prov."
  let cleanSearch = rawSearch
    .replace(/^(Kota|Kab\.|Kabupaten|Prov\.)\s*/gi, '')
    .trim();

  // 1. Check if the user is explicitly searching for MAN / Madrasah
  const isExplicitManQuery =
    /^(man|ma)\b/i.test(cleanSearch) ||
    /\b(man|madrasah)\b/i.test(cleanSearch);

  if (isExplicitManQuery) {
    const matchedMan = searchManDatabase(cleanSearch);
    if (matchedMan.length > 0) {
      const startIndex = (page - 1) * limit;
      const paginated = matchedMan.slice(startIndex, startIndex + limit);
      return res.status(200).json({
        data: paginated,
        total: matchedMan.length,
        page,
        limit,
      });
    }
  }

  // 2. Query external Dapodik API (SMA / SMK)
  let apiResult: { data: any[]; total: number } | null = null;

  if (cleanSearch) {
    // 1. Try with the full cleaned query
    try {
      apiResult = await fetchFromSchoolApi(cleanSearch, page, limit);
    } catch (e) {
      // ignore
    }

    // 2. Special case for Jakarta
    if (!apiResult && /jakarta/i.test(cleanSearch)) {
      try {
        apiResult = await fetchFromSchoolApi('Jakarta', page, limit);
      } catch (e) {
        // ignore
      }
    }

    // 3. Try parts if multiple words
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
    const transformed: SekolahItem[] = apiResult.data.map((item: any) => ({
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

    // If searching by city / location, also append matching MAN schools from that city
    if (cleanSearch && !isExplicitManQuery) {
      const matchingMan = searchManDatabase(cleanSearch);
      if (matchingMan.length > 0) {
        const existingNpsn = new Set(transformed.map((s) => s.npsn));
        const combined = [...transformed];
        for (const man of matchingMan) {
          if (!existingNpsn.has(man.npsn)) {
            combined.push(man);
            existingNpsn.add(man.npsn);
          }
        }
        return res.status(200).json({
          data: combined.slice(0, limit),
          total: apiResult.total + matchingMan.length,
          page,
          limit,
        });
      }
    }

    return res.status(200).json({
      data: transformed,
      total: apiResult.total,
      page,
      limit,
    });
  }

  // 3. Fallback to local database & MAN dataset if external API is unreachable or returned empty
  const where = rawSearch
    ? {
        OR: [
          { namaSekolah: { contains: rawSearch, mode: 'insensitive' as const } },
          { akreditasi: { contains: rawSearch, mode: 'insensitive' as const } },
        ],
      }
    : undefined;

  const skip = (page - 1) * limit;
  const dbTotal = await prisma.sekolah.count({ where });
  const dbSekolah = await prisma.sekolah.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  const localItems: SekolahItem[] = dbSekolah.map((s) => {
    const isMan = /^MAN\b/i.test(s.namaSekolah) || /\bMAN\b/i.test(s.namaSekolah);
    return {
      id: s.id,
      npsn: '',
      namaSekolah: s.namaSekolah,
      provinsi: '',
      kota: '',
      kecamatan: '',
      bentuk: isMan ? 'MAN' : 'SMA',
      status: 'N',
      akreditasi: s.akreditasi,
    };
  });

  // If local DB returned items, return them
  if (localItems.length > 0) {
    return res.status(200).json({
      data: localItems,
      total: dbTotal,
      page,
      limit,
    });
  }

  // Final fallback: query directly from MAN database
  const fallbackMan = searchManDatabase(cleanSearch);
  const paginatedFallback = fallbackMan.slice(skip, skip + limit);

  return res.status(200).json({
    data: paginatedFallback,
    total: fallbackMan.length,
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
