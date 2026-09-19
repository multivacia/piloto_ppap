import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  createPacoteHandler,
  getPacoteHandler,
  listPacotesHandler,
} from "./pacotes.controller.js";
import { itensRouter } from "../itens/itens.routes.js";

export const pacotesRouter = Router();

pacotesRouter.use(requireAuth);

pacotesRouter.get("/", asyncHandler(listPacotesHandler));
pacotesRouter.post("/", requireRole("AQF"), asyncHandler(createPacoteHandler));
pacotesRouter.get("/:pacoteId", asyncHandler(getPacoteHandler));

// Sub-rotas de itens do checklist: /api/pacotes/:pacoteId/itens/...
pacotesRouter.use("/:pacoteId/itens", itensRouter);
