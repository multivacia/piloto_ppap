import type { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../utils/AppError.js";
import { env } from "../../config/env.js";
import * as anexosService from "./anexos.service.js";

const paramsSchema = z.object({
  itemCode: z.coerce.number().int(),
});

export async function uploadAnexoHandler(req: Request, res: Response) {
  if (!req.file) throw AppError.badRequest("Nenhum arquivo enviado");
  paramsSchema.parse(req.params); // valida itemCode, mesmo não usado diretamente aqui

  const anexo = await anexosService.salvarAnexo(
    req.user!,
    req.params.pacoteId,
    Number(req.params.itemCode),
    req.file
  );
  res.status(201).json({
    id: anexo.id,
    nomeOriginal: anexo.nomeOriginal,
    mimeType: anexo.mimeType,
    tamanhoBytes: anexo.tamanhoBytes,
  });
}

export async function downloadAnexoHandler(req: Request, res: Response) {
  const { itemCode } = paramsSchema.parse(req.params);

  const { absolutePath, nomeOriginal, mimeType } =
    await anexosService.resolverCaminhoParaDownload(
      req.user!,
      req.params.pacoteId,
      itemCode,
      req.params.anexoId,
      env.uploadsDir
    );

  res.setHeader("Content-Type", mimeType);
  res.download(absolutePath, nomeOriginal);
}
