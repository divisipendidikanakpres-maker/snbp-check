import { useApi } from "./useApi";

export type LevelKeketatan = "SANGAT_KETAT" | "KETAT" | "SEDANG" | "TERBUKA";

export interface Lookup {
  id: string;
  nama: string;
}

export interface Prodi {
  id: string;
  programStudi: string;
  nilai: number;
  levelKeketatan: LevelKeketatan;
  universitasId: string;
  kelompokId: string;
  jenjangId: string;
  universitas: {
    id: string;
    namaUniversitas: string;
    singkatan: string;
    provinsi: string;
    ranking: number | null;
  };
  kelompok: Lookup;
  jenjang: Lookup;
  createdAt: string;
  updatedAt: string;
}

export interface ProdiPayload {
  universitasId: string;
  programStudi: string;
  kelompokId: string;
  jenjangId: string;
  nilai: number;
}

export function useProdi() {
  const { get, post, put, del } = useApi();

  async function list(universitasId?: string, sort?: string, search?: string) {
    const params = new URLSearchParams();
    if (universitasId) params.set('universitasId', universitasId);
    if (sort) params.set('sort', sort);
    if (search) params.set('search', search);
    const query = params.toString() ? `?${params.toString()}` : "";
    return get<{ data: Prodi[] }>(`/prodi${query}`);
  }

  async function getById(id: string) {
    return get<{ data: Prodi }>(`/prodi/${id}`);
  }

  async function suggest(prodiId: string, nilaiAkhir: number) {
    const query = `?prodiId=${encodeURIComponent(prodiId)}&nilaiAkhir=${encodeURIComponent(
      nilaiAkhir.toString(),
    )}`;
    return get<{ data: Prodi[] }>(`/prodi/suggestions${query}`);
  }

  async function create(payload: ProdiPayload) {
    return post<{ message: string; data: Prodi }>("/prodi", payload);
  }

  async function update(id: string, payload: ProdiPayload) {
    return put<{ message: string; data: Prodi }>(`/prodi/${id}`, payload);
  }

  async function remove(id: string) {
    return del<{ message: string }>(`/prodi/${id}`);
  }

  return { list, getById, suggest, create, update, remove };
}
