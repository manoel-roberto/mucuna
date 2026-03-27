import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.classificacaoCandidato.count();
  console.log('Total candidates:', count);

  const samples = await prisma.classificacaoCandidato.findMany({
    take: 10,
    include: { edital: true }
  });

  console.log('Sample candidates:');
  samples.forEach(s => {
    console.log(`- ID: ${s.id}, Name: ${s.nomeCandidato}, Edital: ${s.edital?.titulo}, PosAmpla: ${s.posicaoAmpla}, PosOld: ${s.posicao}, AC: ${s.concorrenciaAmpla}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
