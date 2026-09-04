import { NextRequest, NextResponse } from 'next/server';
import { SNBP_DATA } from '@/lib/data-univ';

const PDDIKTI_BASE = 'https://pddikti.kemdiktisaintek.go.id/api';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://pddikti.kemdiktisaintek.go.id/',
};

async function pddiktiFetch(path: string): Promise<any | null> {
  try {
    const res = await fetch(`${PDDIKTI_BASE}${path}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.status === 'success' && json?.data) return json.data;
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ptId = (searchParams.get('universitasId') || searchParams.get('ptId') || '').trim();
  const search = (searchParams.get('search') || '').trim();
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;

  try {
    let prodiItems: any[] = [];

    if (ptId) {
      // 1. Try PDDikti live API first
      let pddiktiList = await pddiktiFetch(`/pt/prodi/${ptId}/20251`);
      if (!pddiktiList || !Array.isArray(pddiktiList) || pddiktiList.length === 0) {
        pddiktiList = await pddiktiFetch(`/pt/prodi/${ptId}/20241`);
      }

      if (Array.isArray(pddiktiList) && pddiktiList.length > 0) {
        prodiItems = pddiktiList.map((p: any) => ({
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
      }

      // 2. Fallback to SNBP_DATA if live fetch returns nothing (e.g. Vercel timeout/geo-block)
      if (prodiItems.length === 0) {
        const localMatches = SNBP_DATA.filter((s) =>
          s.universitas.toLowerCase().includes(ptId.toLowerCase()) ||
          (s.singkatan && s.singkatan.toLowerCase() === ptId.toLowerCase())
        );

        if (localMatches.length > 0) {
          prodiItems = localMatches.map((s, idx) => ({
            id: s.code || `${ptId}-${idx}`,
            programStudi: s.programStudi,
            nilai: s.estimasiNilaiMin || 85,
            levelKeketatan: s.levelKeketatan || 'KETAT',
            universitasId: ptId,
            kelompokId: null,
            jenjangId: null,
            universitas: {
              id: ptId,
              namaUniversitas: s.universitas,
              singkatan: s.singkatan || '',
              provinsi: s.provinsi || 'Indonesia',
              ranking: s.rankingPTN || null,
            },
            kelompok: { id: null, nama: s.kelompok || '' },
            jenjang: { id: null, nama: s.jenjang || 'S1' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
      }
    }

    const filtered = search
      ? prodiItems.filter((p: any) =>
          p.programStudi?.toLowerCase().includes(search.toLowerCase()) ||
          p.jenjang?.nama?.toLowerCase().includes(search.toLowerCase())
        )
      : prodiItems;

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return NextResponse.json({ data: paginated, total, page, limit });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'Gagal mengambil data prodi' },
      { status: 500 }
    );
  }
}
