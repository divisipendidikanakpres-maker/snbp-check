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

const BROAD_QUERIES = ['universitas', 'institut', 'politeknik', 'sekolah tinggi', 'akademi'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim();
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;

  try {
    let items: any[] = [];

    if (search) {
      // Search specific query
      const results = await pddiktiFetch(`/pencarian/pt/${encodeURIComponent(search)}`);
      if (Array.isArray(results)) {
        items = results;
      }
    } else {
      // Broad initial list (merge 5 queries)
      const fetchResults = await Promise.allSettled(
        BROAD_QUERIES.map((q) => pddiktiFetch(`/pencarian/pt/${encodeURIComponent(q)}`))
      );

      const seen = new Set<string>();
      for (const r of fetchResults) {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) {
          for (const pt of r.value) {
            if (pt.id && !seen.has(pt.id)) {
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

    return NextResponse.json({
      data: transformed,
      total,
      page,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'Gagal mengambil data universitas' },
      { status: 500 }
    );
  }
}
