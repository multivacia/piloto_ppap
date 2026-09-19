import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

// Exige um Bearer token válido e popula req.user. Toda rota protegida
// passa por aqui antes de qualquer lógica de negócio.
//
// Aceita o token também via query string (?token=...) como exceção,
// só para permitir o link de download de anexo abrir em nova aba (uma
// tag <a> não consegue enviar um header Authorization). O mesmo JWT de
// curta duração é usado, nada de credencial adicional é exposta na URL.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const queryToken = typeof req.query.token === "string" ? req.query.token : null;
  const rawToken = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : queryToken;

  if (!rawToken) {
    throw AppError.unauthorized();
  }

  try {
    const payload = verifyToken(rawToken);
    req.user = {
      id: payload.sub,
      role: payload.role,
      fornecedorId: payload.fornecedorId,
    };
    next();
  } catch {
    throw AppError.unauthorized("Token inválido ou expirado");
  }
}

// Restringe a rota a um ou mais papéis (ex.: só AQF pode criar pacotes).
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw AppError.forbidden();
    }
    next();
  };
}
