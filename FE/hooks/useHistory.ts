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

export function useHistory() {
  const { get, post } = useApi();

  async function create(payload: HistoryPayload) {
    return post<{ message: string; data: HistoryItem }>("/riwayat", payload);
  }

  async function list() {
    return get<{ data: HistoryItem[] }>("/riwayat");
  }

  return { create, list };
}
