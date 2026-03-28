import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const url = process.env.DATABASE_URL;
    
    if (!url) {
      console.error('[Database] ERRO CRÍTICO: DATABASE_URL não encontrada no ambiente!');
    } else {
      const host = url.split('@')[1]?.split(':')[0] || 'Desconhecido';
      const port = url.split(':').pop()?.split('/')[0] || '5432';
      console.log(`[Database] Configurando adaptador para Host: ${host} | Porta: ${port}`);
    }

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
    super({ adapter });
  }

  async onModuleInit() {
    const url = process.env.DATABASE_URL || '';
    const maskedUrl = url.replace(/:([^:@]+)@/, ':***@');
    const host = url.split('@')[1]?.split(':')[0] || 'Desconhecido';
    const port = url.split(':').pop()?.split('/')[0] || '5432';

    console.log(`[Database] [V4-DIAGNOSTICO] Iniciando conexão...`);
    console.log(`[Database] [V4-DIAGNOSTICO] Host: ${host}`);
    console.log(`[Database] [V4-DIAGNOSTICO] Porta: ${port}`);
    console.log(`[Database] [V4-DIAGNOSTICO] URL (mask): ${maskedUrl}`);

    try {
      // Teste de conexão simples
      await this.$queryRaw`SELECT 1`;
      console.log('[Database] [V4-DIAGNOSTICO] Sucesso: Conexão estabelecida.');
    } catch (error) {
      console.error('[Database] [V4-DIAGNOSTICO] Falha Fatal na Conexão:', error.message || error);
    }
  }
}
