import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModalidadesConcorrenciaService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const defaultTypes = [
      { nome: 'Ampla Concorrência', descricao: 'Vagas destinadas à concorrência geral.' },
      { nome: 'Vagas reservadas para Negros', descricao: 'Vagas destinadas a candidatos que se autodeclaram negros.' },
      { nome: 'Vagas reservadas para Pessoa com Deficiência', descricao: 'Vagas destinadas a candidatos com deficiência (PcD).' },
    ];

    for (const type of defaultTypes) {
      await this.prisma.modalidadeConcorrencia.upsert({
        where: { nome: type.nome },
        update: {},
        create: type,
      });
    }
  }

  findAll() {
    return this.prisma.modalidadeConcorrencia.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.modalidadeConcorrencia.findUnique({
      where: { id },
    });
  }

  create(data: { nome: string; descricao?: string }) {
    return this.prisma.modalidadeConcorrencia.create({
      data,
    });
  }

  update(id: string, data: { nome?: string; descricao?: string }) {
    return this.prisma.modalidadeConcorrencia.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.modalidadeConcorrencia.delete({
      where: { id },
    });
  }

  async findByNome(nome: string) {
    return this.prisma.modalidadeConcorrencia.findFirst({
      where: {
        nome: {
          contains: nome,
          mode: 'insensitive',
        },
      },
    });
  }
}
