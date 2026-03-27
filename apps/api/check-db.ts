import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allModelos = await prisma.modeloFormulario.findMany();
  console.log('--- Modelos de Formulário ---');
  console.log(JSON.stringify(allModelos.map(m => ({ id: m.id, nome: m.nome })), null, 2));

  const allEditais = await prisma.edital.findMany({
    include: {
      _count: { select: { formularios: true } }
    }
  });
  console.log('--- Editais e Contagem de Formulários ---');
  console.log(JSON.stringify(allEditais.map(e => ({ id: e.id, titulo: e.titulo, count: e._count.formularios })), null, 2));

  const allEditalForms = await prisma.editalFormulario.findMany({
    include: { modeloFormulario: true, edital: true }
  });
  console.log('--- EditalFormulário (Relacionamento) ---');
  console.log(JSON.stringify(allEditalForms.map(ef => ({ edital: ef.edital.titulo, modelo: ef.modeloFormulario.nome })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
