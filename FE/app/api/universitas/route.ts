import { NextRequest, NextResponse } from 'next/server';
import uniDatabase from '@/lib/universitas-database.json';

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
    if (json?.status === 'success' && Array.isArray(json?.data) && json.data.length > 0) return json.data;
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim();
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;

  try {
    let items: any[] = [];

    // 1. Try PDDikti live search first
    if (search) {
      const pddiktiResults = await pddiktiFetch(`/pencarian/pt/${encodeURIComponent(search)}`);
      if (pddiktiResults && pddiktiResults.length > 0) {
        items = pddiktiResults.map((pt: any) => ({
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
      }
    }

    // 2. If items is empty (e.g. live API timeout/geo-block or initial view or no search match from live), use master database (4,652 universities)
    if (items.length === 0) {
      if (search) {
        const q = search.toLowerCase();
        // Priority match: exact singkatan or starts with name or includes name
        const matches = uniDatabase.filter((u: any) =>
          u.namaUniversitas.toLowerCase().includes(q) ||
          (u.singkatan && u.singkatan.toLowerCase().includes(q)) ||
          (u.kode && u.kode.toLowerCase().includes(q))
        );

        // Sort so exact matches or singkatan matches come first
        matches.sort((a: any, b: any) => {
          const aName = a.namaUniversitas.toLowerCase();
          const bName = b.namaUniversitas.toLowerCase();
          const aSing = (a.singkatan || '').toLowerCase();
          const bSing = (b.singkatan || '').toLowerCase();

          if (aSing === q && bSing !== q) return -1;
          if (bSing === q && aSing !== q) return 1;
          if (aName.startsWith(q) && !bName.startsWith(q)) return -1;
          if (bName.startsWith(q) && !aName.startsWith(q)) return 1;
          return aName.localeCompare(bName);
        });

        items = matches;
      } else {
        items = uniDatabase;
      }
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);

    return NextResponse.json({
      data: paginated,
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
