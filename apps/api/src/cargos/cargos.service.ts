import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CargosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.cargo.findMany({
      include: {
        _count: {
          select: { areas: true }
        }
      },
      orderBy: { nome: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.cargo.findUnique({
      where: { id },
      include: {
        _count: {
          select: { areas: true }
        }
      },
    });
  }

  create(data: { nome: string; descricao?: string }) {
    return this.prisma.cargo.create({ data });
  }

  update(id: string, data: { nome?: string; descricao?: string }) {
    return this.prisma.cargo.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.cargo.delete({ where: { id } });
  }

  removeBulk(ids: string[]) {
    return this.prisma.cargo.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async importarLote(items: { cargoNome: string; areaNome: string; carreiraNome?: string; nivelNome?: string }[]) {
    const results = [];
    try {
      for (const item of items) {
        const nomeCargo = item.cargoNome.trim();
        const nomeArea = item.areaNome.trim();

        const cargo = await this.prisma.cargo.upsert({
          where: { nome: nomeCargo },
          update: {},
          create: { nome: nomeCargo },
        });

        // 1. Upsert Carreira if provided
        if (item.carreiraNome) {
          const nomeCarreira = item.carreiraNome.trim();
          await this.prisma.carreira.upsert({
            where: { nome: nomeCarreira },
            update: {},
            create: { nome: nomeCarreira },
          });
        }

        // 2. Upsert Nivel if provided
        if (item.nivelNome) {
          const nomeNivel = item.nivelNome.trim();
          await this.prisma.nivel.upsert({
            where: { nome: nomeNivel },
            update: {},
            create: { nome: nomeNivel },
          });
        }

        await this.prisma.areaAtuacao.upsert({
          where: {
            nome_cargoId: {
              nome: nomeArea,
              cargoId: cargo.id,
            },
          },
          update: {},
          create: {
            nome: nomeArea,
            cargoId: cargo.id,
          },
        });

        results.push(item);
      }
      return { total: results.length };
    } catch (error) {
      console.error('Erro na importação em lote:', error);
      throw error;
    }
  }
}
