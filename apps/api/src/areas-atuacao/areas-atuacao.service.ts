import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AreasAtuacaoService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(cargoId?: string) {
    return this.prisma.areaAtuacao.findMany({
      where: cargoId ? { cargoId } : {},
      include: { cargo: { select: { nome: true } } },
      orderBy: { nome: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.areaAtuacao.findUnique({
      where: { id },
      include: { cargo: true },
    });
  }

  create(data: { nome: string; cargoId: string }) {
    return this.prisma.areaAtuacao.create({ data });
  }

  update(id: string, data: { nome?: string; cargoId?: string }) {
    return this.prisma.areaAtuacao.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.areaAtuacao.delete({ where: { id } });
  }

  removeBulk(ids: string[]) {
    return this.prisma.areaAtuacao.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
