import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TipoEditalService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tipoEdital.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async create(data: { nome: string }) {
    return this.prisma.tipoEdital.create({
      data: { nome: data.nome },
    });
  }

  async update(id: string, data: { nome: string }) {
    return this.prisma.tipoEdital.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.tipoEdital.delete({ where: { id } });
  }
}
