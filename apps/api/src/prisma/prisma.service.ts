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
    console.log('[Database] [V3-DIAGNOSTICO] Testando conexão via adaptador...');
    try {
      // Teste de conexão simples
      await this.$queryRaw`SELECT 1`;
      console.log('[Database] [V3-DIAGNOSTICO] Conexão via adaptador estabelecida com sucesso.');
    } catch (error) {
      console.error('[Database] [V3-DIAGNOSTICO] Falha na conexão via adaptador (SSL/Pool):', error.message || error);
      // Não lançamos erro aqui para não travar o boot se o banco estiver instável, 
      // mas logamos tudo para diagnóstico
    }
  }
}
