import { useApi } from "./useApi";

export interface LookupItem {
  id: string;
  nama: string;
}

export function useLookup() {
  const { get, post, del } = useApi();

  async function listKelompok() {
    return get<{ data: LookupItem[] }>("/lookup/kelompok");
  }

  async function createKelompok(nama: string) {
    return post<{ message: string; data: LookupItem }>("/lookup/kelompok", { nama });
  }

  async function removeKelompok(id: string) {
    return del<{ message: string }>(`/lookup/kelompok/${id}`);
  }

  async function listJenjang() {
    return get<{ data: LookupItem[] }>("/lookup/jenjang");
  }

  async function createJenjang(nama: string) {
    return post<{ message: string; data: LookupItem }>("/lookup/jenjang", { nama });
  }

  async function removeJenjang(id: string) {
    return del<{ message: string }>(`/lookup/jenjang/${id}`);
  }

  return {
    listKelompok,
    createKelompok,
    removeKelompok,
    listJenjang,
    createJenjang,
    removeJenjang,
  };
}
