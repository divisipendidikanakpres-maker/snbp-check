import { useApi } from "./useApi";

export interface Universitas {
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

export interface UniversitasPayload {
  namaUniversitas: string;
  singkatan: string;
  provinsi: string;
  ranking: number | null;
}

export function useUniversitas() {
  const { get, post, put, del } = useApi();

  async function list() {
    return get<{ data: Universitas[] }>("/universitas");
  }

  async function create(payload: UniversitasPayload) {
    return post<{ message: string; data: Universitas }>(
      "/universitas",
      payload
    );
  }

  async function getById(id: string) {
    return get<{ data: Universitas }>(`/universitas/${id}`);
  }

  async function update(id: string, payload: UniversitasPayload) {
    return put<{ message: string; data: Universitas }>(
      `/universitas/${id}`,
      payload
    );
  }

  async function remove(id: string) {
    return del<{ message: string }>(`/universitas/${id}`);
  }

  return { list, create, getById, update, remove };
}
