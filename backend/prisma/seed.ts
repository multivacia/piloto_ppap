// Dados de demonstração para validação do MVP antes de seguir com dados reais.
// Roda com: npm run seed (dentro de backend/)
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { ITEM_CODES } from "../src/modules/itens/itemDefs.js";

const prisma = new PrismaClient();

async function hash(senha: string) {
  return bcrypt.hash(senha, 10);
}

async function main() {
  console.log("Limpando dados de demo anteriores...");
  await prisma.anexo.deleteMany();
  await prisma.historicoItem.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.pacote.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.fornecedor.deleteMany();

  console.log("Criando fornecedores...");
  const fcs = await prisma.fornecedor.create({
    data: { nome: "FCS Componentes e Sopro Ltda.", local: "Cabreúva/SP", codigo: "8300884" },
  });
  const piatex = await prisma.fornecedor.create({
    data: { nome: "Piatex Ind. e Com.", local: "Diadema/SP", codigo: "7712045" },
  });
  const metalSul = await prisma.fornecedor.create({
    data: { nome: "Metalúrgica Sul Ltda.", local: "Caxias do Sul/RS", codigo: "9104412" },
  });

  console.log("Criando usuários...");
  // ATENÇÃO: senhas de demonstração. Trocar antes de usar dados reais.
  const usuarios = [
    { username: "fcs.qualidade", senha: "Fcs#4821", nome: "Qualidade FCS", fornecedorId: fcs.id },
    { username: "piatex.pcp", senha: "Pia#7395", nome: "PCP Piatex", fornecedorId: piatex.id },
    { username: "metalsul.eng", senha: "Sul#2260", nome: "Engenharia Metalúrgica Sul", fornecedorId: metalSul.id },
    { username: "f2j.aqf", senha: "F2j#9137", nome: "AQF F2J", fornecedorId: null },
  ] as const;

  for (const u of usuarios) {
    await prisma.usuario.create({
      data: {
        username: u.username,
        passwordHash: await hash(u.senha),
        nome: u.nome,
        role: u.fornecedorId ? "FORNECEDOR" : "AQF",
        fornecedorId: u.fornecedorId,
      },
    });
  }
  const aqf = await prisma.usuario.findUniqueOrThrow({ where: { username: "f2j.aqf" } });

  console.log("Criando pacotes de exemplo...");
  const pacoteFcs = await prisma.pacote.create({
    data: {
      pn: "026580.0",
      produto: "Shutter_LAN_Central",
      tipo: "FORNECEDOR",
      fornecedorId: fcs.id,
      compradorF2J: "AQF F2J",
      nivelPpap: 3,
      criadoPorId: aqf.id,
    },
  });

  const pacotePiatex = await prisma.pacote.create({
    data: {
      pn: "031204.2",
      produto: "Guarnição de Porta Dianteira",
      tipo: "FORNECEDOR",
      fornecedorId: piatex.id,
      compradorF2J: "AQF F2J",
      nivelPpap: 3,
      criadoPorId: aqf.id,
    },
  });

  const pacoteCliente = await prisma.pacote.create({
    data: {
      pn: "INT-0042",
      produto: "Homologação Interna — Linha de Montagem de Faróis",
      tipo: "CLIENTE",
      fornecedorId: null,
      compradorF2J: "AQF F2J",
      nivelPpap: 2,
      criadoPorId: aqf.id,
    },
  });

  // Cria os 18 itens PENDENTE para cada pacote, depois ajusta alguns
  // estados específicos para dar um cenário real de demo.
  for (const pacote of [pacoteFcs, pacotePiatex, pacoteCliente]) {
    await prisma.checklistItem.createMany({
      data: ITEM_CODES.map((itemCode) => ({ pacoteId: pacote.id, itemCode })),
    });
  }

  // Pacote FCS: item 8 (MSA) reprovado com motivo e histórico
  const itemMsaFcs = await prisma.checklistItem.update({
    where: { pacoteId_itemCode: { pacoteId: pacoteFcs.id, itemCode: 8 } },
    data: { status: "REPROVADO", revisaoAtual: 2 },
  });
  await prisma.historicoItem.createMany({
    data: [
      { checklistItemId: itemMsaFcs.id, revisao: 1, status: "EM_ANALISE", autorId: aqf.id, comentario: null },
      {
        checklistItemId: itemMsaFcs.id,
        revisao: 2,
        status: "REPROVADO",
        autorId: aqf.id,
        comentario: "R&R do instrumento acima de 30%. Refazer o estudo com o paquímetro calibrado.",
      },
    ],
  });

  // Pacote FCS: item 7 (Plano de Controle) enviado com formulário estruturado
  await prisma.checklistItem.update({
    where: { pacoteId_itemCode: { pacoteId: pacoteFcs.id, itemCode: 7 } },
    data: {
      status: "EM_ANALISE",
      revisaoAtual: 1,
      formData: {
        etapas: [
          { operacao: "Injeção", caracteristica: "Espessura de parede", especificacao: "2.0mm ±0.1", frequencia: "1/hora" },
        ],
      },
    },
  });

  // Pacote Piatex: item 18 (PSW) aprovado, fluxo completo
  const itemPswPiatex = await prisma.checklistItem.update({
    where: { pacoteId_itemCode: { pacoteId: pacotePiatex.id, itemCode: 18 } },
    data: { status: "APROVADO", revisaoAtual: 1 },
  });
  await prisma.historicoItem.create({
    data: {
      checklistItemId: itemPswPiatex.id,
      revisao: 1,
      status: "APROVADO",
      autorId: aqf.id,
      comentario: "PSW conforme, sem ressalvas.",
    },
  });

  console.log("Seed concluído.");
  console.table(
    usuarios.map((u) => ({ username: u.username, senha: u.senha, papel: u.fornecedorId ? "FORNECEDOR" : "AQF" }))
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
