import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Criar Permissões Iniciais
  console.log('Provisionando Permissões...');
  const permissionsList = [
    { slug: 'EDITAIS_GERENCIAR', nome: 'Gerenciar Editais', categoria: 'Editais', descricao: 'Criar e editar editais e vagas' },
    { slug: 'CANDIDATOS_AVALIAR', nome: 'Avaliar Documentos', categoria: 'Candidatos', descricao: 'Analisar e aprovar envios de candidatos' },
    { slug: 'CANDIDATOS_IMPORTAR', nome: 'Importar Candidatos', categoria: 'Candidatos', descricao: 'Subir planilhas de classificação' },
    { slug: 'USUARIOS_GERENCIAR', nome: 'Gerenciar Usuários', categoria: 'Sistema', descricao: 'Controle de acesso e equipe' },
    { slug: 'CONFIGURACOES_SISTEMA', nome: 'Configurações Globais', categoria: 'Sistema', descricao: 'Ajustes finos da plataforma' },
    { slug: 'PORTAL_CANDIDATO_ACESSO', nome: 'Acesso Portal', categoria: 'Portal', descricao: 'Permissão básica de candidato' },
  ];

  for (const p of permissionsList) {
    await prisma.permission.upsert({
      where: { slug: p.slug },
      update: { 
        nome: p.nome,
        categoria: p.categoria,
        descricao: p.descricao 
      },
      create: { 
        slug: p.slug, 
        nome: p.nome,
        categoria: p.categoria,
        descricao: p.descricao 
      },
    });
  }
  console.log('✅ Permissões provisionadas.');

  // 2. Criar Perfis (Roles)
  console.log('Provisionando Perfis (Roles)...');
  const roles = [
    { nome: 'Administrador', descricao: 'Acesso total ao sistema' },
    { nome: 'Operador', descricao: 'Gestão de editais e candidatos' },
    { nome: 'Candidato', descricao: 'Acesso ao portal do candidato' },
  ];

  const roleEntities: Record<string, any> = {};
  for (const r of roles) {
    roleEntities[r.nome] = await prisma.role.upsert({
      where: { nome: r.nome },
      update: { descricao: r.descricao },
      create: { nome: r.nome, descricao: r.descricao },
    });
  }
  console.log('✅ Perfis provisionados.');

  // 3. Vincular Permissões ao Administrador
  console.log('Vinculando permissões ao Administrador...');
  const allPermissions = await prisma.permission.findMany();
  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleEntities['Administrador'].id, permissionId: p.id } },
      update: {},
      create: { roleId: roleEntities['Administrador'].id, permissionId: p.id },
    });
  }
  console.log('✅ Permissões vinculadas ao Admin.');

  // 4. Criar Usuário Administrador Padrão
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@uefs.br';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SenhaForte123!';
  const adminCpf = (process.env.ADMIN_CPF || '00000000000').replace(/\D/g, '');
  const adminNome = process.env.ADMIN_NAME || 'Administrador UEFS';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  console.log(`Provisionando usuário admin: ${adminEmail}...`);
  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: { 
      senhaHash: hashedPassword, 
      roleId: roleEntities['Administrador'].id,
      cpf: adminCpf,
      nome: adminNome
    },
    create: {
      nome: adminNome,
      email: adminEmail,
      cpf: adminCpf,
      senhaHash: hashedPassword,
      roleId: roleEntities['Administrador'].id,
    },
  });
  console.log('✅ Usuário Admin pronto.');

  // 5. Criar Modelo de Formulário Demo
  console.log('Provisionando Modelo de Formulário Demo...');
  const modelo = await prisma.modeloFormulario.upsert({
    where: { id: 'd2d14f4e-1234-4321-a1b2-c3d4e5f6a7b8' },
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
      criadoPorId: (await prisma.usuario.findFirst({ 
        where: { role: { nome: 'Administrador' } } 
      }))?.id || '',
    },
  });
  console.log('✅ Modelo de Formulário pronto.');

  // 6. Criar Edital Demo
  console.log('Provisionando Edital Demo...');
  const edital = await prisma.edital.upsert({
    where: { id: '7e2d7cd0-eb43-40f0-811a-845c1af5a341' },
    update: { status: 'ATIVO' },
    create: {
      id: '7e2d7cd0-eb43-40f0-811a-845c1af5a341',
      titulo: 'Processo Seletivo UEFS 2026',
      descricao: 'Edital de demonstração restaurado para continuidade dos testes.',
      ano: 2026,
      status: 'ATIVO',
    },
  });

  await prisma.editalFormulario.upsert({
    where: { editalId_modeloFormularioId: { editalId: edital.id, modeloFormularioId: modelo.id } },
    update: {},
    create: { editalId: edital.id, modeloFormularioId: modelo.id, obrigatorio: true },
  });
  console.log('✅ Edital Demo pronto.');
  
  console.log('🏁 Seed finalizado com sucesso.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
