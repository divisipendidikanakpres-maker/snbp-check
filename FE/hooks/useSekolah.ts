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

export function useSekolah() {
  const { get, post, put, del } = useApi();

  async function list() {
    return get<{ data: Sekolah[] }>("/sekolah");
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
