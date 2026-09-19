import { beforeEach } from "vitest";
import { prisma } from "../src/config/prisma.js";

// Limpa as tabelas antes de CADA teste (não só da suíte), na ordem que
// respeita as foreign keys. Isso garante que um teste nunca "herda"
// dado deixado por outro — a causa mais comum de teste que alucina
// resultado (passa por acidente, falha por acidente).
beforeEach(async () => {
  await prisma.anexo.deleteMany();
  await prisma.historicoItem.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.pacote.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.fornecedor.deleteMany();
});
