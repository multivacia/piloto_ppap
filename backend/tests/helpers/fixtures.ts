import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "../../src/config/prisma.js";
import { signToken } from "../../src/utils/jwt.js";
import { ITEM_CODES } from "../../src/modules/itens/itemDefs.js";
import { env } from "../../src/config/env.js";

// Fábricas mínimas de dados para os testes. Deliberadamente separadas
// do prisma/seed.ts (que é para demonstração humana, não para testes) —
// cada teste cria só o que precisa, sem depender de um cenário grande
// e compartilhado que quebra silenciosamente quando alguém mexe no seed.

export async function criarFornecedor(nome = "Fornecedor Teste") {
  return prisma.fornecedor.create({ data: { nome } });
}

export async function criarUsuarioFornecedor(fornecedorId: string, username: string) {
  const usuario = await prisma.usuario.create({
    data: {
      username,
      passwordHash: await bcrypt.hash("senha-teste", 4),
      nome: username,
      role: "FORNECEDOR",
      fornecedorId,
    },
  });
  const token = signToken({ sub: usuario.id, role: "FORNECEDOR", fornecedorId });
  return { usuario, token };
}

export async function criarUsuarioAqf(username = "aqf.teste") {
  const usuario = await prisma.usuario.create({
    data: {
      username,
      passwordHash: await bcrypt.hash("senha-teste", 4),
      nome: username,
      role: "AQF",
      fornecedorId: null,
    },
  });
  const token = signToken({ sub: usuario.id, role: "AQF", fornecedorId: null });
  return { usuario, token };
}

export async function criarPacoteComChecklist(params: {
  fornecedorId: string;
  criadoPorId: string;
  pn?: string;
}) {
  const pacote = await prisma.pacote.create({
    data: {
      pn: params.pn ?? "PN-TESTE",
      produto: "Produto Teste",
      tipo: "FORNECEDOR",
      fornecedorId: params.fornecedorId,
      criadoPorId: params.criadoPorId,
      nivelPpap: 3,
    },
  });

  await prisma.checklistItem.createMany({
    data: ITEM_CODES.map((itemCode) => ({ pacoteId: pacote.id, itemCode })),
  });

  return pacote;
}

// Cria um anexo real (registro + arquivo físico em UPLOADS_DIR) para um
// item de um pacote, simulando o resultado de um upload via multer.
export async function criarAnexo(params: {
  pacoteId: string;
  itemCode: number;
  enviadoPorId: string;
  conteudo?: string;
}) {
  const item = await prisma.checklistItem.findUniqueOrThrow({
    where: { pacoteId_itemCode: { pacoteId: params.pacoteId, itemCode: params.itemCode } },
  });

  const nomeArquivo = `${crypto.randomUUID()}.txt`;
  fs.mkdirSync(env.uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(env.uploadsDir, nomeArquivo), params.conteudo ?? "conteudo confidencial");

  return prisma.anexo.create({
    data: {
      checklistItemId: item.id,
      nomeOriginal: "documento.txt",
      caminho: nomeArquivo,
      mimeType: "text/plain",
      tamanhoBytes: (params.conteudo ?? "conteudo confidencial").length,
      enviadoPorId: params.enviadoPorId,
    },
  });
}
