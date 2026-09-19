import type { Request, Response } from "express";
import { z } from "zod";
import * as itensService from "./itens.service.js";

const itemCodeParamSchema = z.object({
  itemCode: z.coerce.number().int(),
});

export async function getItemHandler(req: Request, res: Response) {
  const { itemCode } = itemCodeParamSchema.parse(req.params);
  const item = await itensService.getItemDetalhe(req.user!, req.params.pacoteId, itemCode);
  res.json(item);
}

const enviarSchema = z.object({
  formData: z.unknown().optional(),
});

export async function enviarItemHandler(req: Request, res: Response) {
  const { itemCode } = itemCodeParamSchema.parse(req.params);
  const { formData } = enviarSchema.parse(req.body ?? {});
  const item = await itensService.enviarItem(
    req.user!,
    req.params.pacoteId,
    itemCode,
    formData
  );
  res.json(item);
}

const decidirSchema = z.object({
  decisao: z.enum(["APROVADO", "APROVADO_CONDICIONAL", "REPROVADO"]),
  comentario: z.string().optional().nullable(),
});

export async function decidirItemHandler(req: Request, res: Response) {
  const { itemCode } = itemCodeParamSchema.parse(req.params);
  const { decisao, comentario } = decidirSchema.parse(req.body);
  const item = await itensService.decidirItem(
    req.user!,
    req.params.pacoteId,
    itemCode,
    decisao,
    comentario ?? null
  );
  res.json(item);
}
