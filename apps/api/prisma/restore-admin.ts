import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@uefs.br';
  const password = process.env.ADMIN_PASSWORD || 'SenhaForte123!';
  const cpf = (process.env.ADMIN_CPF || '00000000000').replace(/\D/g, '');
  const nome = process.env.ADMIN_NAME || 'Administrador UEFS';

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Verificando/Criando usuário admin: ${email}...`);

  const admin = await prisma.usuario.upsert({
    where: { email },
    update: {
      senhaHash: hashedPassword,
      perfil: 'ADMINISTRADOR',
      cpf: cpf,
      nome: nome
    },
    create: {
      nome: nome,
      email,
      cpf: cpf,
      senhaHash: hashedPassword,
      perfil: 'ADMINISTRADOR',
    },
  });

  console.log('✅ Usuário administrador restaurado com sucesso:', admin.email);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao restaurar admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
