import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassificacaoService } from '../classificacao/classificacao.service';
import { ConfiguracaoService } from '../configuracao/configuracao.service';
import { calcCota } from '../shared/utils/calcCota';

@Injectable()
export class VagasEditalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classificacaoService: ClassificacaoService,
    private readonly configuracaoService: ConfiguracaoService,
  ) {}

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
      vagasImediatas,
      vagasReserva,
      justificativa,
      usuarioId,
      modeloFormularioId,
    } = data;

    const vImed = Number(vagasImediatas) || 0;
    const vRes = Number(vagasReserva) || 0;
    const numTotal = vImed + vRes;

    if (numTotal <= 0) {
      throw new BadRequestException('O total de vagas deve ser maior que zero.');
    }

    const configGlobal = await this.configuracaoService.get();
    const edital = await this.prisma.edital.findUnique({
      where: { id: editalId },
    });
    
    const pNegro = edital?.percentualNegros ?? configGlobal?.percentualNegrosPadrao ?? 20;
    const pPcd = edital?.percentualPCD ?? configGlobal?.percentualPCDPadrao ?? 5;

    // Cálculo das subdivisões por modalidade no BACKEND
    // Aplicamos a cota sobre o subtotal de imediatas e sobre o subtotal de reserva
    const vNEGImed = calcCota(vImed, pNegro, 'negro');
    const vPCDImed = calcCota(vImed, pPcd, 'pcd');
    const vACImed  = Math.max(0, vImed - vNEGImed - vPCDImed);

    const vNEGRes = calcCota(vRes, pNegro, 'negro');
    const vPCDRes = calcCota(vRes, pPcd, 'pcd');
    const vACRes  = Math.max(0, vRes - vNEGRes - vPCDRes);

    const totalACCalculado = vACImed + vACRes;
    const totalNEGCalculado = vNEGImed + vNEGRes;
    const totalPCDCalculado = vPCDImed + vPCDRes;

    // Totais esperados baseados no volume total (para conferência estatística)
    const vNegEsp = calcCota(numTotal, pNegro, 'negro');
    const vPcdEsp = calcCota(numTotal, pPcd, 'pcd');

    console.log(`[UPSERT_VAGA] Edital: ${editalId}, Cargo: ${cargoId}, Total: ${numTotal}, Imed: ${vImed}, Res: ${vRes}`);

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
        vagasAC: totalACCalculado,
        vagasNEG: totalNEGCalculado,
        vagasPCD: totalPCDCalculado,
        vagasACImediatas: vACImed,
        vagasACReserva: vACRes,
        vagasNEGImediatas: vNEGImed,
        vagasNEGReserva: vNEGRes,
        vagasPCDImediatas: vPCDImed,
        vagasPCDReserva: vPCDRes,
        totalACCalculado,
        totalNEGCalculado,
        totalPCDCalculado,
        totalGeral: numTotal,
        vagasNEGEsperadas: vNegEsp,
        vagasPCDEsperadas: vPcdEsp,
        vagasImediatas: vImed,
        vagasReserva: vRes,
        modeloFormularioId: modeloFormularioId || null,
        quantidadeVagas: numTotal,
      },
      create: {
        editalId,
        cargoId,
        areaAtuacaoId: areaAtuacaoId || null,
        carreiraId: carreiraId || null,
        nivelId: nivelId || null,
        vagasAC: totalACCalculado,
        vagasNEG: totalNEGCalculado,
        vagasPCD: totalPCDCalculado,
        vagasACImediatas: vACImed,
        vagasACReserva: vACRes,
        vagasNEGImediatas: vNEGImed,
        vagasNEGReserva: vNEGRes,
        vagasPCDImediatas: vPCDImed,
        vagasPCDReserva: vPCDRes,
        totalACCalculado,
        totalNEGCalculado,
        totalPCDCalculado,
        totalGeral: numTotal,
        vagasNEGEsperadas: vNegEsp,
        vagasPCDEsperadas: vPcdEsp,
        vagasImediatas: vImed,
        vagasReserva: vRes,
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
            totalGeral: numTotal,
            vagasImediatas: vImed,
            vagasReserva: vRes,
            ac: totalACCalculado,
            neg: totalNEGCalculado,
            pcd: totalPCDCalculado,
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
    
    const results = [];
    for (const item of analise) {
      if (item.sugestao) {
        const res = await this.upsertPosition({
          editalId,
          cargoId: item.cargoId,
          areaAtuacaoId: item.areaAtuacaoId || undefined,
          carreiraId: item.carreiraId || undefined,
          nivelId: item.nivelId || undefined,
          vagasImediatas: item.sugestao.vagasImediatas,
          vagasReserva: item.sugestao.vagasReserva,
          justificativa: 'Aplicação automática via diagnóstico de cobertura.',
        });
        results.push(res);
      }
    }

    await this.classificacaoService.reprocessarSituacaoCandidatos(editalId);
    return { total: results.length };
  }
}
