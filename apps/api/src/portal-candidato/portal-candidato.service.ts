import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortalCandidatoService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(cpf: string, numeroInscricao: string) {
    const classificacao = await this.prisma.classificacaoCandidato.findFirst({
      where: {
        cpfCandidato: cpf.replace(/\D/g, ''),
        numeroInscricao,
      },
      include: {
        edital: {
          include: {
            formularios: {
              include: {
                modeloFormulario: true,
              },
            },
          },
        },
        cargo: true,
        areaAtuacao: true,
        modalidade: true,
        modeloFormulario: true,
        envios: {
          include: { arquivos: true },
          orderBy: { enviadoEm: 'desc' },
        },
      },
    });

    if (!classificacao) {
      throw new NotFoundException(
        'Candidato não encontrado para os dados informados.',
      );
    }

    return {
      candidato: {
        id: classificacao.id,
        nome: classificacao.nomeCandidato,
        cpf: classificacao.cpfCandidato,
        inscricao: classificacao.numeroInscricao,
        nota: classificacao.nota,
        posicaoAmpla: classificacao.posicaoAmpla,
        posicaoNegro: classificacao.posicaoNegro,
        posicaoPCD: classificacao.posicaoPCD,
        posicaoConvocacao: classificacao.posicaoConvocacao,
        statusConvocacao: classificacao.statusConvocacao,
        situacao: classificacao.situacao,
      },
      edital: {
        id: classificacao.edital.id,
        titulo: classificacao.edital.titulo,
        formulariosExigidos: classificacao.edital.formularios.map((f) => ({
          id: f.modeloFormulario.id,
          nome: f.modeloFormulario.nome,
          descricao: f.modeloFormulario.descricao,
          esquema: f.modeloFormulario.esquemaJSON,
          obrigatorio: f.obrigatorio,
          jaEnviado: classificacao.envios.some(
            (e) => e.modeloFormularioId === f.modeloFormulario.id,
          ),
          envio: classificacao.envios.find(
            (e) => e.modeloFormularioId === f.modeloFormulario.id,
          ),
        })),
      },
    };
  }

  async enviarDocumentos(
    classificacaoId: string,
    modeloId: string,
    respostas: any,
    arquivos: any[],
  ) {
    // 1. Busca o envio se já existir
    const existente = await this.prisma.envio.findFirst({
      where: {
        classificacaoCandidatoId: classificacaoId,
        modeloFormularioId: modeloId,
      },
    });

    if (existente?.finalizado && existente.statusAvaliacao !== 'REJEITADO') {
      throw new Error(
        'Este formulário já foi finalizado e não pode mais ser editado.',
      );
    }

    // 2. Usar Transação para Upsert Manual
    return this.prisma.$transaction(async (tx) => {
      if (existente) {
        // Se houver novos arquivos, deletamos os antigos dos mesmos campos antes de criar novos
        if (arquivos.length > 0) {
          const novosCamposComArquivo = arquivos.map(
            (a) => a.originalname.split('.')[0],
          );
          await tx.arquivoUpload.deleteMany({
            where: {
              envioId: existente.id,
              campoChave: { in: novosCamposComArquivo },
            },
          });
        }

        return tx.envio.update({
          where: { id: existente.id },
          data: {
            respostasJSON: respostas,
            finalizado: false,
            statusAvaliacao: 'PENDENTE',
            arquivos: {
              create: arquivos.map((a) => ({
                campoChave: a.originalname.split('.')[0],
                nomeOriginal: a.originalname,
                caminhoArmazenamento: a.path,
                tamanhoBytes: a.size,
                tipoMime: a.mimetype,
              })),
            },
          },
        });
      }

      // Criar Novo (Rascunho)
      return tx.envio.create({
        data: {
          classificacaoCandidatoId: classificacaoId,
          modeloFormularioId: modeloId,
          respostasJSON: respostas,
          statusAvaliacao: 'PENDENTE',
          finalizado: false,
          arquivos: {
            create: arquivos.map((a) => ({
              campoChave: a.originalname.split('.')[0],
              nomeOriginal: a.originalname,
              caminhoArmazenamento: a.path,
              tamanhoBytes: a.size,
              tipoMime: a.mimetype,
            })),
          },
        },
      });
    });
  }

  async finalizarEnvio(envioId: string, usuarioId: string) {
    const envio = await this.prisma.envio.findUnique({
      where: { id: envioId },
    });

    if (!envio) throw new Error('Envio não encontrado');

    return this.prisma.$transaction(async (tx) => {
      const updatedEnvio = await tx.envio.update({
        where: { id: envioId },
        data: { finalizado: true },
      });

      await tx.classificacaoCandidato.update({
        where: { id: envio.classificacaoCandidatoId },
        data: { statusConvocacao: 'DOCUMENTOS_ENVIADOS' },
      });

      await tx.registroConvocacao.create({
        data: {
          classificacaoCandidatoId: envio.classificacaoCandidatoId,
          meioUtilizado: 'Portal do Candidato',
          prazoDocumentacao: new Date(),
          observacoes:
            'Documentação finalizada e enviada pelo candidato via portal.',
          status: 'MUDANCA_FASE',
          criadoPorId: usuarioId,
        },
      });

      return updatedEnvio;
    });
  }
}
