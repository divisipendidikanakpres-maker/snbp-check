import { Request, Response } from 'express';
import { searchPT, getProdiByPT, searchProdi } from '../lib/pddikti';

const BROAD_QUERIES = ['universitas', 'institut', 'politeknik', 'sekolah tinggi', 'akademi'];

export async function proxySearchUniversitas(req: Request, res: Response) {
  const search = String(req.query.search ?? '').trim();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  try {
    let items: any[] = [];

    if (search) {
      const results = await searchPT(search);
      if (results) items = results;
    } else {
      // Broad initial list
      const results = await Promise.allSettled(BROAD_QUERIES.map((q) => searchPT(q)));
      const seen = new Set<string>();
      for (const r of results) {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) {
          for (const pt of r.value) {
            if (!seen.has(pt.id)) {
              seen.add(pt.id);
              items.push(pt);
            }
          }
        }
      }
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);

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
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error proxying PDDikti' });
  }
}

export async function proxyGetProdi(req: Request, res: Response) {
  const ptId = String(req.query.ptId ?? '').trim();
  const search = String(req.query.search ?? '').trim();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  try {
    if (ptId) {
      const prodiList = await getProdiByPT(ptId);
      if (prodiList && prodiList.length > 0) {
        const filtered = search
          ? prodiList.filter((p) =>
              p.nama_prodi.toLowerCase().includes(search.toLowerCase()) ||
              p.jenjang_prodi.toLowerCase().includes(search.toLowerCase())
            )
          : prodiList;

        const total = filtered.length;
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);

        const transformed = paginated.map((p) => ({
          id: p.id_sms,
          programStudi: p.nama_prodi,
          nilai: 0,
          levelKeketatan: 'KETAT',
          universitasId: ptId,
          kelompokId: null,
          jenjangId: null,
          universitas: {
            id: ptId,
            namaUniversitas: '',
            singkatan: '',
            provinsi: 'Indonesia',
            ranking: null,
          },
          kelompok: { id: null, nama: '' },
          jenjang: { id: null, nama: p.jenjang_prodi || '' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        return res.status(200).json({ data: transformed, total, page, limit });
      }
    } else if (search) {
      const results = await searchProdi(search);
      if (results && results.length > 0) {
        const total = results.length;
        const start = (page - 1) * limit;
        const paginated = results.slice(start, start + limit);

        const transformed = paginated.map((p) => ({
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
        }));

        return res.status(200).json({ data: transformed, total, page, limit });
      }
    }

    return res.status(200).json({ data: [], total: 0, page, limit });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error proxying PDDikti prodi' });
  }
}
