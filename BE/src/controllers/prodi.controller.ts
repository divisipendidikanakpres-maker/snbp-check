import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { computeLevelKeketatan } from '../lib/level-keketatan';
import { getProdiByPT, searchProdi } from '../lib/pddikti';

const prodiSchema = z.object({
  universitasId: z.string().trim().min(1, 'Universitas wajib dipilih.'),
  programStudi: z.string().trim().min(2, 'Program studi minimal 2 karakter.'),
  kelompokId: z.string().trim().min(1, 'Kelompok wajib dipilih.'),
  jenjangId: z.string().trim().min(1, 'Jenjang wajib dipilih.'),
  nilai: z.coerce.number().min(0, 'Nilai tidak valid.').max(100, 'Nilai tidak valid.'),
});

/** UUID format (standard 8-4-4-4-12 hex). If id is NOT UUID it's likely a PDDikti encrypted id. */
function isPddiktiId(id: string): boolean {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return !UUID_REGEX.test(id);
}

function buildFakeProdi(p: any, ptId: string, universitas: any) {
  return {
    id: p.id_sms,
    programStudi: p.nama_prodi,
    nilai: 0,
    levelKeketatan: 'KETAT',
    universitasId: ptId,
    kelompokId: null,
    jenjangId: null,
    universitas: universitas ?? {
      id: ptId,
      namaUniversitas: '',
      singkatan: '',
      provinsi: '',
      ranking: null,
    },
    kelompok: { id: null, nama: '' },
    jenjang: { id: null, nama: p.jenjang_prodi || '' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function buildFakeProdiFromSearch(p: any) {
  return {
    id: p.id,
    programStudi: p.nama,
    nilai: 0,
    levelKeketatan: 'KETAT',
    universitasId: p.id,
    kelompokId: null,
    jenjangId: null,
    universitas: {
      id: p.id,
      namaUniversitas: p.pt || '',
      singkatan: p.pt_singkat || '',
      provinsi: 'Indonesia',
      ranking: null,
    },
    kelompok: { id: null, nama: '' },
    jenjang: { id: null, nama: p.jenjang || '' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function listProdi(req: Request, res: Response) {
  const { universitasId } = req.query;
  const sort = String(req.query.sort ?? 'nilai_tertinggi');
  const search = String(req.query.search ?? '').trim();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  // — PDDikti: fetch prodi by university when universitasId is a PDDikti encrypted ID —
  if (universitasId && isPddiktiId(String(universitasId))) {
    try {
      const ptId = String(universitasId);
      const pddiktiProdi = await getProdiByPT(ptId);
      if (pddiktiProdi && pddiktiProdi.length > 0) {
        // Filter by search if present
        const filtered = search
          ? pddiktiProdi.filter((p) =>
              p.nama_prodi.toLowerCase().includes(search.toLowerCase()) ||
              p.jenjang_prodi.toLowerCase().includes(search.toLowerCase())
            )
          : pddiktiProdi;

        const total = filtered.length;
        const paginated = filtered.slice((page - 1) * limit, (page - 1) * limit + limit);
        const data = paginated.map((p) => buildFakeProdi(p, ptId, null));
        return res.status(200).json({ data, total, page, limit });
      }
    } catch {
      // fallthrough to DB
    }
  }

  // — PDDikti: search prodi nationally if search is provided and we have no universitasId —
  if (search && !universitasId) {
    try {
      const pddiktiResults = await searchProdi(search);
      if (pddiktiResults && pddiktiResults.length > 0) {
        const total = pddiktiResults.length;
        const paginated = pddiktiResults.slice((page - 1) * limit, (page - 1) * limit + limit);
        const data = paginated.map(buildFakeProdiFromSearch);
        return res.status(200).json({ data, total, page, limit });
      }
    } catch {
      // fallthrough to DB
    }
  }

  // — Fallback: local DB —
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'nilai_tertinggi') {
    orderBy = { nilai: 'desc' };
  } else if (sort === 'nilai_terendah') {
    orderBy = { nilai: 'asc' };
  }

  const baseWhere: any = universitasId && !isPddiktiId(String(universitasId))
    ? { universitasId: String(universitasId) }
    : undefined;

  const searchWhere = search
    ? {
        OR: [
          { programStudi: { contains: search, mode: 'insensitive' as const } },
          { kelompok: { nama: { contains: search, mode: 'insensitive' as const } } },
          { jenjang: { nama: { contains: search, mode: 'insensitive' as const } } },
        ],
      }
    : undefined;

  const where = baseWhere && searchWhere
    ? { AND: [baseWhere, searchWhere] }
    : baseWhere || searchWhere;

  const skip = (page - 1) * limit;
  const total = await prisma.prodi.count({ where });

  const data = await prisma.prodi.findMany({
    where,
    include: { universitas: true, kelompok: true, jenjang: true },
    orderBy,
    skip,
    take: limit,
  });

  return res.status(200).json({ data, total, page, limit });
}

export async function getProdi(req: Request, res: Response) {
  const { id } = req.params;

  const prodi = await prisma.prodi.findUnique({
    where: { id },
    include: { universitas: true, kelompok: true, jenjang: true },
  });

  if (!prodi) {
    return res.status(404).json({ message: 'Prodi tidak ditemukan.' });
  }

  return res.status(200).json({ data: prodi });
}

export async function suggestProdiAlternatives(req: Request, res: Response) {
  const prodiId = String(req.query.prodiId ?? '');
  const nilaiAkhir = Number(req.query.nilaiAkhir);

  if (!prodiId || Number.isNaN(nilaiAkhir)) {
    return res.status(400).json({ message: 'Parameter prodiId dan nilaiAkhir wajib diisi.' });
  }

  const targetProdi = await prisma.prodi.findUnique({
    where: { id: prodiId },
  });

  if (!targetProdi) {
    return res.status(404).json({ message: 'Prodi target tidak ditemukan.' });
  }

  const candidates = await prisma.prodi.findMany({
    where: {
      universitasId: targetProdi.universitasId,
      kelompokId: targetProdi.kelompokId,
      NOT: { id: targetProdi.id },
      nilai: { lt: targetProdi.nilai },
    },
    include: { universitas: true, kelompok: true, jenjang: true },
  });

  const suggestions = candidates
    .sort((a, b) => {
      const da = Math.abs(a.nilai - nilaiAkhir) + (targetProdi.nilai - a.nilai);
      const db = Math.abs(b.nilai - nilaiAkhir) + (targetProdi.nilai - b.nilai);
      return da - db;
    })
    .slice(0, 5);

  return res.status(200).json({ data: suggestions });
}

export async function createProdi(req: Request, res: Response) {
  const parsed = prodiSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { universitasId, programStudi, kelompokId, jenjangId, nilai } = parsed.data;

  const universitas = await prisma.universitas.findUnique({ where: { id: universitasId } });
  if (!universitas) {
    return res.status(404).json({ message: 'Universitas tidak ditemukan.' });
  }

  const prodi = await prisma.prodi.create({
    data: {
      universitasId,
      programStudi,
      kelompokId,
      jenjangId,
      nilai,
      levelKeketatan: computeLevelKeketatan(nilai),
    },
    include: { kelompok: true, jenjang: true },
  });

  return res.status(201).json({ message: 'Prodi berhasil ditambahkan.', data: prodi });
}

export async function updateProdi(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = prodiSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { universitasId, programStudi, kelompokId, jenjangId, nilai } = parsed.data;

  const prodi = await prisma.prodi.update({
    where: { id },
    data: {
      universitasId,
      programStudi,
      kelompokId,
      jenjangId,
      nilai,
      levelKeketatan: computeLevelKeketatan(nilai),
    },
    include: { kelompok: true, jenjang: true },
  });

  return res.status(200).json({ message: 'Prodi berhasil diperbarui.', data: prodi });
}

export async function deleteProdi(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.prodi.delete({ where: { id } });
  return res.status(200).json({ message: 'Prodi berhasil dihapus.' });
}
