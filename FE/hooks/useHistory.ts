import { useApi } from "./useApi";

export interface HistoryItem {
  id: string;
  user: {
    fullName: string;
  };
  sekolahNama: string;
  universitasNama: string;
  prodiNama: string;
  avgRapor: number;
  avgTKA: number | null;
  nilaiAkhir: number;
  persentase: number;
  selisih: number;
  createdAt: string;
}

export interface HistoryPayload {
  sekolahId?: string;
  sekolahNama: string;
  universitasId: string;
  universitasNama: string;
  prodiId: string;
  prodiNama: string;
  avgRapor: number;
  avgTKA?: number | null;
  nilaiAkhir: number;
  persentase: number;
  selisih: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function useHistory() {
  const { get, post, del } = useApi();

  async function create(payload: HistoryPayload) {
    return post<{ message: string; data: HistoryItem }>("/riwayat", payload);
  }

  async function list(search?: string, page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (page) params.set('page', page.toString());
    if (limit) params.set('limit', limit.toString());
    const q = params.toString() ? `?${params.toString()}` : "";
    return get<PaginatedResponse<HistoryItem>>(`/riwayat${q}`);
  }

  async function remove(id: string) {
    return del<{ message: string }>(`/riwayat/${id}`);
  }

  return { create, list, remove };
}
