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

  async function list(universitasId?: string) {
    const query = universitasId ? `?universitasId=${universitasId}` : "";
    return get<{ data: Prodi[] }>(`/prodi${query}`);
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

  return { list, create, update, remove };
}
