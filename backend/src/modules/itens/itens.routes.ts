import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadMiddleware } from "../anexos/anexos.middleware.js";
import { uploadAnexoHandler, downloadAnexoHandler } from "../anexos/anexos.controller.js";
import {
  decidirItemHandler,
  enviarItemHandler,
  getItemHandler,
} from "./itens.controller.js";

// mergeParams: true para enxergar :pacoteId, definido no router pai (pacotes.routes.ts)
export const itensRouter = Router({ mergeParams: true });

itensRouter.get("/:itemCode", asyncHandler(getItemHandler));
itensRouter.post("/:itemCode/enviar", asyncHandler(enviarItemHandler));
itensRouter.post("/:itemCode/decidir", asyncHandler(decidirItemHandler));

itensRouter.post(
  "/:itemCode/anexos",
  uploadMiddleware.single("arquivo"),
  asyncHandler(uploadAnexoHandler)
);
itensRouter.get("/:itemCode/anexos/:anexoId/download", asyncHandler(downloadAnexoHandler));
