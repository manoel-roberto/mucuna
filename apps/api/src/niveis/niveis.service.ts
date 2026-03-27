import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NiveisService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const defaults = ['MÉDIO', 'SUPERIOR', 'MÉDIO / SUPERIOR'];
    for (const nome of defaults) {
      await this.prisma.nivel.upsert({
        where: { nome },
        update: {},
        create: { nome },
      });
    }
  }

  findAll() {
    return this.prisma.nivel.findMany({ orderBy: { nome: 'asc' } });
  }

  create(data: { nome: string }) {
    return this.prisma.nivel.create({ data });
  }

  update(id: string, data: { nome: string }) {
    return this.prisma.nivel.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.nivel.delete({ where: { id } });
  }
}
