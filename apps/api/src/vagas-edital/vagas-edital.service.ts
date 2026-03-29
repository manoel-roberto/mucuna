import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassificacaoService } from '../classificacao/classificacao.service';
import { ConfiguracaoService } from '../configuracao/configuracao.service';

@Injectable()
export class VagasEditalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classificacaoService: ClassificacaoService,
    private readonly configuracaoService: ConfiguracaoService,
  ) {}

  /**
   * Função centralizada de arredondamento legislativo (UEFS)
   */
  calcularVagasCota(
    total: number,
    percentual: number,
    tipo: 'negro' | 'pcd',
  ): number {
    if (total === 0) return 0;
    const resultado = total * (percentual / 100);
    const inteiro = Math.floor(resultado);
    const fracao = resultado - inteiro;

    let final = fracao >= 0.5 ? Math.ceil(resultado) : Math.floor(resultado);

    // Regra de Mínimo Obrigatório
    if (tipo === 'negro' && total >= 5 && final < 1) final = 1;
    if (tipo === 'pcd' && total >= 20 && final < 1) final = 1;

    return final;
  }

  async findAllByEdital(editalId: string) {
    return this.prisma.vagaEdital.findMany({
      where: { editalId },
      include: {
        cargo: true,
        carreira: true,
        nivel: true,
        areaAtuacao: true,
        modeloFormulario: true,
        logs: {
          include: { usuario: true },
          orderBy: { data: 'desc' },
        },
      },
      orderBy: [{ cargo: { nome: 'asc' } }, { areaAtuacao: { nome: 'asc' } }],
    });
  }

  async upsertPosition(data: any) {
    const {
      editalId,
      cargoId,
      areaAtuacaoId,
      carreiraId,
      nivelId,
      totalGeral,
      vagasNEG,
      vagasPCD,
      justificativa,
      usuarioId,
      modeloFormularioId,
    } = data;

    const numTotal = Number(totalGeral) || 0;
    const numNeg = Number(vagasNEG) || 0;
    const numPcd = Number(vagasPCD) || 0;

    const configGlobal = await this.configuracaoService.get();
    const edital = await this.prisma.edital.findUnique({
      where: { id: editalId },
    });
    
    const pNegro = edital?.percentualNegros ?? configGlobal?.percentualNegrosPadrao ?? 20;
    const pPcd = edital?.percentualPCD ?? configGlobal?.percentualPCDPadrao ?? 5;

    const vNegEsp = this.calcularVagasCota(numTotal, pNegro, 'negro');
    const vPcdEsp = this.calcularVagasCota(numTotal, pPcd, 'pcd');
    const vAC = numTotal - numNeg - numPcd;

    console.log(`[UPSERT_VAGA] Edital: ${editalId}, Cargo: ${cargoId}, Total: ${numTotal}, AC/NEG/PCD: ${vAC}/${numNeg}/${numPcd}`);

    const record = await this.prisma.vagaEdital.upsert({
      where: {
        editalId_cargoId_areaAtuacaoId_carreiraId_nivelId: {
          editalId,
          cargoId,
          areaAtuacaoId: areaAtuacaoId || null,
          carreiraId: carreiraId || null,
          nivelId: nivelId || null,
        },
      },
      update: {
        vagasAC: vAC,
        vagasNEG: numNeg,
        vagasPCD: numPcd,
        totalGeral: numTotal,
        vagasNEGEsperadas: vNegEsp,
        vagasPCDEsperadas: vPcdEsp,
        modeloFormularioId: modeloFormularioId || null,
        quantidadeVagas: numTotal,
      },
      create: {
        editalId,
        cargoId,
        areaAtuacaoId: areaAtuacaoId || null,
        carreiraId: carreiraId || null,
        nivelId: nivelId || null,
        vagasAC: vAC,
        vagasNEG: numNeg,
        vagasPCD: numPcd,
        totalGeral: numTotal,
        vagasNEGEsperadas: vNegEsp,
        vagasPCDEsperadas: vPcdEsp,
        modeloFormularioId: modeloFormularioId || null,
        quantidadeVagas: numTotal,
      },
    });

    if (justificativa && usuarioId) {
      await this.prisma.vagaEditalLog.create({
        data: {
          vagaEditalId: record.id,
          usuarioId,
          justificativa,
          detalhes: JSON.stringify({
            totalGeral,
            vagasNEG,
            vagasPCD,
            esperadoNEG: vNegEsp,
            esperadoPCD: vPcdEsp,
          }),
        },
      });
    }

    await this.classificacaoService.reprocessarSituacaoCandidatos(editalId);
    return record;
  }

  async findOne(id: string) {
    return this.prisma.vagaEdital.findUnique({
      where: { id },
      include: {
        cargo: true,
        areaAtuacao: true,
        carreira: true,
        nivel: true,
        modeloFormulario: true,
      },
    });
  }

  async update(id: string, data: any) {
    const { justificativa, usuarioId, ...rest } = data;
    const exist = await this.prisma.vagaEdital.findUnique({ where: { id } });
    if (!exist) throw new Error('Vaga não encontrada');

    return this.upsertPosition({
      ...exist,
      ...rest,
      justificativa,
      usuarioId,
    });
  }

  async remove(id: string) {
    const result = await this.prisma.vagaEdital.delete({
      where: { id }
    });
    
    await this.classificacaoService.reprocessarSituacaoCandidatos(result.editalId);
    return result;
  }

  async deleteBulk(editalId: string, ids: string[]) {
    const result = await this.prisma.vagaEdital.deleteMany({
      where: { id: { in: ids }, editalId },
    });
    
    await this.classificacaoService.reprocessarSituacaoCandidatos(editalId);
    return result;
  }

  async deleteBulkGroups(editalId: string, ids: string[]) {
    return this.deleteBulk(editalId, ids);
  }

  async aplicarSugestoes(editalId: string) {
    const analise = await this.classificacaoService.analisarCobertura(editalId);
    const edital = await this.prisma.edital.findUnique({ where: { id: editalId } });
    const config = await this.configuracaoService.get();
    
    const pN = edital?.percentualNegros ?? config?.percentualNegrosPadrao ?? 10;
    const pP = edital?.percentualPCD ?? config?.percentualPCDPadrao ?? 6;

    const posicoes: Record<string, any> = {};

    for (const alert of analise) {
      const key = `${alert.cargoId}-${alert.areaAtuacaoId || 'null'}-${alert.carreiraId || 'null'}-${alert.nivelId || 'null'}`;
      if (!posicoes[key]) {
        posicoes[key] = {
          cargoId: alert.cargoId,
          areaAtuacaoId: alert.areaAtuacaoId || undefined,
          carreiraId: alert.carreiraId || undefined,
          nivelId: alert.nivelId || undefined,
          totalCandidatos: 0,
          vagasAC: 0,
          vagasNEG: 0,
          vagasPCD: 0,
        };
      }

      const p = posicoes[key];
      // O total de candidatos únicos é o máximo encontrado em qualquer modalidade (geralmente Ampla)
      p.totalCandidatos = Math.max(p.totalCandidatos, alert.candidatosAfetados);
    }

    const results = [];
    for (const key in posicoes) {
      const p = posicoes[key];
      const total = p.totalCandidatos;
      
      // Calcular cotas ideais baseado no total de candidatos
      const vNeg = this.calcularVagasCota(total, pN, 'negro');
      const vPcd = this.calcularVagasCota(total, pP, 'pcd');
      
      const res = await this.upsertPosition({
        editalId,
        cargoId: p.cargoId,
        areaAtuacaoId: p.areaAtuacaoId,
        carreiraId: p.carreiraId,
        nivelId: p.nivelId,
        totalGeral: total,
        vagasNEG: vNeg,
        vagasPCD: vPcd,
        justificativa: 'Aplicação automática via diagnóstico de cobertura.',
      });
      results.push(res);
    }

    await this.classificacaoService.reprocessarSituacaoCandidatos(editalId);
    return { total: results.length };
  }
}
