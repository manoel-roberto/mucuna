import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusEdital, StatusConvocacao } from '@prisma/client';

@Injectable()
export class EditaisService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.edital.findMany({
      orderBy: { criadoEm: 'desc' },
      include: {
        _count: {
          select: { classificacoes: true, formularios: true }
        }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.edital.findUnique({
      where: { id },
      include: {
        formularios: {
          include: { modeloFormulario: true }
        }
      }
    });
  }

  async create(data: any) {
    return this.prisma.edital.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        ano: parseInt(data.ano),
        tipo: data.tipo || null,
        status: data.status || StatusEdital.RASCUNHO,
        inicioInscricoes: data.inicioInscricoes ? new Date(data.inicioInscricoes) : null,
        fimInscricoes: data.fimInscricoes ? new Date(data.fimInscricoes) : null,
        prazoEnvioDocumentos: data.prazoEnvioDocumentos ? new Date(data.prazoEnvioDocumentos) : null,
        
        // Controle de Validade
        certameId: data.certameId || null,
        regimeId: data.regimeId || null,
        numProcessoSEI: data.numProcessoSEI || null,
        numCOPE: data.numCOPE || null,
        autorizacaoDOE: data.autorizacaoDOE || null,
        portariaHomologacao: data.portariaHomologacao || null,
        dataDOEHomologacao: data.dataDOEHomologacao ? new Date(data.dataDOEHomologacao) : null,
        dataValidadeOriginal: data.dataValidadeOriginal ? new Date(data.dataValidadeOriginal) : null,
        dataLimiteProrrogacao: data.dataLimiteProrrogacao ? new Date(data.dataLimiteProrrogacao) : null,
        portariaProrrogacao: data.portariaProrrogacao || null,
        dataDOEProrrogacao: data.dataDOEProrrogacao ? new Date(data.dataDOEProrrogacao) : null,
        dataValidadeProrrogada: data.dataValidadeProrrogada ? new Date(data.dataValidadeProrrogada) : null,
        observacaoValidade: data.observacaoValidade || null,
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.edital.update({
      where: { id },
      data: {
        ...data,
        ano: data.ano ? parseInt(data.ano) : undefined,
        inicioInscricoes: data.inicioInscricoes ? new Date(data.inicioInscricoes) : undefined,
        fimInscricoes: data.fimInscricoes ? new Date(data.fimInscricoes) : undefined,
        prazoEnvioDocumentos: data.prazoEnvioDocumentos ? new Date(data.prazoEnvioDocumentos) : undefined,
        
        // Controle de Validade (Updates)
        certameId: data.certameId || undefined,
        regimeId: data.regimeId || undefined,
        dataDOEHomologacao: data.dataDOEHomologacao ? new Date(data.dataDOEHomologacao) : undefined,
        dataValidadeOriginal: data.dataValidadeOriginal ? new Date(data.dataValidadeOriginal) : undefined,
        dataLimiteProrrogacao: data.dataLimiteProrrogacao ? new Date(data.dataLimiteProrrogacao) : undefined,
        dataDOEProrrogacao: data.dataDOEProrrogacao ? new Date(data.dataDOEProrrogacao) : undefined,
        dataValidadeProrrogada: data.dataValidadeProrrogada ? new Date(data.dataValidadeProrrogada) : undefined,
      }
    });
  }

  async remove(id: string) {
    return this.prisma.edital.delete({ where: { id } });
  }

  async findFormularios(editalId: string) {
    return this.prisma.editalFormulario.findMany({
      where: { editalId },
      include: { modeloFormulario: true }
    });
  }

  async findAtivosComConvocacao() {
    return this.prisma.edital.findMany({
      where: {
        status: StatusEdital.ATIVO,
      },
      orderBy: { criadoEm: 'desc' }
    });
  }

  async vincularFormulario(editalId: string, modeloId: string) {
    return this.prisma.editalFormulario.upsert({
      where: {
        editalId_modeloFormularioId: {
          editalId,
          modeloFormularioId: modeloId
        }
      },
      update: {},
      create: {
        editalId,
        modeloFormularioId: modeloId
      }
    });
  }

  async desvincularFormulario(editalId: string, modeloId: string) {
    return this.prisma.editalFormulario.delete({
      where: {
        editalId_modeloFormularioId: {
          editalId,
          modeloFormularioId: modeloId
        }
      }
    });
  }
}
