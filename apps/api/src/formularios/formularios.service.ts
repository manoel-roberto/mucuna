import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FormulariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.modeloFormulario.findMany({
      include: { criadoPor: { select: { nome: true } } },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.modeloFormulario.findUnique({
      where: { id },
      include: { 
        editais: { include: { edital: true } }
      }
    });
  }

  async create(data: any, usuarioId: string) {
    return this.prisma.modeloFormulario.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        esquemaJSON: data.esquemaJSON,
        criadoPor: { connect: { id: usuarioId } }
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.modeloFormulario.update({
      where: { id },
      data: {
        nome: data.nome,
        descricao: data.descricao,
        esquemaJSON: data.esquemaJSON
      }
    });
  }

  async vincularAoEdital(editalId: string, modeloId: string, obrigatorio: boolean = true) {
    return this.prisma.editalFormulario.upsert({
      where: { 
        editalId_modeloFormularioId: { editalId, modeloFormularioId: modeloId }
      },
      create: {
        editalId,
        modeloFormularioId: modeloId,
        obrigatorio
      },
      update: { obrigatorio }
    });
  }
  
  async listByEdital(editalId: string) {
    return this.prisma.editalFormulario.findMany({
      where: { editalId },
      include: { modeloFormulario: true }
    });
  }

  async remove(id: string) {
    return this.prisma.modeloFormulario.delete({ where: { id } });
  }
}
