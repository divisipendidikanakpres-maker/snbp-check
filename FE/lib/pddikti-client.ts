/**
 * Client-side PDDikti API helper.
 * Fetches directly from browser → no backend needed, no Vercel serverless restrictions.
 */

const PDDIKTI_BASE = 'https://pddikti.kemdiktisaintek.go.id/api';

const HEADERS = {
  'Accept': 'application/json',
  'Referer': 'https://pddikti.kemdiktisaintek.go.id/',
};

async function pddiktiFetch(path: string): Promise<any | null> {
  try {
    const res = await fetch(`${PDDIKTI_BASE}${path}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.status === 'success' && json?.data) return json.data;
    return null;
  } catch {
    return null;
  }
}

export interface PddiktiPT {
  id: string;
  kode: string;
  nama_singkat: string;
  nama: string;
}

export interface PddiktiProdi {
  id_sms: string;
  kode_prodi: string;
  nama_prodi: string;
  jenjang_prodi: string;
  akreditasi: string;
  status_prodi: string;
}

export interface PddiktiProdiSearch {
  id: string;
  nama: string;
  jenjang: string;
  pt: string;
  pt_singkat: string;
}

/** Broad keyword queries used for initial load. Each returns up to 100 results. */
const BROAD_QUERIES = ['universitas', 'institut', 'politeknik', 'sekolah tinggi', 'akademi'];

/**
 * Fetch initial list of universities from PDDikti using broad queries.
 * Returns up to 500 deduplicated universities.
 */
export async function fetchInitialUniversitas(): Promise<PddiktiPT[]> {
  const results = await Promise.allSettled(
    BROAD_QUERIES.map((q) => pddiktiFetch(`/pencarian/pt/${encodeURIComponent(q)}`))
  );

  const seen = new Set<string>();
  const merged: PddiktiPT[] = [];

  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      for (const pt of r.value as PddiktiPT[]) {
        if (!seen.has(pt.id)) {
          seen.add(pt.id);
          merged.push(pt);
        }
      }
    }
  }

  return merged;
}

/**
 * Search universities by keyword.
 */
export async function searchUniversitas(query: string): Promise<PddiktiPT[]> {
  if (!query.trim()) return [];
  const data = await pddiktiFetch(`/pencarian/pt/${encodeURIComponent(query.trim())}`);
  return Array.isArray(data) ? (data as PddiktiPT[]) : [];
}

/**
 * Get prodi list for a given university ID (PDDikti encrypted id).
 */
export async function fetchProdiByPT(ptId: string, semester = '20251'): Promise<PddiktiProdi[]> {
  const data = await pddiktiFetch(`/pt/prodi/${ptId}/${semester}`);
  return Array.isArray(data) ? (data as PddiktiProdi[]) : [];
}

/**
 * Search prodi nationally by keyword.
 */
export async function searchProdiNational(query: string): Promise<PddiktiProdiSearch[]> {
  if (!query.trim()) return [];
  const data = await pddiktiFetch(`/pencarian/prodi/${encodeURIComponent(query.trim())}`);
  return Array.isArray(data) ? (data as PddiktiProdiSearch[]) : [];
}

/** Convert a PDDiktiPT to a standardized Universitas-like object compatible with the FE Universitas type */
export function mapPTtoUniversitas(pt: PddiktiPT) {
  return {
    id: pt.id,
    namaUniversitas: pt.nama,
    singkatan: pt.nama_singkat || '',
    provinsi: 'Indonesia',
    ranking: null as number | null,
    jumlahProdi: 0,
    nilaiRataRata: null as number | null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/** Convert a PDDikti prodi (by PT) to a standardized Prodi-like object */
export function mapPddiktiProdiToProdi(p: PddiktiProdi, ptId: string, namaUniversitas = '') {
  return {
    id: p.id_sms,
    programStudi: p.nama_prodi,
    nilai: 0,
    levelKeketatan: 'KETAT' as const,
    universitasId: ptId,
    kelompokId: null as string | null,
    jenjangId: null as string | null,
    universitas: {
      id: ptId,
      namaUniversitas,
      singkatan: '',
      provinsi: 'Indonesia',
      ranking: null as number | null,
    },
    kelompok: { id: null as string | null, nama: '' },
    jenjang: { id: null as string | null, nama: p.jenjang_prodi || '' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/** Convert a PDDikti search prodi result to a standardized Prodi-like object */
export function mapSearchProdiToProdi(p: PddiktiProdiSearch) {
  return {
    id: p.id,
    programStudi: p.nama,
    nilai: 0,
    levelKeketatan: 'KETAT' as const,
    universitasId: p.id,
    kelompokId: null as string | null,
    jenjangId: null as string | null,
    universitas: {
      id: p.id,
      namaUniversitas: p.pt || '',
      singkatan: p.pt_singkat || '',
      provinsi: 'Indonesia',
      ranking: null as number | null,
    },
    kelompok: { id: null as string | null, nama: '' },
    jenjang: { id: null as string | null, nama: p.jenjang || '' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
