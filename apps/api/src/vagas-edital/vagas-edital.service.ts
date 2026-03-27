import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassificacaoService } from '../classificacao/classificacao.service';

@Injectable()
export class VagasEditalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classificacaoService: ClassificacaoService,
  ) {}

  async findAllByEdital(editalId: string) {
    return this.prisma.vagaEdital.findMany({
      where: { editalId },
      include: {
        cargo: true,
        carreira: true,
        nivel: true,
        modalidade: true,
        modeloFormulario: true,
      },
      orderBy: [
        { cargo: { nome: 'asc' } },
        { areaAtuacao: { nome: 'asc' } },
      ],
    });
  }

  async create(data: { editalId: string; cargoId: string; areaAtuacaoId?: string; carreiraId?: string; nivelId?: string; modalidadeId?: string; modeloFormularioId?: string; quantidadeVagas: number }) {
    console.log('DEBUG-API: Recebendo dados para VagaEdital:', data);
    
    const uniqueKey = {
      editalId: data.editalId,
      cargoId: data.cargoId,
      areaAtuacaoId: (data.areaAtuacaoId || null) as any,
      carreiraId: (data.carreiraId || null) as any,
      nivelId: (data.nivelId || null) as any,
      modalidadeId: (data.modalidadeId || null) as any,
    };

    try {
      // Tentar encontrar primeiro para evitar problemas de NULL em unique index do Postgres
      const existente = await this.prisma.vagaEdital.findFirst({
        where: uniqueKey
      });

      if (existente) {
        console.log('DEBUG-API: Vaga já existe, atualizando quantidade e formulário:', existente.id);
        return this.prisma.vagaEdital.update({
          where: { id: existente.id },
          data: { 
            quantidadeVagas: data.quantidadeVagas,
            modeloFormularioId: data.modeloFormularioId || null
          }
        });
      }

      const novaVaga = await this.prisma.vagaEdital.create({
        data: {
          ...uniqueKey,
          quantidadeVagas: data.quantidadeVagas,
          modeloFormularioId: data.modeloFormularioId || null,
        },
      });

      // Gatilho de reclassificação
      await this.classificacaoService.reprocessarSituacaoCandidatos(data.editalId);
      
      return novaVaga;
    } catch (error) {
      console.error('DEBUG-API: Erro ao cadastrar vaga:', error);
      throw error;
    }
  }

  async createBulk(data: {
    editalId: string;
    cargoId: string;
    areaAtuacaoId?: string;
    carreiraId: string;
    nivelId: string;
    modeloFormularioId?: string;
    vagas: { modalidadeId: string; quantidadeVagas: number }[];
  }) {
    const results = [];
    
    for (const v of data.vagas) {
      const where: any = {
        editalId: data.editalId,
        cargoId: data.cargoId,
        areaAtuacaoId: data.areaAtuacaoId || null,
        carreiraId: data.carreiraId || null,
        nivelId: data.nivelId || null,
        modalidadeId: v.modalidadeId || null,
      };

      const existente = await this.prisma.vagaEdital.findFirst({
        where
      });

      let result;
      if (existente) {
        result = await this.prisma.vagaEdital.update({
          where: { id: existente.id },
          data: { 
            quantidadeVagas: v.quantidadeVagas,
            modeloFormularioId: data.modeloFormularioId || null
          },
        });
      } else {
        if (v.quantidadeVagas > 0) {
          result = await this.prisma.vagaEdital.create({
            data: {
              ...where,
              quantidadeVagas: v.quantidadeVagas,
              modeloFormularioId: data.modeloFormularioId || null,
            },
          });
        }
      }
      if (result) results.push(result);
    }

    // Gatilho de reclassificação total (uma vez só no final)
    await this.classificacaoService.reprocessarSituacaoCandidatos(data.editalId);

    return results;
  }

  async deleteBulk(editalId: string, ids: string[]) {
    const result = await this.prisma.vagaEdital.deleteMany({
      where: {
        id: { in: ids },
        editalId,
      },
    });

    await this.classificacaoService.reprocessarSituacaoCandidatos(editalId);

    return result;
  }

  async deleteBulkGroups(editalId: string, ids: string[]) {
    // Para cada ID, precisamos encontrar os critérios do grupo e deletar tudo que bater
    const vagas = await this.prisma.vagaEdital.findMany({
      where: { id: { in: ids }, editalId }
    });

    if (vagas.length === 0) return { count: 0 };

    const deletePromises = vagas.map(v => {
      return this.prisma.vagaEdital.deleteMany({
        where: {
          editalId,
          cargoId: v.cargoId,
          areaAtuacaoId: v.areaAtuacaoId || null,
          carreiraId: v.carreiraId || null,
          nivelId: v.nivelId || null,
        }
      });
    });

    const results = await Promise.all(deletePromises);
    const totalCount = results.reduce((acc, curr) => acc + curr.count, 0);

    await this.classificacaoService.reprocessarSituacaoCandidatos(editalId);

    return { count: totalCount };
  }

  async remove(id: string) {
    const vaga = await this.prisma.vagaEdital.findUnique({ where: { id } });
    if (!vaga) return { count: 0 };

    console.log('DEBUG-API: Removendo Grupo de Vagas a partir do ID:', id);
    console.log('DEBUG-API: Filtro Grupo:', { editalId: vaga.editalId, cargoId: vaga.cargoId, areaAtuacaoId: vaga.areaAtuacaoId, carreiraId: vaga.carreiraId, nivelId: vaga.nivelId });
    
    const result = await this.prisma.vagaEdital.deleteMany({
      where: {
        editalId: vaga.editalId,
        cargoId: vaga.cargoId,
        areaAtuacaoId: vaga.areaAtuacaoId || null,
        carreiraId: vaga.carreiraId || null,
        nivelId: vaga.nivelId || null,
      },
    });
    
    console.log('DEBUG-API: Total de itens removidos:', result.count);

    await this.classificacaoService.reprocessarSituacaoCandidatos(vaga.editalId);

    return result;
  }

  async removeByPosition(editalId: string, cargoId: string, areaAtuacaoId?: string, carreiraId?: string, nivelId?: string) {
    const where: any = {
      editalId,
      cargoId,
      areaAtuacaoId: areaAtuacaoId || null,
      carreiraId: carreiraId || null,
      nivelId: nivelId || null,
    };

    const count = await this.prisma.vagaEdital.deleteMany({
      where
    });

    await this.classificacaoService.reprocessarSituacaoCandidatos(editalId);

    return count;
  }

  async findOne(id: string) {
    return this.prisma.vagaEdital.findUnique({
      where: { id },
      include: {
        cargo: true,
        areaAtuacao: true,
        carreira: true,
        nivel: true,
        modalidade: true,
        modeloFormulario: true,
      },
    });
  }

  async update(id: string, data: { cargoId?: string; areaAtuacaoId?: string; carreiraId?: string; nivelId?: string; modalidadeId?: string; modeloFormularioId?: string; quantidadeVagas?: number }) {
    const updateData = { ...data } as any;
    if ('areaAtuacaoId' in data) updateData.areaAtuacaoId = data.areaAtuacaoId || null;
    if ('carreiraId' in data) updateData.carreiraId = data.carreiraId || null;
    if ('nivelId' in data) updateData.nivelId = data.nivelId || null;
    if ('modalidadeId' in data) updateData.modalidadeId = data.modalidadeId || null;
    if ('modeloFormularioId' in data) updateData.modeloFormularioId = data.modeloFormularioId || null;

    const result = await this.prisma.vagaEdital.update({
      where: { id },
      data: updateData,
    });

    await this.classificacaoService.reprocessarSituacaoCandidatos(result.editalId);

    return result;
  }

  async aplicarSugestoes(editalId: string) {
    const analise = await this.classificacaoService.analisarCobertura(editalId);
    const results = [];

    for (const alert of analise) {
      // Para FALTANTE e INSUFICIENTE, queremos que a vaga cubra todos os candidatos detectados
      const result = await this.create({
        editalId,
        cargoId: alert.cargoId!, // Forçar pois candidatos habilitados sempre possuem cargo
        areaAtuacaoId: alert.areaAtuacaoId || undefined,
        modalidadeId: alert.modalidadeId || undefined,
        carreiraId: alert.carreiraId || undefined,
        nivelId: alert.nivelId || undefined,
        quantidadeVagas: alert.candidatosAfetados,
      });
      results.push(result);
    }

    return { total: results.length };
  }
}
