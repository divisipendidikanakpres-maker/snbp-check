import { useRouter } from "next/navigation";
import { useApi } from "./useApi";

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "USER" | "ADMIN";
}

export function useAuth() {
  const router = useRouter();
  const { post, get } = useApi();

  async function register(payload: RegisterPayload) {
    const data = await post<{ message: string; user: AuthUser }>(
      "/auth/register",
      payload
    );
    router.push("/");
    return data;
  }

  async function login(payload: LoginPayload) {
    const data = await post<{ message: string; user: AuthUser }>(
      "/auth/login",
      payload
    );
    const destination = data.user.role === "ADMIN" ? "/admin/akun" : "/beranda";
    router.push(destination);
    return data;
  }

  async function logout() {
    const data = await post<{ message: string }>("/auth/logout");
    router.push("/");
    return data;
  }

  async function me() {
    return get<{ user: AuthUser }>("/auth/me");
  }

  return { register, login, logout, me };
}
