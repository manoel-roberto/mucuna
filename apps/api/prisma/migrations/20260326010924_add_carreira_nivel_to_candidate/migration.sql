-- AlterTable
ALTER TABLE "ClassificacaoCandidato" ADD COLUMN     "carreiraId" TEXT,
ADD COLUMN     "nivelId" TEXT;

-- AddForeignKey
ALTER TABLE "ClassificacaoCandidato" ADD CONSTRAINT "ClassificacaoCandidato_carreiraId_fkey" FOREIGN KEY ("carreiraId") REFERENCES "Carreira"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassificacaoCandidato" ADD CONSTRAINT "ClassificacaoCandidato_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
