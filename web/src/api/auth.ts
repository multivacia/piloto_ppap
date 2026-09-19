import { apiRequest } from "./client";
import type { Usuario } from "../types";

interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export function login(username: string, password: string) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export function getMe() {
  return apiRequest<Usuario>("/auth/me");
}
