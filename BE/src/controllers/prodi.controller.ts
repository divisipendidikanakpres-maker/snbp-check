import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { computeLevelKeketatan } from '../lib/level-keketatan';

const prodiSchema = z.object({
  universitasId: z.string().trim().min(1, 'Universitas wajib dipilih.'),
  programStudi: z.string().trim().min(2, 'Program studi minimal 2 karakter.'),
  kelompokId: z.string().trim().min(1, 'Kelompok wajib dipilih.'),
  jenjangId: z.string().trim().min(1, 'Jenjang wajib dipilih.'),
  nilai: z.coerce.number().min(0, 'Nilai tidak valid.').max(100, 'Nilai tidak valid.'),
});

export async function listProdi(req: Request, res: Response) {
  const { universitasId } = req.query;
  const sort = String(req.query.sort ?? 'nilai_tertinggi');

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'nilai_tertinggi') {
    orderBy = { nilai: 'desc' };
  } else if (sort === 'nilai_terendah') {
    orderBy = { nilai: 'asc' };
  }

  const data = await prisma.prodi.findMany({
    where: universitasId ? { universitasId: String(universitasId) } : undefined,
    include: { universitas: true, kelompok: true, jenjang: true },
    orderBy,
  });

  return res.status(200).json({ data });
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
