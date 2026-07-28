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

export function useUsers() {
  const { get, put, del } = useApi();

  async function list(search?: string) {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return get<{ data: User[] }>(`/users${q}`);
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
