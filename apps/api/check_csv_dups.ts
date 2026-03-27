import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkDuplicates() {
  const editalId = '49c1bac1-b38c-48d9-866f-57754494a23c';
  const csvNums = ['2026001', '2026002', '2026003', '2026004', '2026005', '2026006', '2026007', '2026008'];
  
  const existing = await prisma.classificacaoCandidato.findMany({
    where: {
      editalId,
      numeroInscricao: { in: csvNums }
    }
  });
  
  console.log('Candidatos com inscrição duplicada no edital:', existing.map(e => ({ nome: e.nomeCandidato, inscr: e.numeroInscricao, cpf: e.cpfCandidato })));
  
  await prisma.$disconnect();
}

checkDuplicates();
