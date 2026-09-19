import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authApi from "../api/auth";
import { clearToken, setToken as persistToken } from "../api/client";
import type { Usuario } from "../types";

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (username: string, password: string) => Promise<void>;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Ao carregar a página, tenta restaurar a sessão a partir do token salvo.
  useEffect(() => {
    authApi
      .getMe()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false));
  }, []);

  async function entrar(username: string, password: string) {
    const { token, usuario: usuarioLogado } = await authApi.login(username, password);
    persistToken(token);
    setUsuario(usuarioLogado);
  }

  function sair() {
    clearToken();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
