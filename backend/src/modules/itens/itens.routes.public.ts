import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { ITEM_DEFS } from "./itemDefs.js";

// Endpoint só de leitura com a definição estática dos 18 itens PPAP,
// para o frontend não precisar duplicar títulos/códigos manualmente.
export const itemDefsRouter = Router();

itemDefsRouter.get("/defs", requireAuth, (_req, res) => {
  res.json(ITEM_DEFS);
});
