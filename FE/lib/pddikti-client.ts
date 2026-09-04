/**
 * Client-side PDDikti API helper calling internal Next.js API Routes (/api/universitas & /api/prodi).
 * Always hits same origin relative path /api/* -> 100% PDDikti data, zero CORS, zero BE limit!
 */

async function apiFetch(path: string): Promise<any | null> {
  try {
    // Relative URL ensures request goes to Next.js Frontend Serverless API Route on same domain
    const res = await fetch(`/api${path}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(12000),
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

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

/**
 * Fetch list of universities (initial load) with pagination (limit 20 per scroll).
 */
export async function fetchInitialUniversitas(page = 1, limit = 20): Promise<PaginatedResult<PddiktiPT>> {
  const json = await apiFetch(`/universitas?page=${page}&limit=${limit}`);
  return {
    data: json?.data ?? [],
    total: json?.total ?? 0,
  };
}

/**
 * Search universities by keyword with pagination (limit 20 per scroll).
 */
export async function searchUniversitas(query: string, page = 1, limit = 20): Promise<PaginatedResult<PddiktiPT>> {
  if (!query.trim()) return { data: [], total: 0 };
  const json = await apiFetch(`/universitas?search=${encodeURIComponent(query.trim())}&page=${page}&limit=${limit}`);
  return {
    data: json?.data ?? [],
    total: json?.total ?? 0,
  };
}

/**
 * Get prodi list for a given university ID with pagination.
 */
export async function fetchProdiByPT(ptId: string, page = 1, limit = 20): Promise<PaginatedResult<PddiktiProdi>> {
  const json = await apiFetch(`/prodi?universitasId=${encodeURIComponent(ptId)}&page=${page}&limit=${limit}`);
  return {
    data: json?.data ?? [],
    total: json?.total ?? 0,
  };
}

/**
 * Search prodi nationally by keyword with pagination.
 */
export async function searchProdiNational(query: string, page = 1, limit = 20): Promise<PaginatedResult<PddiktiProdi>> {
  if (!query.trim()) return { data: [], total: 0 };
  const json = await apiFetch(`/prodi?search=${encodeURIComponent(query.trim())}&page=${page}&limit=${limit}`);
  return {
    data: json?.data ?? [],
    total: json?.total ?? 0,
  };
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
