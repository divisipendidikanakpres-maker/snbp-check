import { useApi } from "./useApi";

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface UpdateRolePayload {
  role: "USER" | "ADMIN";
}

export interface UpdateUserPayload {
  fullName: string;
  email: string;
  password?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function useUsers() {
  const { get, put, del } = useApi();

  async function list(search?: string, page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (page) params.set('page', page.toString());
    if (limit) params.set('limit', limit.toString());
    const q = params.toString() ? `?${params.toString()}` : "";
    return get<PaginatedResponse<User>>(`/users${q}`);
  }

  async function update(id: string, payload: UpdateUserPayload) {
    return put<{ message: string; data: User }>(`/users/${id}`, payload);
  }

  async function updateRole(id: string, payload: UpdateRolePayload) {
    return put<{ message: string; data: User }>(
      `/users/${id}/role`,
      payload
    );
  }

  async function remove(id: string) {
    return del<{ message: string }>(`/users/${id}`);
  }

  return { list, update, updateRole, remove };
}
