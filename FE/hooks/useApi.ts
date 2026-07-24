import axios, { AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiError {
  message: string;
  status?: number;
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ message?: string }>;
    return {
      message: err.response?.data?.message ?? "Terjadi kesalahan. Coba lagi.",
      status: err.response?.status,
    };
  }
  return { message: "Terjadi kesalahan. Coba lagi." };
}

export function useApi() {
  async function get<T>(url: string): Promise<T> {
    try {
      const res = await apiClient.get<T>(url);
      return res.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async function post<T>(url: string, body?: unknown): Promise<T> {
    try {
      const res = await apiClient.post<T>(url, body);
      return res.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async function put<T>(url: string, body?: unknown): Promise<T> {
    try {
      const res = await apiClient.put<T>(url, body);
      return res.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async function del<T>(url: string): Promise<T> {
    try {
      const res = await apiClient.delete<T>(url);
      return res.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  return { get, post, put, del };
}
