import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    
    // Log diagnóstico (senha mascarada)
    if (dbUrl) {
      const masked = dbUrl.replace(/:([^:@]+)@/, ':****@');
      console.log(`[Database] Iniciando conexão com: ${masked}`);
    } else {
      console.error('[Database] ERRO: DATABASE_URL não encontrada!');
    }

    const pool = new Pool({ 
      connectionString: dbUrl,
      ssl: dbUrl?.includes('supabase.com') ? { rejectUnauthorized: false } : false
    });
    
    const adapter = new PrismaPg(pool as any);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      // Teste de conexão simples
      await this.$queryRaw`SELECT 1`;
      console.log('[Database] Conexão estabelecida com sucesso.');
    } catch (error) {
      console.error('[Database] Falha na conexão:', error.message);
    }
  }
}
