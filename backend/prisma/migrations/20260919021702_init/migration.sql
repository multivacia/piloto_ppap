-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FORNECEDOR', 'AQF');

-- CreateEnum
CREATE TYPE "PacoteTipo" AS ENUM ('FORNECEDOR', 'CLIENTE');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('PENDENTE', 'ENVIADO', 'EM_ANALISE', 'APROVADO', 'APROVADO_CONDICIONAL', 'REPROVADO');

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "local" TEXT,
    "codigo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fornecedorId" TEXT,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacotes" (
    "id" TEXT NOT NULL,
    "pn" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "tipo" "PacoteTipo" NOT NULL,
    "nivelPpap" INTEGER NOT NULL DEFAULT 3,
    "compradorF2J" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fornecedorId" TEXT,
    "criadoPorId" TEXT NOT NULL,

    CONSTRAINT "pacotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_itens" (
    "id" TEXT NOT NULL,
    "pacoteId" TEXT NOT NULL,
    "itemCode" INTEGER NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'PENDENTE',
    "revisaoAtual" INTEGER NOT NULL DEFAULT 0,
    "formData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_itens" (
    "id" TEXT NOT NULL,
    "checklistItemId" TEXT NOT NULL,
    "revisao" INTEGER NOT NULL,
    "status" "ItemStatus" NOT NULL,
    "comentario" TEXT,
    "autorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anexos" (
    "id" TEXT NOT NULL,
    "checklistItemId" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "enviadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anexos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_codigo_key" ON "fornecedores"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE INDEX "usuarios_fornecedorId_idx" ON "usuarios"("fornecedorId");

-- CreateIndex
CREATE INDEX "pacotes_fornecedorId_idx" ON "pacotes"("fornecedorId");

-- CreateIndex
CREATE INDEX "pacotes_tipo_idx" ON "pacotes"("tipo");

-- CreateIndex
CREATE INDEX "checklist_itens_pacoteId_idx" ON "checklist_itens"("pacoteId");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_itens_pacoteId_itemCode_key" ON "checklist_itens"("pacoteId", "itemCode");

-- CreateIndex
CREATE INDEX "historico_itens_checklistItemId_idx" ON "historico_itens"("checklistItemId");

-- CreateIndex
CREATE INDEX "anexos_checklistItemId_idx" ON "anexos"("checklistItemId");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacotes" ADD CONSTRAINT "pacotes_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacotes" ADD CONSTRAINT "pacotes_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_itens" ADD CONSTRAINT "checklist_itens_pacoteId_fkey" FOREIGN KEY ("pacoteId") REFERENCES "pacotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_itens" ADD CONSTRAINT "historico_itens_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "checklist_itens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_itens" ADD CONSTRAINT "historico_itens_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anexos" ADD CONSTRAINT "anexos_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "checklist_itens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anexos" ADD CONSTRAINT "anexos_enviadoPorId_fkey" FOREIGN KEY ("enviadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
