import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CertamesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const defaults = ['CONCURSO', 'SELEÇÃO'];
    for (const nome of defaults) {
      await this.prisma.certame.upsert({
        where: { nome },
        update: {},
        create: { nome },
      });
    }
  }

  findAll() {
    return this.prisma.certame.findMany({ orderBy: { nome: 'asc' } });
  }

  create(data: { nome: string }) {
    return this.prisma.certame.create({ data });
  }

  remove(id: string) {
    return this.prisma.certame.delete({ where: { id } });
  }
}
