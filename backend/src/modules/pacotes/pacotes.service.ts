import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { ITEM_CODES } from "../itens/itemDefs.js";
import type { PacoteTipo, Role } from "@prisma/client";

interface RequestUser {
  id: string;
  role: Role;
  fornecedorId: string | null;
}

interface ListPacotesFiltro {
  tipo?: PacoteTipo;
}

// Regra central de isolamento: um FORNECEDOR só pode ver pacotes do seu
// próprio fornecedorId. Nunca é o frontend quem decide isso — toda query
// já nasce filtrada aqui, no backend.
export async function listPacotes(user: RequestUser, filtro: ListPacotesFiltro) {
  if (user.role === "FORNECEDOR") {
    return prisma.pacote.findMany({
      where: { fornecedorId: user.fornecedorId },
      include: { itens: true, fornecedor: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // AQF (F2J): vê tudo, com filtro opcional por aba (Fornecedores / Cliente)
  return prisma.pacote.findMany({
    where: filtro.tipo ? { tipo: filtro.tipo } : undefined,
    include: { itens: true, fornecedor: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPacoteById(user: RequestUser, pacoteId: string) {
  const pacote = await prisma.pacote.findUnique({
    where: { id: pacoteId },
    include: {
      fornecedor: true,
      itens: { orderBy: { itemCode: "asc" } },
    },
  });

  if (!pacote) throw AppError.notFound("Pacote não encontrado");
  assertPacoteVisivel(user, pacote);

  return pacote;
}

// Garante que um usuário FORNECEDOR nunca acesse um pacote de outro
// fornecedor, mesmo trocando o ID na URL manualmente.
export function assertPacoteVisivel(
  user: RequestUser,
  pacote: { fornecedorId: string | null }
) {
  if (user.role === "FORNECEDOR" && pacote.fornecedorId !== user.fornecedorId) {
    throw AppError.forbidden("Você não tem acesso a este pacote");
  }
}

interface CreatePacoteInput {
  pn: string;
  produto: string;
  tipo: PacoteTipo;
  fornecedorId?: string | null;
  compradorF2J?: string | null;
  nivelPpap: number;
}

// Cria o pacote e já popula os 18 itens do checklist como PENDENTE,
// numa única transação — nunca existe um pacote "pela metade".
export async function createPacote(criadoPorId: string, input: CreatePacoteInput) {
  if (input.tipo === "FORNECEDOR" && !input.fornecedorId) {
    throw AppError.badRequest("Pacote do tipo Fornecedor exige um fornecedorId");
  }

  return prisma.$transaction(async (tx) => {
    const pacote = await tx.pacote.create({
      data: {
        pn: input.pn,
        produto: input.produto,
        tipo: input.tipo,
        fornecedorId: input.tipo === "CLIENTE" ? null : input.fornecedorId,
        compradorF2J: input.compradorF2J ?? null,
        nivelPpap: input.nivelPpap,
        criadoPorId,
      },
    });

    await tx.checklistItem.createMany({
      data: ITEM_CODES.map((itemCode) => ({
        pacoteId: pacote.id,
        itemCode,
      })),
    });

    return tx.pacote.findUniqueOrThrow({
      where: { id: pacote.id },
      include: { itens: true, fornecedor: true },
    });
  });
}
