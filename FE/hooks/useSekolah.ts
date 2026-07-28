import { useApi } from "./useApi";

export interface Sekolah {
  id: string;
  namaSekolah: string;
  akreditasi: string;
  createdAt: string;
  updatedAt: string;
}

export interface SekolahPayload {
  namaSekolah: string;
  akreditasi: "A" | "B" | "C" | "-";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function useSekolah() {
  const { get, post, put, del } = useApi();

  async function list(search?: string, page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (page) params.set('page', page.toString());
    if (limit) params.set('limit', limit.toString());
    const q = params.toString() ? `?${params.toString()}` : "";
    return get<PaginatedResponse<Sekolah>>(`/sekolah${q}`);
  }

  async function create(payload: SekolahPayload) {
    return post<{ message: string; data: Sekolah }>("/sekolah", payload);
  }

  async function getById(id: string) {
    return get<{ data: Sekolah }>(`/sekolah/${id}`);
  }

  async function update(id: string, payload: SekolahPayload) {
    return put<{ message: string; data: Sekolah }>(
      `/sekolah/${id}`,
      payload
    );
  }

  async function remove(id: string) {
    return del<{ message: string }>(`/sekolah/${id}`);
  }

  return { list, create, getById, update, remove };
}
