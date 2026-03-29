import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../.env') });
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
    // Editais
    { slug: 'EDITAIS_LISTAR', nome: 'Consultar Editais', categoria: 'Editais', descricao: 'Ver a lista e detalhes de editais' },
    { slug: 'EDITAIS_CRIAR', nome: 'Criar Edital', categoria: 'Editais', descricao: 'Lançar novos editais no sistema' },
    { slug: 'EDITAIS_EDITAR', nome: 'Editar Edital', categoria: 'Editais', descricao: 'Modificar dados de editais' },
    { slug: 'EDITAIS_EXCLUIR', nome: 'Excluir Edital', categoria: 'Editais', descricao: 'Remover editais (se permitido)' },
    
    // Formulários e Questionários
    { slug: 'FORMULARIOS_LISTAR', nome: 'Consultar Questionários', categoria: 'Questionários', descricao: 'Ver modelos de questionário' },
    { slug: 'FORMULARIOS_CRIAR', nome: 'Criar Questionário', categoria: 'Questionários', descricao: 'Adicionar modelos de questionário' },
    { slug: 'FORMULARIOS_EDITAR', nome: 'Editar Questionário', categoria: 'Questionários', descricao: 'Alterar modelos de questionário' },
    { slug: 'FORMULARIOS_EXCLUIR', nome: 'Excluir Questionário', categoria: 'Questionários', descricao: 'Remover modelos de questionário' },

    // Carreiras, Cargos, Níveis e Áreas
    { slug: 'CARREIRAS_LISTAR', nome: 'Consultar Carreiras', categoria: 'Carreiras', descricao: 'Ver a lista de carreiras' },
    { slug: 'CARREIRAS_CRIAR', nome: 'Criar Carreira', categoria: 'Carreiras', descricao: 'Adicionar novas carreiras' },
    { slug: 'CARREIRAS_EDITAR', nome: 'Editar Carreira', categoria: 'Carreiras', descricao: 'Modificar carreiras existentes' },
    { slug: 'CARREIRAS_EXCLUIR', nome: 'Excluir Carreira', categoria: 'Carreiras', descricao: 'Remover carreiras' },

    { slug: 'CARGOS_LISTAR', nome: 'Consultar Cargos', categoria: 'Cargos', descricao: 'Ver a lista de cargos' },
    { slug: 'CARGOS_CRIAR', nome: 'Criar Cargo', categoria: 'Cargos', descricao: 'Adicionar novos cargos' },
    { slug: 'CARGOS_EDITAR', nome: 'Editar Cargo', categoria: 'Cargos', descricao: 'Modificar cargos existentes' },
    { slug: 'CARGOS_EXCLUIR', nome: 'Excluir Cargo', categoria: 'Cargos', descricao: 'Remover cargos' },

    { slug: 'NIVEIS_LISTAR', nome: 'Consultar Níveis', categoria: 'Níveis', descricao: 'Ver a lista de níveis' },
    { slug: 'NIVEIS_CRIAR', nome: 'Criar Nível', categoria: 'Níveis', descricao: 'Adicionar novos níveis' },
    { slug: 'NIVEIS_EDITAR', nome: 'Editar Nível', categoria: 'Níveis', descricao: 'Modificar níveis existentes' },
    { slug: 'NIVEIS_EXCLUIR', nome: 'Excluir Nível', categoria: 'Níveis', descricao: 'Remover níveis' },

    { slug: 'AREAS_LISTAR', nome: 'Consultar Áreas', categoria: 'Áreas de Atuação', descricao: 'Ver a lista de áreas de atuação' },
    { slug: 'AREAS_CRIAR', nome: 'Criar Área', categoria: 'Áreas de Atuação', descricao: 'Adicionar novas áreas' },
    { slug: 'AREAS_EDITAR', nome: 'Editar Área', categoria: 'Áreas de Atuação', descricao: 'Modificar áreas existentes' },
    { slug: 'AREAS_EXCLUIR', nome: 'Excluir Área', categoria: 'Áreas de Atuação', descricao: 'Remover áreas' },

    // Candidatos e Avaliações
    { slug: 'CANDIDATOS_LISTAR', nome: 'Consultar Candidatos', categoria: 'Candidatos', descricao: 'Ver a base de candidatos' },
    { slug: 'CANDIDATOS_AVALIAR', nome: 'Avaliar Documentos', categoria: 'Candidatos', descricao: 'Analisar e aprovar envios' },
    { slug: 'CANDIDATOS_IMPORTAR', nome: 'Importar Planilhas', categoria: 'Candidatos', descricao: 'Subir dados de classificação' },
    
    // Usuários e Acesso
    { slug: 'USUARIOS_LISTAR', nome: 'Consultar Usuários', categoria: 'Usuários', descricao: 'Ver a equipe do sistema' },
    { slug: 'USUARIOS_CRIAR', nome: 'Criar Usuário', categoria: 'Usuários', descricao: 'Adicionar membros à equipe' },
    { slug: 'USUARIOS_EDITAR', nome: 'Editar Usuário', categoria: 'Usuários', descricao: 'Alterar dados da equipe' },
    { slug: 'USUARIOS_EXCLUIR', nome: 'Excluir Usuário', categoria: 'Usuários', descricao: 'Remover membros da equipe' },
    
    // Perfis (Roles)
    { slug: 'PERFIS_LISTAR', nome: 'Consultar Perfis', categoria: 'Perfis de Acesso', descricao: 'Ver perfis de acesso' },
    { slug: 'PERFIS_CRIAR', nome: 'Criar Perfil', categoria: 'Perfis de Acesso', descricao: 'Criar novos perfis de permissão' },
    { slug: 'PERFIS_EDITAR', nome: 'Editar Perfil', categoria: 'Perfis de Acesso', descricao: 'Modificar permissões de perfis' },
    { slug: 'PERFIS_EXCLUIR', nome: 'Excluir Perfil', categoria: 'Perfis de Acesso', descricao: 'Remover perfis de acesso' },

    // Certames e Tipos
    { slug: 'CERTAMES_LISTAR', nome: 'Consultar Certames', categoria: 'Certames', descricao: 'Ver tipos de certame' },
    { slug: 'CERTAMES_CRIAR', nome: 'Criar Certame', categoria: 'Certames', descricao: 'Adicionar tipos de certame' },
    { slug: 'CERTAMES_EDITAR', nome: 'Editar Certame', categoria: 'Certames', descricao: 'Modificar tipos de certame' },
    { slug: 'CERTAMES_EXCLUIR', nome: 'Excluir Certame', categoria: 'Certames', descricao: 'Remover tipos de certame' },

    // Vagas e Distribuição
    { slug: 'VAGAS_LISTAR', nome: 'Consultar Vagas', categoria: 'Vagas', descricao: 'Ver distribuição de vagas' },
    { slug: 'VAGAS_CRIAR', nome: 'Criar Vaga', categoria: 'Vagas', descricao: 'Adicionar nova configuração de vagas' },
    { slug: 'VAGAS_EDITAR', nome: 'Editar Vaga', categoria: 'Vagas', descricao: 'Modificar configuração de vagas' },
    { slug: 'VAGAS_EXCLUIR', nome: 'Excluir Vaga', categoria: 'Vagas', descricao: 'Remover configuração de vagas' },

    // Tipos, Modalidades e Regimes
    { slug: 'TIPOS_EDITAL_LISTAR', nome: 'Consultar Tipos de Edital', categoria: 'Tipos de Edital', descricao: 'Ver tipos de edital' },
    { slug: 'TIPOS_EDITAL_CRIAR', nome: 'Criar Tipo de Edital', categoria: 'Tipos de Edital', descricao: 'Adicionar tipos de edital' },
    { slug: 'TIPOS_EDITAL_EDITAR', nome: 'Editar Tipo de Edital', categoria: 'Tipos de Edital', descricao: 'Modificar tipos de edital' },
    { slug: 'TIPOS_EDITAL_EXCLUIR', nome: 'Excluir Tipo de Edital', categoria: 'Tipos de Edital', descricao: 'Remover tipos de edital' },

    { slug: 'MODALIDADES_LISTAR', nome: 'Consultar Modalidades', categoria: 'Modalidades', descricao: 'Ver modalidades de concorrência' },
    { slug: 'MODALIDADES_CRIAR', nome: 'Criar Modalidade', categoria: 'Modalidades', descricao: 'Adicionar novas modalidades' },
    { slug: 'MODALIDADES_EDITAR', nome: 'Editar Modalidade', categoria: 'Modalidades', descricao: 'Alterar modalidades existentes' },
    { slug: 'MODALIDADES_EXCLUIR', nome: 'Excluir Modalidade', categoria: 'Modalidades', descricao: 'Remover modalidades' },

    { slug: 'REGIMES_LISTAR', nome: 'Consultar Regimes', categoria: 'Regimes', descricao: 'Ver regimes de trabalho (ex: 40h)' },
    { slug: 'REGIMES_CRIAR', nome: 'Criar Regime', categoria: 'Regimes', descricao: 'Adicionar novos regimes' },
    { slug: 'REGIMES_EDITAR', nome: 'Editar Regime', categoria: 'Regimes', descricao: 'Modificar regimes existentes' },
    { slug: 'REGIMES_EXCLUIR', nome: 'Excluir Regime', categoria: 'Regimes', descricao: 'Remover regimes' },

    // Notícias e Avisos
    { slug: 'NOTICIAS_LISTAR', nome: 'Consultar Notícias', categoria: 'Sistema', descricao: 'Ver avisos e notícias' },
    { slug: 'NOTICIAS_CRIAR', nome: 'Criar Notícia', categoria: 'Sistema', descricao: 'Publicar novos avisos' },
    { slug: 'NOTICIAS_EDITAR', nome: 'Editar Notícia', categoria: 'Sistema', descricao: 'Alterar notícias publicadas' },
    { slug: 'NOTICIAS_EXCLUIR', nome: 'Excluir Notícia', categoria: 'Sistema', descricao: 'Remover avisos do sistema' },

    { slug: 'CONFIGURACOES_SISTEMA', nome: 'Configurações Globais', categoria: 'Sistema', descricao: 'Ajustes de cotas e reserva legal' },
    { slug: 'PORTAL_CANDIDATO_ACESSO', nome: 'Acesso Portal', categoria: 'Portal', descricao: 'Permissão básica de candidato' },
    { slug: 'VAGAS_HISTORICO', nome: 'Log de Vagas', categoria: 'Vagas', descricao: 'Ver histórico de alterações e justificativas' },
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
  
  // 7. Configuração Global (Lei Estadual 13.182/2014)
  console.log('Provisionando Configuração Global...');
  await prisma.configuracaoSistema.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      percentualNegrosPadrao: 20,
      percentualPCDPadrao: 5,
      baseLegalTexto: `Em observância à Lei Estadual nº 13.182/2014 (Estatuto da Igualdade Racial do Estado da Bahia) e ao Decreto nº 15.353/2014, este certame reserva 20% das vagas para candidatos negros e o percentual mínimo de 5% para pessoas com deficiência (PCD), conforme legislação vigente.`
    }
  });
  console.log('✅ Configuração Global pronta.');
  
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
