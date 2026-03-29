import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConvocacaoService {
  private readonly logger = new Logger(ConvocacaoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gera a fila de convocação intercalada para todos os cargos de um edital.
   */
  async gerarFilaConvocacao(editalId: string) {
    this.logger.log(
      `Gerando fila de convocação global para edital: ${editalId}`,
    );

    const edital = await this.prisma.edital.findUnique({
      where: { id: editalId },
    });

    if (!edital) throw new Error('Edital não encontrado');

    const percNegros = (edital as any).percentualNegros || 20;
    const percPCD = (edital as any).percentualPCD || 5;

    // 1. Buscar sumário de vagas para saber o limite de aprovados
    const configuracoesVagas = await this.prisma.vagaEdital.findMany({
      where: { editalId },
    });
    const totalVagasDisponiveis = configuracoesVagas.reduce(
      (acc, v) => acc + v.quantidadeVagas,
      0,
    );

    // 2. Buscar TODOS os candidatos do edital
    const candidatos = await this.prisma.classificacaoCandidato.findMany({
      where: { editalId },
    });

    if (candidatos.length === 0) return { success: true, count: 0 };

    // 3. Criar filas por modalidade (Ordenadas pelas posições específicas)
    const filaAC = candidatos
      .filter((c) => (c as any).concorrenciaAmpla)
      .sort((a, b) => (a.posicaoAmpla || 999) - (b.posicaoAmpla || 999));

    const filaNegro = candidatos
      .filter((c) => (c as any).concorrenciaNegro)
      .sort((a, b) => (a.posicaoNegro || 999) - (b.posicaoNegro || 999));

    const filaPCD = candidatos
      .filter((c) => (c as any).concorrenciaPCD)
      .sort((a, b) => (a.posicaoPCD || 999) - (b.posicaoPCD || 999));

    let indexAC = 0;
    let indexNegro = 0;
    let indexPCD = 0;

    const candidatosConvocados: any[] = [];
    const totalAProcessar = candidatos.length;

    // 4. Intercalar as filas
    for (let n = 1; n <= totalAProcessar; n++) {
      let escolhido = null;

      // Cálculo de reserva baseado nos percentuais
      const stepNegro = Math.floor(100 / percNegros);
      const stepPCD = Math.floor(100 / percPCD);

      const isReservaNegro = n % stepNegro === 0;
      const isReservaPCD = n % stepPCD === 0;

      // Prioridade: PCD > Negro > AC
      if (isReservaPCD && indexPCD < filaPCD.length) {
        escolhido = filaPCD[indexPCD++];
      } else if (isReservaNegro && indexNegro < filaNegro.length) {
        escolhido = filaNegro[indexNegro++];
      } else if (indexAC < filaAC.length) {
        escolhido = filaAC[indexAC++];
      } else {
        // Fallback: se a fila preferencial acabou, pega o próximo disponível de qualquer uma
        if (indexAC < filaAC.length) {
          escolhido = filaAC[indexAC++];
        } else if (indexNegro < filaNegro.length) {
          escolhido = filaNegro[indexNegro++];
        } else if (indexPCD < filaPCD.length) {
          escolhido = filaPCD[indexPCD++];
        }
      }

      if (escolhido) {
        candidatosConvocados.push({
          id: escolhido.id,
          posicaoConvocacao: n,
          situacao:
            n <= totalVagasDisponiveis
              ? 'APROVADO_CONVOCAVEL'
              : 'CADASTRO_RESERVA',
        });
      }
    }

    // 5. Atualizar no banco em lote
    await this.prisma.$transaction(
      candidatosConvocados.map((c) =>
        this.prisma.classificacaoCandidato.update({
          where: { id: c.id },
          data: {
            posicaoConvocacao: c.posicaoConvocacao,
            situacao: c.situacao,
          } as any,
        }),
      ),
    );

    return { success: true, count: candidatosConvocados.length };
  }
}
