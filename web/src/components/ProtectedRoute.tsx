import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { usuario, carregando } = useAuth();

  if (carregando) return <div className="page-centered">Carregando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
