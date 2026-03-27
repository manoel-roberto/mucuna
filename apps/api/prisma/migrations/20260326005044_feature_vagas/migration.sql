/*
  Warnings:

  - You are about to drop the column `tipoVagaId` on the `ClassificacaoCandidato` table. All the data in the column will be lost.
  - You are about to drop the column `carreiraId` on the `Edital` table. All the data in the column will be lost.
  - You are about to drop the column `nivelId` on the `Edital` table. All the data in the column will be lost.
  - You are about to drop the `TipoVaga` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[editalId,cargoId,areaAtuacaoId,carreiraId,nivelId,modalidadeId]` on the table `VagaEdital` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SituacaoClassificacao" AS ENUM ('APROVADO_CONVOCAVEL', 'CADASTRO_RESERVA');

-- DropForeignKey
ALTER TABLE "ClassificacaoCandidato" DROP CONSTRAINT "ClassificacaoCandidato_tipoVagaId_fkey";

-- DropForeignKey
ALTER TABLE "Edital" DROP CONSTRAINT "Edital_carreiraId_fkey";

-- DropForeignKey
ALTER TABLE "Edital" DROP CONSTRAINT "Edital_nivelId_fkey";

-- DropIndex
DROP INDEX "VagaEdital_editalId_cargoId_areaAtuacaoId_key";

-- AlterTable
ALTER TABLE "ClassificacaoCandidato" DROP COLUMN "tipoVagaId",
ADD COLUMN     "modalidadeId" TEXT,
ADD COLUMN     "situacao" "SituacaoClassificacao" NOT NULL DEFAULT 'CADASTRO_RESERVA';

-- AlterTable
ALTER TABLE "Edital" DROP COLUMN "carreiraId",
DROP COLUMN "nivelId";

-- AlterTable
ALTER TABLE "VagaEdital" ADD COLUMN     "carreiraId" TEXT,
ADD COLUMN     "modalidadeId" TEXT,
ADD COLUMN     "nivelId" TEXT;

-- DropTable
DROP TABLE "TipoVaga";

-- CreateTable
CREATE TABLE "ModalidadeConcorrencia" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModalidadeConcorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModalidadeConcorrencia_nome_key" ON "ModalidadeConcorrencia"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "VagaEdital_editalId_cargoId_areaAtuacaoId_carreiraId_nivelI_key" ON "VagaEdital"("editalId", "cargoId", "areaAtuacaoId", "carreiraId", "nivelId", "modalidadeId");

-- AddForeignKey
ALTER TABLE "ClassificacaoCandidato" ADD CONSTRAINT "ClassificacaoCandidato_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "ModalidadeConcorrencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaEdital" ADD CONSTRAINT "VagaEdital_carreiraId_fkey" FOREIGN KEY ("carreiraId") REFERENCES "Carreira"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaEdital" ADD CONSTRAINT "VagaEdital_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaEdital" ADD CONSTRAINT "VagaEdital_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "ModalidadeConcorrencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
