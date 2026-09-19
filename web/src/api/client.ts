const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

const TOKEN_KEY = "ppap.token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  isFormData?: boolean;
}

// Client HTTP único e fino: toda chamada de API passa por aqui, já
// anexando o Bearer token e traduzindo erros da API em ApiError.
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    if (options.isFormData) {
      body = options.body as FormData;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new ApiError(data.error ?? "Erro desconhecido", res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}
