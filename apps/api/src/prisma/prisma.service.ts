import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      // Pgbouncer configuration
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      console.log('[Database] Testando conexão via adaptador...');
      await this.$queryRaw`SELECT 1`;
      console.log('[Database] Conexão via adaptador estabelecida com sucesso.');
    } catch (error) {
      console.error('[Database] Falha na conexão via adaptador (SSL/Pool):', error.message);
    }
  }
}
