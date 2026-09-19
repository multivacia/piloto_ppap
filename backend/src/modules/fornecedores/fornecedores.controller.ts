import type { Request, Response } from "express";
import * as fornecedoresService from "./fornecedores.service.js";

export async function listFornecedoresHandler(_req: Request, res: Response) {
  const fornecedores = await fornecedoresService.listFornecedores();
  res.json(fornecedores);
}
