import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusConvocacao, StatusRegistroConvocacao } from '@prisma/client';

@Injectable()
export class ConvocacoesService {
  constructor(private prisma: PrismaService) {}

  async findAllAtivos(editalId: string) {
    return this.prisma.classificacaoCandidato.findMany({
      where: {
        editalId,
        statusConvocacao: {
          in: [
            StatusConvocacao.AGUARDANDO_CONVOCACAO,
            StatusConvocacao.CONVOCADO,
            StatusConvocacao.AGUARDANDO_DOCUMENTACAO,
            StatusConvocacao.DOCUMENTOS_ENVIADOS,
            StatusConvocacao.EM_AVALIACAO,
            StatusConvocacao.DOCUMENTACAO_PENDENTE,
            StatusConvocacao.AGENDAMENTO_APRESENTACAO,
            StatusConvocacao.APROVADO,
            StatusConvocacao.EFETIVADO,
            StatusConvocacao.REPROVADO,
            StatusConvocacao.DESISTENTE,
            StatusConvocacao.PRAZO_EXPIRADO,
            StatusConvocacao.SEM_RESPOSTA,
          ],
        },
      },
      include: {
        cargo: true,
        areaAtuacao: true,
        carreira: true,
        nivel: true,
        modalidade: true,
        modeloFormulario: true,
        envios: {
          include: { arquivos: true },
          orderBy: { enviadoEm: 'desc' },
        },
        registrosConvocacao: {
          orderBy: { criadoEm: 'desc' },
        },
      },
      orderBy: [{ posicaoConvocacao: 'asc' }, { posicaoAmpla: 'asc' }],
    });
  }

  async marcarParaConvocacao(editalId: string, candidatosIds: string[]) {
    const candidatos = await this.prisma.classificacaoCandidato.findMany({
      where: {
        id: { in: candidatosIds },
        editalId,
      },
    });

    for (const c of candidatos) {
      if (c.statusConvocacao !== StatusConvocacao.NAO_CONVOCADO) continue;

      // Buscar vaga correspondente para pegar o formulário padrão
      const vaga = await this.prisma.vagaEdital.findFirst({
        where: {
          editalId,
          cargoId: c.cargoId as string,
          areaAtuacaoId: c.areaAtuacaoId || null,
          carreiraId: c.carreiraId || null,
          nivelId: c.nivelId || null,
          modalidadeId: c.modalidadeId || null,
        },
      });

      await this.prisma.classificacaoCandidato.update({
        where: { id: c.id },
        data: {
          statusConvocacao: StatusConvocacao.AGUARDANDO_CONVOCACAO,
          modeloFormularioId: vaga?.modeloFormularioId || null,
        },
      });
    }

    return {
      message:
        'Candidatos marcados para convocação e formulários sincronizados.',
    };
  }

  async removerDaConvocacao(editalId: string, candidatoId: string) {
    const candidato = await this.prisma.classificacaoCandidato.findUnique({
      where: { id: candidatoId },
    });

    if (!candidato || candidato.editalId !== editalId) {
      throw new BadRequestException(
        'Candidato não encontrado ou não pertence a este edital',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.registroConvocacao.deleteMany({
        where: { classificacaoCandidatoId: candidatoId },
      });

      await tx.classificacaoCandidato.update({
        where: { id: candidatoId },
        data: {
          statusConvocacao: StatusConvocacao.NAO_CONVOCADO,
          posicaoConvocacao: null,
        },
      });
    });

    return { message: 'Candidato removido do controle de convocação' };
  }

  async moverNoKanban(
    candidatoId: string,
    novoStatus: StatusConvocacao,
    usuarioId: string,
    observacao?: string,
    prazo?: Date,
  ) {
    const candidato = await this.prisma.classificacaoCandidato.findUnique({
      where: { id: candidatoId },
    });

    if (!candidato) throw new BadRequestException('Candidato não encontrado');

    if (candidato.statusConvocacao === novoStatus)
      return { message: 'Status inalterado.' };

    // Validar se o candidato possui um formulário antes de ir para fases de documentação
    const statusQueExigemFormulario: StatusConvocacao[] = [
      StatusConvocacao.AGUARDANDO_DOCUMENTACAO,
      StatusConvocacao.DOCUMENTOS_ENVIADOS,
      StatusConvocacao.DOCUMENTACAO_PENDENTE,
      StatusConvocacao.AGENDAMENTO_APRESENTACAO,
      StatusConvocacao.EFETIVADO,
    ];

    if (
      statusQueExigemFormulario.includes(novoStatus) &&
      !candidato.modeloFormularioId
    ) {
      throw new BadRequestException(
        'Não é possível avançar: O candidato não possui um modelo de formulário vinculado.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.registroConvocacao.create({
        data: {
          classificacaoCandidatoId: candidatoId,
          meioUtilizado: 'Sistema (Kanban)',
          prazoDocumentacao: new Date(),
          observacoes:
            observacao ||
            `O(A) candidato(a) foi movido(a) de ${candidato.statusConvocacao} para ${novoStatus}`,
          status: StatusRegistroConvocacao.MUDANCA_FASE,
          criadoPorId: usuarioId,
        },
      });

      await tx.classificacaoCandidato.update({
        where: { id: candidatoId },
        data: {
          statusConvocacao: novoStatus,
          ...(prazo ? { prazoEnvio: prazo } : {}),
        },
      });
    });

    return { message: 'Candidato transacionado no quadro Kanban com sucesso.' };
  }

  async adicionarRegistro(
    candidatoId: string,
    data: {
      meioUtilizado: string;
      prazoDocumentacao: Date;
      observacoes?: string;
    },
    usuarioId: string,
  ) {
    const candidato = await this.prisma.classificacaoCandidato.findUnique({
      where: { id: candidatoId },
    });
    // Removido o bloqueio obrigatório de modeloFormularioId aqui.
    // A validação de formulário deve ocorrer apenas quando o candidato for movido
    // para status que exigem preenchimento (ex: AGUARDANDO_DOCUMENTACAO).

    const [registro] = await this.prisma.$transaction([
      this.prisma.registroConvocacao.create({
        data: {
          classificacaoCandidatoId: candidatoId,
          meioUtilizado: data.meioUtilizado,
          prazoDocumentacao: data.prazoDocumentacao,
          observacoes: data.observacoes,
          criadoPorId: usuarioId,
          status: StatusRegistroConvocacao.AGUARDANDO_RESPOSTA,
        },
      }),
      this.prisma.classificacaoCandidato.update({
        where: { id: candidatoId },
        data: { prazoEnvio: data.prazoDocumentacao },
      }),
    ]);

    await this.sincronizarStatus(candidatoId);
    return registro;
  }

  async atualizarStatusRegistro(
    registroId: string,
    novoStatus: StatusRegistroConvocacao,
  ) {
    const registro = await this.prisma.registroConvocacao.update({
      where: { id: registroId },
      data: { status: novoStatus },
    });

    await this.sincronizarStatus(registro.classificacaoCandidatoId);
    return registro;
  }

  private async sincronizarStatus(candidatoId: string) {
    const candidato = await this.prisma.classificacaoCandidato.findUnique({
      where: { id: candidatoId },
      include: {
        registrosConvocacao: {
          orderBy: { criadoEm: 'desc' },
          take: 1,
        },
      },
    });

    if (!candidato) return;

    let novoStatusPrincipal = candidato.statusConvocacao;

    if (candidato.registrosConvocacao.length > 0) {
      const registroRecente = candidato.registrosConvocacao[0];
      switch (registroRecente.status) {
        case StatusRegistroConvocacao.AGUARDANDO_RESPOSTA:
          // Move para CONVOCACAO_ENVIADA se for o primeiro contato
          if (candidato.statusConvocacao === StatusConvocacao.AGUARDANDO_CONVOCACAO) {
            novoStatusPrincipal = StatusConvocacao.CONVOCACAO_ENVIADA;
          } else if (candidato.statusConvocacao === StatusConvocacao.CONVOCADO) {
            novoStatusPrincipal = StatusConvocacao.AGUARDANDO_DOCUMENTACAO;
          }
          break;
        case StatusRegistroConvocacao.DOCUMENTACAO_RECEBIDA:
          novoStatusPrincipal = StatusConvocacao.DOCUMENTOS_ENVIADOS;
          break;
        case StatusRegistroConvocacao.PRAZO_EXPIRADO:
          novoStatusPrincipal = StatusConvocacao.PRAZO_EXPIRADO;
          break;
        case StatusRegistroConvocacao.DESISTENCIA:
          novoStatusPrincipal = StatusConvocacao.DESISTENTE;
          break;
        case StatusRegistroConvocacao.SEM_RESPOSTA:
          novoStatusPrincipal = StatusConvocacao.SEM_RESPOSTA;
          break;
      }
    }

    if (novoStatusPrincipal !== candidato.statusConvocacao) {
      await this.prisma.classificacaoCandidato.update({
        where: { id: candidatoId },
        data: { statusConvocacao: novoStatusPrincipal },
      });
    }
  }

  async vincularModeloFormulario(
    candidatoId: string,
    modeloFormularioId: string,
  ) {
    return this.prisma.classificacaoCandidato.update({
      where: { id: candidatoId },
      data: { modeloFormularioId },
    });
  }
}
