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

export function useUsers() {
  const { get, put, del } = useApi();

  async function list() {
    return get<{ data: User[] }>("/users");
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

  return { list, updateRole, remove };
}
