import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@uefs.br';
  const password = 'SenhaForte123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Verificando/Criando usuário admin: ${email}...`);

  const admin = await prisma.usuario.upsert({
    where: { email },
    update: {
      senhaHash: hashedPassword,
      perfil: 'ADMINISTRADOR',
    },
    create: {
      nome: 'Administrador UEFS',
      email,
      cpf: '000.000.000-00',
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
