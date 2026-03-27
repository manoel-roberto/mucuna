/*
  Warnings:

  - A unique constraint covering the columns `[editalId,cpfCandidato,modalidadeId]` on the table `ClassificacaoCandidato` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[editalId,numeroInscricao,modalidadeId]` on the table `ClassificacaoCandidato` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ClassificacaoCandidato_editalId_cpfCandidato_key";

-- DropIndex
DROP INDEX "ClassificacaoCandidato_editalId_numeroInscricao_key";

-- CreateIndex
CREATE UNIQUE INDEX "ClassificacaoCandidato_editalId_cpfCandidato_modalidadeId_key" ON "ClassificacaoCandidato"("editalId", "cpfCandidato", "modalidadeId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassificacaoCandidato_editalId_numeroInscricao_modalidadeI_key" ON "ClassificacaoCandidato"("editalId", "numeroInscricao", "modalidadeId");
