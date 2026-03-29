/*
  Warnings:

  - A unique constraint covering the columns `[editalId,cargoId,areaAtuacaoId,carreiraId,nivelId]` on the table `VagaEdital` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "VagaEdital_editalId_cargoId_areaAtuacaoId_carreiraId_nivelI_key";

-- AlterTable
ALTER TABLE "Edital" ADD COLUMN     "baseLegal" TEXT;

-- AlterTable
ALTER TABLE "VagaEdital" ADD COLUMN     "totalGeral" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vagasAC" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vagasNEG" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vagasNEGEsperadas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vagasPCD" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vagasPCDEsperadas" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "VagaEditalLog" (
    "id" TEXT NOT NULL,
    "vagaEditalId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "justificativa" TEXT NOT NULL,
    "detalhes" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VagaEditalLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracaoSistema" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "percentualNegrosPadrao" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "percentualPCDPadrao" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "baseLegalTexto" TEXT NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoSistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VagaEdital_editalId_cargoId_areaAtuacaoId_carreiraId_nivelI_key" ON "VagaEdital"("editalId", "cargoId", "areaAtuacaoId", "carreiraId", "nivelId");

-- AddForeignKey
ALTER TABLE "VagaEditalLog" ADD CONSTRAINT "VagaEditalLog_vagaEditalId_fkey" FOREIGN KEY ("vagaEditalId") REFERENCES "VagaEdital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaEditalLog" ADD CONSTRAINT "VagaEditalLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
