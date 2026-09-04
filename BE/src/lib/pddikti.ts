const PDDIKTI_BASE = 'https://pddikti.kemdiktisaintek.go.id/api';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://pddikti.kemdiktisaintek.go.id/',
};

const TIMEOUT_MS = 8000;

async function pddiktiFetch(path: string): Promise<any | null> {
  try {
    const res = await fetch(`${PDDIKTI_BASE}${path}`, {
      headers: DEFAULT_HEADERS,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[PDDIKTI] Fetch ${path} failed with status:`, res.status);
      return null;
    }
    const json: any = await res.json();
    if (json?.status === 'success' && json?.data) return json.data;
    return null;
  } catch (err: any) {
    console.error(`[PDDIKTI] Fetch ${path} error:`, err?.message || err);
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

/**
 * Cari daftar perguruan tinggi berdasarkan kata kunci.
 * Endpoint: GET /pencarian/pt/{query}
 */
export async function searchPT(query: string): Promise<PddiktiPT[] | null> {
  if (!query.trim()) return null;
  const data = await pddiktiFetch(`/pencarian/pt/${encodeURIComponent(query.trim())}`);
  if (!Array.isArray(data)) return null;
  return data as PddiktiPT[];
}

/**
 * Ambil detail perguruan tinggi berdasarkan ID PDDikti.
 * Endpoint: GET /pt/detail/{id}
 */
export async function getPTDetail(id: string): Promise<any | null> {
  return pddiktiFetch(`/pt/detail/${id}`);
}

/**
 * Ambil daftar prodi untuk satu perguruan tinggi.
 * Endpoint: GET /pt/prodi/{ptId}/{semester}
 */
export async function getProdiByPT(
  ptId: string,
  semester = '20251'
): Promise<PddiktiProdi[] | null> {
  const data = await pddiktiFetch(`/pt/prodi/${ptId}/${semester}`);
  if (!Array.isArray(data)) return null;
  return data as PddiktiProdi[];
}

/**
 * Cari program studi berdasarkan kata kunci.
 * Endpoint: GET /pencarian/prodi/{query}
 */
export async function searchProdi(query: string): Promise<any[] | null> {
  if (!query.trim()) return null;
  const data = await pddiktiFetch(`/pencarian/prodi/${encodeURIComponent(query.trim())}`);
  if (!Array.isArray(data)) return null;
  return data;
}
