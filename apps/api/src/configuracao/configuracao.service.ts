import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfiguracaoService implements OnModuleInit {
  private readonly singletonId = 'singleton';

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Inicializa a configuração se não existir
    const count = await this.prisma.configuracaoSistema.count();
    if (count === 0) {
      await this.prisma.configuracaoSistema.create({
        data: {
          id: this.singletonId,
          percentualNegrosPadrao: 20,
          percentualPCDPadrao: 5,
          baseLegalTexto: `CONFORMIDADE LEGISLATIVA:
SISTEMA DE COTAS E RESERVA DE VAGAS

1. NEGROS (20%): Conforme Lei Estadual nº 13.182 de 2014.
A reserva de 20% das vagas é obrigatória para certames com 5 ou mais vagas totais.
Arredondamento: Frações iguais ou superiores a 0,5 devem ser arredondadas para cima.

2. PESSOAS COM DEFICIÊNCIA (5%): Conforme Decreto Estadual nº 15.353 de 2014.
A reserva de 5% das vagas é obrigatória para certames com 20 ou mais vagas totais.
Arredondamento: Frações iguais ou superiores a 0,5 devem ser arredondadas para cima.`,
        },
      });
      console.log('DEBUG-API: Configuração global inicializada com sucesso.');
    }
  }

  async get() {
    return this.prisma.configuracaoSistema.findUnique({
      where: { id: this.singletonId },
    });
  }

  async update(data: any) {
    const { id, atualizadoEm, ...updateData } = data;
    return this.prisma.configuracaoSistema.upsert({
      where: { id: this.singletonId },
      update: updateData,
      create: {
        id: this.singletonId,
        percentualNegrosPadrao: data.percentualNegrosPadrao ?? 20,
        percentualPCDPadrao: data.percentualPCDPadrao ?? 5,
        baseLegalTexto: data.baseLegalTexto ?? '',
      },
    });
  }
}
