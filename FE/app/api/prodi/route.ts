import { NextRequest, NextResponse } from 'next/server';
import uniDatabase from '@/lib/universitas-database.json';
import prodiDatabase from '@/lib/prodi-database.json';
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
    if (json?.status === 'success' && Array.isArray(json?.data) && json.data.length > 0) return json.data;
    return null;
  } catch {
    return null;
  }
}

const DEFAULT_PRODI_LIST = [
  { name: "Pendidikan Dokter", jenjang: "S1" },
  { name: "Farmasi", jenjang: "S1" },
  { name: "Manajemen", jenjang: "S1" },
  { name: "Akuntansi", jenjang: "S1" },
  { name: "Ilmu Hukum", jenjang: "S1" },
  { name: "Teknik Informatika", jenjang: "S1" },
  { name: "Sistem Informasi", jenjang: "S1" },
  { name: "Psikologi", jenjang: "S1" },
  { name: "Ilmu Komunikasi", jenjang: "S1" },
  { name: "Teknik Sipil", jenjang: "S1" },
  { name: "Teknik Industri", jenjang: "S1" },
  { name: "Teknik Elektro", jenjang: "S1" },
  { name: "Teknik Mesin", jenjang: "S1" },
  { name: "Kesehatan Masyarakat", jenjang: "S1" },
  { name: "Ilmu Keperawatan", jenjang: "S1" },
  { name: "Kebidanan", jenjang: "S1" },
  { name: "Gizi", jenjang: "S1" },
  { name: "Pendidikan Bahasa Inggris", jenjang: "S1" },
  { name: "Pendidikan Matematika", jenjang: "S1" },
  { name: "Pendidikan Guru Sekolah Dasar (PGSD)", jenjang: "S1" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ptId = (searchParams.get('universitasId') || searchParams.get('ptId') || '').trim();
  const search = (searchParams.get('search') || '').trim();
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;

  try {
    let prodiItems: any[] = [];

    // Look up university details from master uniDatabase if available
    const uniMeta = (uniDatabase as any[]).find((u) => u.id === ptId);
    const uniName = uniMeta?.namaUniversitas || '';
    const uniSingkatan = uniMeta?.singkatan || '';

    if (ptId) {
      // 1. Try PDDikti live API endpoints in priority order (/latest, /20241, /20242, /20231)
      const semEndpoints = ['/20241', '/latest', '/20242', '/20231'];
      for (const sem of semEndpoints) {
        const pddiktiList = await pddiktiFetch(`/pt/prodi/${ptId}${sem}`);
        if (pddiktiList && Array.isArray(pddiktiList) && pddiktiList.length > 0) {
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
              namaUniversitas: uniName,
              singkatan: uniSingkatan,
              provinsi: 'Indonesia',
              ranking: null,
            },
            kelompok: { id: null, nama: '' },
            jenjang: { id: null, nama: p.jenjang_prodi || 'S1' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          break;
        }
      }

      // 2. Fallback to pre-fetched prodiDatabase (contains UAD's 67 prodis and others)
      if (prodiItems.length === 0 && (prodiDatabase as any)[ptId]) {
        const cachedProdis = (prodiDatabase as any)[ptId];
        prodiItems = cachedProdis.map((p: any) => ({
          id: p.id,
          programStudi: p.programStudi,
          nilai: 0,
          levelKeketatan: 'KETAT',
          universitasId: ptId,
          kelompokId: null,
          jenjangId: null,
          universitas: {
            id: ptId,
            namaUniversitas: uniName,
            singkatan: uniSingkatan,
            provinsi: 'Indonesia',
            ranking: null,
          },
          kelompok: { id: null, nama: '' },
          jenjang: { id: null, nama: p.jenjang || 'S1' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }

      // 3. Fallback to SNBP_DATA by university name / singkatan
      if (prodiItems.length === 0 && (uniName || uniSingkatan)) {
        const lowerName = uniName.toLowerCase();
        const lowerSing = uniSingkatan.toLowerCase();

        const localMatches = SNBP_DATA.filter((s) =>
          (lowerName && s.universitas.toLowerCase().includes(lowerName)) ||
          (lowerName && lowerName.includes(s.universitas.toLowerCase())) ||
          (lowerSing && s.singkatan && s.singkatan.toLowerCase() === lowerSing)
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

      // 4. Safety Fallback: Default prodi catalog if still empty
      if (prodiItems.length === 0) {
        prodiItems = DEFAULT_PRODI_LIST.map((item, idx) => ({
          id: `${ptId}-std-${idx}`,
          programStudi: item.name,
          nilai: 85.0,
          levelKeketatan: 'KETAT',
          universitasId: ptId,
          kelompokId: null,
          jenjangId: null,
          universitas: {
            id: ptId,
            namaUniversitas: uniName || 'Universitas',
            singkatan: uniSingkatan || '',
            provinsi: 'Indonesia',
            ranking: null,
          },
          kelompok: { id: null, nama: '' },
          jenjang: { id: null, nama: item.jenjang },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
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
