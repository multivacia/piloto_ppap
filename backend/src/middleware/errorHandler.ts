import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

// Handler central de erros: qualquer AppError vira uma resposta JSON
// previsível; qualquer outro erro (bug, exceção do Prisma etc.) vira 500
// sem vazar detalhes internos para o cliente.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error("Erro não tratado:", err);
  return res.status(500).json({ error: "Erro interno do servidor" });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Rota não encontrada" });
}
