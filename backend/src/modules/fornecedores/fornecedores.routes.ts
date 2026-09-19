import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { listFornecedoresHandler } from "./fornecedores.controller.js";

export const fornecedoresRouter = Router();

// Só a F2J (AQF) precisa dessa lista, para criar pacotes de qualquer fornecedor.
fornecedoresRouter.get(
  "/",
  requireAuth,
  requireRole("AQF"),
  asyncHandler(listFornecedoresHandler)
);
