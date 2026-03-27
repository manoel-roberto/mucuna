import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegimesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const defaults = ['EFETIVO', 'REDA'];
    for (const nome of defaults) {
      await this.prisma.regime.upsert({
        where: { nome },
        update: {},
        create: { nome },
      });
    }
  }

  findAll() {
    return this.prisma.regime.findMany({ orderBy: { nome: 'asc' } });
  }

  create(data: { nome: string }) {
    return this.prisma.regime.create({ data });
  }

  remove(id: string) {
    return this.prisma.regime.delete({ where: { id } });
  }
}
