import { prisma } from "../../config/prisma.js";

// Lista simples de fornecedores, usada para popular o seletor no modal
// "Novo pacote PPAP" do lado AQF. Não expõe dados de usuários aqui.
export async function listFornecedores() {
  return prisma.fornecedor.findMany({
    select: { id: true, nome: true, local: true, codigo: true },
    orderBy: { nome: "asc" },
  });
}
