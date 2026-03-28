import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- VERIFICAÇÃO DE DADOS (EDITAIS) ---');
  const editais = await prisma.edital.findMany();
  console.log(`Total de Editais: ${editais.length}`);
  editais.forEach(e => {
    console.log(`- [${e.id}] ${e.titulo} (Status: ${e.status})`);
  });

  const usuarios = await prisma.usuario.findMany({
    include: { role: true }
  });
  console.log('\n--- USUÁRIOS E ROLES ---');
  usuarios.forEach(u => {
    console.log(`- ${u.email} | Role: ${u.role?.nome || 'Nenhuma'}`);
  });

  const roles = await prisma.role.findMany({
    include: { permissions: { include: { permission: true } } }
  });
  console.log('\n--- PERMISSÕES POR ROLE ---');
  roles.forEach(r => {
    console.log(`${r.nome}: ${r.permissions.map(p => p.permission.slug).join(', ')}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
