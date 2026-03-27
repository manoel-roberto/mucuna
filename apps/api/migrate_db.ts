import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function migrate() {
  const all = await prisma.classificacaoCandidato.findMany({ 
    include: { modalidade: true } 
  });
  
  console.log(`Checking ${all.length} candidates for migration...`);
  let count = 0;

  for (const c of all) {
    const data: any = {};
    
    // Migra posição geral se a nova estiver zerada
    if ((c.posicaoAmpla === 0 || c.posicaoAmpla === null) && c.posicao !== null && c.posicao > 0) {
      data.posicaoAmpla = c.posicao;
    }
    
    // Se todas as flags novas forem false (estado inicial pós-migration sem dados), 
    // inferimos a participação baseada na modalidadeId antiga.
    // IMPORTANTE: No novo modelo, TODOS concorrem na AMPLA.
    if (!c.concorrenciaAmpla && !c.concorrenciaNegro && !c.concorrenciaPCD) {
      data.concorrenciaAmpla = true; 
      if (c.modalidade?.nome.includes('Negros')) {
         data.concorrenciaNegro = true;
         if (!c.posicaoNegro && c.posicao !== null) data.posicaoNegro = c.posicao;
      }
      if (c.modalidade?.nome.includes('PCD')) {
         data.concorrenciaPCD = true;
         if (!c.posicaoPCD && c.posicao !== null) data.posicaoPCD = c.posicao;
      }
    }
    
    if (Object.keys(data).length > 0) {
      await prisma.classificacaoCandidato.update({ 
        where: { id: c.id }, 
        data 
      });
      count++;
    }
  }
  
  console.log(`Migration finished. ${count} records updated.`);
}

migrate()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
