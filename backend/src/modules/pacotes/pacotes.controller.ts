import type { Request, Response } from "express";
import { z } from "zod";
import * as pacotesService from "./pacotes.service.js";

const listQuerySchema = z.object({
  tipo: z.enum(["FORNECEDOR", "CLIENTE"]).optional(),
});

export async function listPacotesHandler(req: Request, res: Response) {
  const { tipo } = listQuerySchema.parse(req.query);
  const pacotes = await pacotesService.listPacotes(req.user!, { tipo });
  res.json(pacotes);
}

export async function getPacoteHandler(req: Request, res: Response) {
  const pacote = await pacotesService.getPacoteById(req.user!, req.params.pacoteId);
  res.json(pacote);
}

const createPacoteSchema = z.object({
  pn: z.string().min(1),
  produto: z.string().min(1),
  tipo: z.enum(["FORNECEDOR", "CLIENTE"]),
  fornecedorId: z.string().optional().nullable(),
  compradorF2J: z.string().optional().nullable(),
  nivelPpap: z.number().int().min(1).max(5).default(3),
});

export async function createPacoteHandler(req: Request, res: Response) {
  const input = createPacoteSchema.parse(req.body);
  const pacote = await pacotesService.createPacote(req.user!.id, input);
  res.status(201).json(pacote);
}
