/*
  Warnings:

  - You are about to drop the column `tipoVaga` on the `ClassificacaoCandidato` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[editalId,numeroInscricao]` on the table `ClassificacaoCandidato` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numeroInscricao` to the `ClassificacaoCandidato` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ClassificacaoCandidato` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClassificacaoCandidato" DROP COLUMN "tipoVaga",
ADD COLUMN     "areaAtuacaoId" TEXT,
ADD COLUMN     "cargoId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "numeroInscricao" TEXT NOT NULL,
ADD COLUMN     "tipoVagaId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Edital" ADD COLUMN     "autorizacaoDOE" TEXT,
ADD COLUMN     "carreiraId" TEXT,
ADD COLUMN     "certameId" TEXT,
ADD COLUMN     "dataDOEHomologacao" TIMESTAMP(3),
ADD COLUMN     "dataDOEProrrogacao" TIMESTAMP(3),
ADD COLUMN     "dataLimiteProrrogacao" TIMESTAMP(3),
ADD COLUMN     "dataValidadeOriginal" TIMESTAMP(3),
ADD COLUMN     "dataValidadeProrrogada" TIMESTAMP(3),
ADD COLUMN     "nivelId" TEXT,
ADD COLUMN     "numCOPE" TEXT,
ADD COLUMN     "numProcessoSEI" TEXT,
ADD COLUMN     "observacaoValidade" TEXT,
ADD COLUMN     "portariaHomologacao" TEXT,
ADD COLUMN     "portariaProrrogacao" TEXT,
ADD COLUMN     "regimeId" TEXT;

-- CreateTable
CREATE TABLE "Certame" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carreira" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Carreira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nivel" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nivel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Regime" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Regime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoVaga" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoVaga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cargo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaAtuacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AreaAtuacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VagaEdital" (
    "id" TEXT NOT NULL,
    "editalId" TEXT NOT NULL,
    "cargoId" TEXT NOT NULL,
    "areaAtuacaoId" TEXT,
    "quantidadeVagas" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VagaEdital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoEdital" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "TipoEdital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Certame_nome_key" ON "Certame"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Carreira_nome_key" ON "Carreira"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Nivel_nome_key" ON "Nivel"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Regime_nome_key" ON "Regime"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TipoVaga_nome_key" ON "TipoVaga"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Cargo_nome_key" ON "Cargo"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "AreaAtuacao_nome_cargoId_key" ON "AreaAtuacao"("nome", "cargoId");

-- CreateIndex
CREATE UNIQUE INDEX "VagaEdital_editalId_cargoId_areaAtuacaoId_key" ON "VagaEdital"("editalId", "cargoId", "areaAtuacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "TipoEdital_nome_key" ON "TipoEdital"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "ClassificacaoCandidato_editalId_numeroInscricao_key" ON "ClassificacaoCandidato"("editalId", "numeroInscricao");

-- AddForeignKey
ALTER TABLE "Edital" ADD CONSTRAINT "Edital_certameId_fkey" FOREIGN KEY ("certameId") REFERENCES "Certame"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edital" ADD CONSTRAINT "Edital_carreiraId_fkey" FOREIGN KEY ("carreiraId") REFERENCES "Carreira"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edital" ADD CONSTRAINT "Edital_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edital" ADD CONSTRAINT "Edital_regimeId_fkey" FOREIGN KEY ("regimeId") REFERENCES "Regime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassificacaoCandidato" ADD CONSTRAINT "ClassificacaoCandidato_areaAtuacaoId_fkey" FOREIGN KEY ("areaAtuacaoId") REFERENCES "AreaAtuacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassificacaoCandidato" ADD CONSTRAINT "ClassificacaoCandidato_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassificacaoCandidato" ADD CONSTRAINT "ClassificacaoCandidato_tipoVagaId_fkey" FOREIGN KEY ("tipoVagaId") REFERENCES "TipoVaga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaAtuacao" ADD CONSTRAINT "AreaAtuacao_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaEdital" ADD CONSTRAINT "VagaEdital_areaAtuacaoId_fkey" FOREIGN KEY ("areaAtuacaoId") REFERENCES "AreaAtuacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaEdital" ADD CONSTRAINT "VagaEdital_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaEdital" ADD CONSTRAINT "VagaEdital_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE CASCADE ON UPDATE CASCADE;
