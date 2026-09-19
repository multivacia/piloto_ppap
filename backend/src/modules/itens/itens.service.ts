import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { assertPacoteVisivel } from "../pacotes/pacotes.service.js";
import { isValidItemCode } from "./itemDefs.js";
import type { ItemStatus, Role } from "@prisma/client";

interface RequestUser {
  id: string;
  role: Role;
  fornecedorId: string | null;
}

// Carrega o item já validando que o pacote existe, é visível ao usuário
// (isolamento por fornecedor) e que o item de fato pertence a esse pacote.
async function loadItemComPacote(user: RequestUser, pacoteId: string, itemCode: number) {
  if (!isValidItemCode(itemCode)) {
    throw AppError.badRequest("Código de item PPAP inválido (use 1 a 18)");
  }

  const pacote = await prisma.pacote.findUnique({ where: { id: pacoteId } });
  if (!pacote) throw AppError.notFound("Pacote não encontrado");
  assertPacoteVisivel(user, pacote);

  const item = await prisma.checklistItem.findUnique({
    where: { pacoteId_itemCode: { pacoteId, itemCode } },
  });
  if (!item) throw AppError.notFound("Item não encontrado neste pacote");

  return { pacote, item };
}

export async function getItemDetalhe(user: RequestUser, pacoteId: string, itemCode: number) {
  const { item } = await loadItemComPacote(user, pacoteId, itemCode);

  const [historico, anexos] = await Promise.all([
    prisma.historicoItem.findMany({
      where: { checklistItemId: item.id },
      include: { autor: { select: { nome: true, role: true } } },
      orderBy: { revisao: "desc" },
    }),
    prisma.anexo.findMany({
      where: { checklistItemId: item.id },
      select: {
        id: true,
        nomeOriginal: true,
        mimeType: true,
        tamanhoBytes: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { ...item, historico, anexos };
}

async function mudarStatus(
  itemId: string,
  autorId: string,
  novoStatus: ItemStatus,
  comentario: string | null,
  formData?: unknown
) {
  return prisma.$transaction(async (tx) => {
    const atualizado = await tx.checklistItem.update({
      where: { id: itemId },
      data: {
        status: novoStatus,
        revisaoAtual: { increment: 1 },
        ...(formData !== undefined ? { formData } : {}),
      },
    });

    await tx.historicoItem.create({
      data: {
        checklistItemId: itemId,
        revisao: atualizado.revisaoAtual,
        status: novoStatus,
        comentario,
        autorId,
      },
    });

    return atualizado;
  });
}

// Fornecedor (ou AQF, no caso de pacote CLIENTE) envia o item para análise.
export async function enviarItem(
  user: RequestUser,
  pacoteId: string,
  itemCode: number,
  formData: unknown
) {
  const { item } = await loadItemComPacote(user, pacoteId, itemCode);

  if (item.status === "APROVADO") {
    throw AppError.badRequest("Item já aprovado, não pode ser reenviado");
  }

  return mudarStatus(item.id, user.id, "EM_ANALISE", null, formData);
}

const DECISOES: ItemStatus[] = ["APROVADO", "APROVADO_CONDICIONAL", "REPROVADO"];

// AQF decide o item: aprova, aprova condicionalmente ou reprova com motivo.
export async function decidirItem(
  user: RequestUser,
  pacoteId: string,
  itemCode: number,
  decisao: ItemStatus,
  comentario: string | null
) {
  if (user.role !== "AQF") throw AppError.forbidden("Só a F2J pode decidir um item");
  if (!DECISOES.includes(decisao)) throw AppError.badRequest("Decisão inválida");

  const { item } = await loadItemComPacote(user, pacoteId, itemCode);

  if (item.status !== "EM_ANALISE" && item.status !== "ENVIADO") {
    throw AppError.badRequest("Item precisa estar em análise para receber uma decisão");
  }
  if (decisao === "REPROVADO" && !comentario?.trim()) {
    throw AppError.badRequest("Reprovação exige um comentário com o motivo");
  }

  return mudarStatus(item.id, user.id, decisao, comentario ?? null);
}
