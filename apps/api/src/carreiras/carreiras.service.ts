import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CarreirasService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const defaults = ['MAGISTÉRIO', 'TÉCNICA'];
    for (const nome of defaults) {
      await this.prisma.carreira.upsert({
        where: { nome },
        update: {},
        create: { nome },
      });
    }
  }

  findAll() {
    return this.prisma.carreira.findMany({ orderBy: { nome: 'asc' } });
  }

  create(data: { nome: string }) {
    return this.prisma.carreira.create({ data });
  }

  update(id: string, data: { nome: string }) {
    return this.prisma.carreira.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.carreira.delete({ where: { id } });
  }
}
