import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
    const url = process.env.DATABASE_URL;

    const pool = new pg.Pool({
      connectionString: url,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('[Database] Erro inesperado no Pool de Conexão:', err.message);
    });

    const adapter = new PrismaPg(pool);
    // @ts-ignore
    this.$adapter = adapter;
  }

  async onModuleInit() {
    try {
      await this.$queryRaw`SELECT 1`;
      console.log('[Database] Conexão via adaptador estabelecida com sucesso.');
    } catch (error) {
      console.error('[Database] Falha crítica na conexão com o banco:', error.message || error);
    }
  }
}
