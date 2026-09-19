import type { Role } from "@prisma/client";

// Extensão do tipo Request do Express para carregar o usuário autenticado
// (preenchido pelo middleware requireAuth) em todo o restante da requisição.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        fornecedorId: string | null;
      };
    }
  }
}

export {};
