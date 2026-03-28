/*
  Warnings:

  - A unique constraint covering the columns `[editalId,cpfCandidato]` on the table `ClassificacaoCandidato` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[editalId,numeroInscricao]` on the table `ClassificacaoCandidato` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StatusRegistroConvocacao" AS ENUM ('AGUARDANDO_RESPOSTA', 'DOCUMENTACAO_RECEBIDA', 'PRAZO_EXPIRADO', 'DESISTENCIA', 'SEM_RESPOSTA', 'MUDANCA_FASE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatusConvocacao" ADD VALUE 'AGUARDANDO_CONVOCACAO';
ALTER TYPE "StatusConvocacao" ADD VALUE 'PRAZO_EXPIRADO';
ALTER TYPE "StatusConvocacao" ADD VALUE 'SEM_RESPOSTA';
ALTER TYPE "StatusConvocacao" ADD VALUE 'AGUARDANDO_DOCUMENTACAO';
ALTER TYPE "StatusConvocacao" ADD VALUE 'DOCUMENTACAO_PENDENTE';
ALTER TYPE "StatusConvocacao" ADD VALUE 'AGENDAMENTO_APRESENTACAO';

-- DropIndex
DROP INDEX "ClassificacaoCandidato_editalId_cpfCandidato_modalidadeId_key";

-- DropIndex
DROP INDEX "ClassificacaoCandidato_editalId_numeroInscricao_modalidadeI_key";

-- AlterTable
ALTER TABLE "ClassificacaoCandidato" ADD COLUMN     "celularCandidato" TEXT,
ADD COLUMN     "concorrenciaAmpla" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "concorrenciaNegro" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "concorrenciaPCD" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dadosConfirmados" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailCandidato" TEXT,
ADD COLUMN     "enderecoCandidato" TEXT,
ADD COLUMN     "modeloFormularioId" TEXT,
ADD COLUMN     "nota" DOUBLE PRECISION,
ADD COLUMN     "posicaoAmpla" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "posicaoNegro" INTEGER,
ADD COLUMN     "posicaoPCD" INTEGER,
ADD COLUMN     "telefoneCandidato" TEXT,
ALTER COLUMN "posicao" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Envio" ADD COLUMN     "finalizado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "itensAvaliacaoJSON" JSONB;

-- AlterTable
ALTER TABLE "VagaEdital" ADD COLUMN     "modeloFormularioId" TEXT;

-- CreateTable
CREATE TABLE "RegistroConvocacao" (
    "id" TEXT NOT NULL,
    "classificacaoCandidatoId" TEXT NOT NULL,
    "dataConvocacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meioUtilizado" TEXT NOT NULL,
    "prazoDocumentacao" TIMESTAMP(3) NOT NULL,
    "status" "StatusRegistroConvocacao" NOT NULL DEFAULT 'AGUARDANDO_RESPOSTA',
    "observacoes" TEXT,
    "criadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroConvocacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassificacaoCandidato_editalId_cpfCandidato_key" ON "ClassificacaoCandidato"("editalId", "cpfCandidato");

-- CreateIndex
CREATE UNIQUE INDEX "ClassificacaoCandidato_editalId_numeroInscricao_key" ON "ClassificacaoCandidato"("editalId", "numeroInscricao");

-- AddForeignKey
ALTER TABLE "ClassificacaoCandidato" ADD CONSTRAINT "ClassificacaoCandidato_modeloFormularioId_fkey" FOREIGN KEY ("modeloFormularioId") REFERENCES "ModeloFormulario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaEdital" ADD CONSTRAINT "VagaEdital_modeloFormularioId_fkey" FOREIGN KEY ("modeloFormularioId") REFERENCES "ModeloFormulario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroConvocacao" ADD CONSTRAINT "RegistroConvocacao_classificacaoCandidatoId_fkey" FOREIGN KEY ("classificacaoCandidatoId") REFERENCES "ClassificacaoCandidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroConvocacao" ADD CONSTRAINT "RegistroConvocacao_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
