import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      console.log('[Database] Testando conexão nativa...');
      await this.$queryRaw`SELECT 1`;
      console.log('[Database] Conexão nativa estabelecida com sucesso.');
    } catch (error) {
      console.error('[Database] Falha na conexão nativa:', error.message);
      // Não lançar erro para não derrubar o servidor se o banco estiver instável
    }
  }
}
