import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanEdital() {
  const editalId = '49c1bac1-b38c-48d9-866f-57754494a23c';
  
  // 1. Deletar registros de convocação vinculados aos candidatos deste edital
  await prisma.registroConvocacao.deleteMany({
    where: {
      classificacao: {
        editalId
      }
    }
  });
  
  // 2. Deletar os candidatos do edital
  const deleted = await prisma.classificacaoCandidato.deleteMany({
    where: {
      editalId
    }
  });
  
  console.log(`Sucesso! Excluídos ${deleted.count} candidatos do edital ${editalId}.`);
  
  await prisma.$disconnect();
}

cleanEdital().catch(console.error);
