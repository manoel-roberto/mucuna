-- AlterEnum
ALTER TYPE "StatusConvocacao" ADD VALUE 'CONVOCACAO_ENVIADA';

-- AlterTable
ALTER TABLE "ClassificacaoCandidato" ADD COLUMN     "tipoVaga" TEXT;

-- AlterTable
ALTER TABLE "VagaEdital" ADD COLUMN     "totalACCalculado" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalNEGCalculado" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPCDCalculado" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vagasACImediatas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vagasACReserva" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vagasNEGImediatas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vagasNEGReserva" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vagasPCDImediatas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vagasPCDReserva" INTEGER NOT NULL DEFAULT 0;

-- Migração de Dados Legados
UPDATE "VagaEdital" SET 
  "vagasACImediatas" = "vagasAC",
  "vagasNEGImediatas" = "vagasNEG",
  "vagasPCDImediatas" = "vagasPCD",
  "totalACCalculado" = "vagasAC",
  "totalNEGCalculado" = "vagasNEG",
  "totalPCDCalculado" = "vagasPCD";

