-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatusConvocacao" ADD VALUE 'EM_AVALIACAO';
ALTER TYPE "StatusConvocacao" ADD VALUE 'DESISTENTE';
ALTER TYPE "StatusConvocacao" ADD VALUE 'EFETIVADO';

-- AlterTable
ALTER TABLE "ClassificacaoCandidato" ADD COLUMN     "posicaoConvocacao" INTEGER;

-- AlterTable
ALTER TABLE "Edital" ADD COLUMN     "percentualNegros" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "percentualPCD" INTEGER NOT NULL DEFAULT 5;
