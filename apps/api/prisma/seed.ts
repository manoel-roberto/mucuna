import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Criar Usuário Administrador Padrão
  const adminEmail = 'admin@uefs.br';
  const adminPassword = 'SenhaForte123!';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  console.log(`Provisionando admin: ${adminEmail}...`);
  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: { senhaHash: hashedPassword, perfil: 'ADMINISTRADOR' },
    create: {
      nome: 'Administrador UEFS',
      email: adminEmail,
      cpf: '000.000.000-00',
      senhaHash: hashedPassword,
      perfil: 'ADMINISTRADOR',
    },
  });
  console.log('✅ Admin provisionado.');

  // Criar Modelo de Formulário Demo
  console.log('Provisionando Modelo de Formulário...');
  const modelo = await prisma.modeloFormulario.upsert({
    where: { id: 'd2d14f4e-1234-4321-a1b2-c3d4e5f6a7b8' }, // ID fixo para consistência
    update: {},
    create: {
      id: 'd2d14f4e-1234-4321-a1b2-c3d4e5f6a7b8',
      nome: 'Formulário de Inscrição Padrão',
      descricao: 'Modelo base para coleta de documentos e dados pessoais.',
      esquemaJSON: {
        fields: [
          { name: 'rg', label: 'RG', type: 'file', required: true },
          { name: 'diploma', label: 'Diploma', type: 'file', required: true }
        ]
      },
      criadoPorId: (await prisma.usuario.findFirst({ where: { perfil: 'ADMINISTRADOR' } }))?.id || '',
    },
  });
  console.log('✅ Modelo de Formulário pronto.');

  // Criar Edital Demo
  console.log('Provisionando Edital Demo...');
  const edital = await prisma.edital.upsert({
    where: { id: '7e2d7cd0-eb43-40f0-811a-845c1af5a341' }, // Mantendo o ID que o usuário já usava
    update: { status: 'ATIVO' },
    create: {
      id: '7e2d7cd0-eb43-40f0-811a-845c1af5a341',
      titulo: 'Processo Seletivo UEFS 2026',
      descricao: 'Edital de demonstração restaurado para continuidade dos testes.',
      ano: 2026,
      status: 'ATIVO',
    },
  });
  console.log('✅ Edital Demo pronto.');

  // Vincular Formulário ao Edital
  await prisma.editalFormulario.upsert({
    where: { editalId_modeloFormularioId: { editalId: edital.id, modeloFormularioId: modelo.id } },
    update: {},
    create: { editalId: edital.id, modeloFormularioId: modelo.id, obrigatorio: true },
  });

  const all = await prisma.classificacaoCandidato.findMany({ 
    include: { modalidade: true } 
  });
  
  console.log(`Checking ${all.length} candidates for migration via SEED...`);
  let count = 0;

  for (const c of all) {
    const data: any = {};
    
    if ((c.posicaoAmpla === 0 || c.posicaoAmpla === null) && (c.posicao ?? 0) > 0) {
      data.posicaoAmpla = c.posicao;
    }
    
    if (!c.concorrenciaAmpla && !c.concorrenciaNegro && !c.concorrenciaPCD) {
      data.concorrenciaAmpla = true; 
      if (c.modalidade?.nome.includes('Negros')) {
         data.concorrenciaNegro = true;
         if (!c.posicaoNegro) data.posicaoNegro = c.posicao;
      }
      if (c.modalidade?.nome.includes('PCD')) {
         data.concorrenciaPCD = true;
         if (!c.posicaoPCD) data.posicaoPCD = c.posicao;
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
  
  console.log(`Migration SEED finished. ${count} records updated.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
