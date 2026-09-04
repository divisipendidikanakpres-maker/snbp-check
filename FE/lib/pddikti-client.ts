/**
 * Client-side PDDikti API helper via standard Backend Endpoints (/api/universitas & /api/prodi).
 * No special new route needed -> zero 404 errors!
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://snbp-check.vercel.app/api';

async function apiFetch(path: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface PddiktiPT {
  id: string;
  namaUniversitas: string;
  singkatan: string;
  provinsi: string;
  ranking: number | null;
  jumlahProdi: number;
  nilaiRataRata: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PddiktiProdi {
  id: string;
  programStudi: string;
  nilai: number;
  levelKeketatan: string;
  universitasId: string;
  kelompokId: string | null;
  jenjangId: string | null;
  universitas: {
    id: string;
    namaUniversitas: string;
    singkatan: string;
    provinsi: string;
    ranking: number | null;
  };
  kelompok: { id: string | null; nama: string };
  jenjang: { id: string | null; nama: string };
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch initial list of universities from standard backend endpoint.
 */
export async function fetchInitialUniversitas(): Promise<PddiktiPT[]> {
  const json = await apiFetch('/universitas?limit=50');
  return json?.data ?? [];
}

/**
 * Search universities by keyword from standard backend endpoint.
 */
export async function searchUniversitas(query: string): Promise<PddiktiPT[]> {
  if (!query.trim()) return [];
  const json = await apiFetch(`/universitas?search=${encodeURIComponent(query.trim())}&limit=50`);
  return json?.data ?? [];
}

/**
 * Get prodi list for a given university ID.
 */
export async function fetchProdiByPT(ptId: string): Promise<PddiktiProdi[]> {
  const json = await apiFetch(`/prodi?universitasId=${encodeURIComponent(ptId)}&limit=100`);
  return json?.data ?? [];
}

/**
 * Search prodi nationally by keyword.
 */
export async function searchProdiNational(query: string): Promise<PddiktiProdi[]> {
  if (!query.trim()) return [];
  const json = await apiFetch(`/prodi?search=${encodeURIComponent(query.trim())}&limit=50`);
  return json?.data ?? [];
}

export function mapPTtoUniversitas(pt: PddiktiPT) {
  return pt;
}

export function mapPddiktiProdiToProdi(p: PddiktiProdi, ptId: string, namaUniversitas = '') {
  if (namaUniversitas && p.universitas) {
    p.universitas.namaUniversitas = namaUniversitas;
  }
  return p;
}

export function mapSearchProdiToProdi(p: PddiktiProdi) {
  return p;
}
