import { NextRequest, NextResponse } from 'next/server';

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
      signal: AbortSignal.timeout(8000),
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
  const limit = Number(searchParams.get('limit')) || 100;

  try {
    if (ptId) {
      // 1. Fetch prodi by PT ID (try semester 20251 then 20241)
      let prodiList = await pddiktiFetch(`/pt/prodi/${ptId}/20251`);
      if (!prodiList || !Array.isArray(prodiList) || prodiList.length === 0) {
        prodiList = await pddiktiFetch(`/pt/prodi/${ptId}/20241`);
      }

      if (Array.isArray(prodiList) && prodiList.length > 0) {
        const filtered = search
          ? prodiList.filter((p: any) =>
              p.nama_prodi?.toLowerCase().includes(search.toLowerCase()) ||
              p.jenjang_prodi?.toLowerCase().includes(search.toLowerCase())
            )
          : prodiList;

        const total = filtered.length;
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);

        const transformed = paginated.map((p: any) => ({
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

        return NextResponse.json({ data: transformed, total, page, limit });
      }
    } else if (search) {
      // 2. Search prodi nationally
      const results = await pddiktiFetch(`/pencarian/prodi/${encodeURIComponent(search)}`);
      if (Array.isArray(results) && results.length > 0) {
        const total = results.length;
        const start = (page - 1) * limit;
        const paginated = results.slice(start, start + limit);

        const transformed = paginated.map((p: any) => ({
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

        return NextResponse.json({ data: transformed, total, page, limit });
      }
    }

    return NextResponse.json({ data: [], total: 0, page, limit });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'Gagal mengambil data prodi' },
      { status: 500 }
    );
  }
}
