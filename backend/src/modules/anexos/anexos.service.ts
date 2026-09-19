import path from "node:path";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { assertPacoteVisivel } from "../pacotes/pacotes.service.js";
import type { Role } from "@prisma/client";

interface RequestUser {
  id: string;
  role: Role;
  fornecedorId: string | null;
}

export async function salvarAnexo(
  user: RequestUser,
  pacoteId: string,
  itemCode: number,
  file: Express.Multer.File
) {
  const pacote = await prisma.pacote.findUnique({ where: { id: pacoteId } });
  if (!pacote) throw AppError.notFound("Pacote não encontrado");
  assertPacoteVisivel(user, pacote);

  const item = await prisma.checklistItem.findUnique({
    where: { pacoteId_itemCode: { pacoteId, itemCode } },
  });
  if (!item) throw AppError.notFound("Item não encontrado");

  return prisma.anexo.create({
    data: {
      checklistItemId: item.id,
      nomeOriginal: file.originalname,
      caminho: file.filename, // relativo a UPLOADS_DIR, nunca o path completo do disco
      mimeType: file.mimetype,
      tamanhoBytes: file.size,
      enviadoPorId: user.id,
    },
  });
}

// Confere posse do anexo antes de liberar o caminho absoluto para download —
// é assim que garantimos que arquivos nunca ficam acessíveis por URL direta.
// Precisa validar não só que o pacote é visível ao usuário, mas que o
// anexoId de fato pertence ao item (pacoteId + itemCode) da própria URL —
// caso contrário um fornecedor poderia baixar anexo de outro fornecedor
// só trocando o anexoId, usando um pacoteId seu para passar no isolamento.
export async function resolverCaminhoParaDownload(
  user: RequestUser,
  pacoteId: string,
  itemCode: number,
  anexoId: string,
  uploadsDir: string
) {
  const pacote = await prisma.pacote.findUnique({ where: { id: pacoteId } });
  if (!pacote) throw AppError.notFound("Pacote não encontrado");
  assertPacoteVisivel(user, pacote);

  const item = await prisma.checklistItem.findUnique({
    where: { pacoteId_itemCode: { pacoteId, itemCode } },
  });
  if (!item) throw AppError.notFound("Item não encontrado neste pacote");

  const anexo = await prisma.anexo.findFirst({
    where: { id: anexoId, checklistItemId: item.id },
  });
  if (!anexo) throw AppError.notFound("Anexo não encontrado");

  return {
    absolutePath: path.join(uploadsDir, anexo.caminho),
    nomeOriginal: anexo.nomeOriginal,
    mimeType: anexo.mimeType,
  };
}
