import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnviosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { classificacaoId: string; modeloId: string; respostasJSON: any }) {
    return this.prisma.envio.create({
      data: {
        classificacao: { connect: { id: data.classificacaoId } },
        modeloFormulario: { connect: { id: data.modeloId } },
        respostasJSON: data.respostasJSON,
      },
      include: { 
        classificacao: true,
        modeloFormulario: true
      }
    });
  }

  async findAllByEdital(editalId: string) {
    return this.prisma.envio.findMany({
      where: { classificacao: { editalId } },
      include: { 
        classificacao: true,
        modeloFormulario: true 
      },
      orderBy: { enviadoEm: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.envio.findUnique({
      where: { id },
      include: { 
        classificacao: true,
        modeloFormulario: true,
        arquivos: true
      }
    });
  }

  async avaliar(id: string, status: any, mensagem?: string, itensAvaliacao?: any, usuarioId?: string, dataAgendamento?: string) {
    return this.prisma.$transaction(async (tx) => {
      try {
        // ... (resto do código)
        // 1. Atualiza o envio
        const updatedEnvio = await tx.envio.update({
          where: { id },
          data: {
            statusAvaliacao: status,
            mensagemAvaliacao: mensagem,
            itensAvaliacaoJSON: itensAvaliacao,
          },
          include: {
            classificacao: {
              include: {
                edital: {
                  include: {
                    formularios: true,
                  },
                },
              },
            },
          },
        });

        const idClassificacao = updatedEnvio.classificacaoCandidatoId;
        const statusNormalizado = status?.toString().trim().toUpperCase();

        console.log(`[DEBUG] Avaliando Envio: ${id} | Status: ${statusNormalizado}`);

        // 2. Se rejeitado, muda status para DOCUMENTACAO_PENDENTE
        if (statusNormalizado === 'REJEITADO') {
          await tx.classificacaoCandidato.update({
            where: { id: idClassificacao },
            data: { statusConvocacao: 'DOCUMENTACAO_PENDENTE' },
          });
          
          await tx.registroConvocacao.create({
            data: {
              classificacaoCandidatoId: idClassificacao,
              meioUtilizado: 'Avaliação de Documentos',
              prazoDocumentacao: new Date(),
              status: 'MUDANCA_FASE',
              observacoes: `REJEIÇÃO: ${mensagem || 'Documentação inconsistente.'}`,
              criadoPorId: usuarioId
            }
          });
          console.log('[DEBUG] Registro de REJEIÇÃO criado');
        }

        // 3. Se aprovado, verifica se todos os obrigatórios estão aprovados
        if (statusNormalizado === 'APROVADO') {
          const todosEnvios = await tx.envio.findMany({
            where: { classificacaoCandidatoId: idClassificacao }
          });

          // Lógica de Precedência Sincronizada com Frontend:
          // Se o candidato tiver um formulário específico vinculado, ele SUBSTITUI os globais do edital.
          let idsObrigatorios: string[] = [];
          
          if (updatedEnvio.classificacao.modeloFormularioId) {
            idsObrigatorios = [updatedEnvio.classificacao.modeloFormularioId];
          } else {
            idsObrigatorios = updatedEnvio.classificacao.edital.formularios
              .filter(f => f.obrigatorio)
              .map(f => f.modeloFormularioId);
          }

          const todosObrigatoriosAprovados = idsObrigatorios.every(idModelo => {
            if (idModelo === updatedEnvio.modeloFormularioId) return true;
            return todosEnvios.some(e => e.modeloFormularioId === idModelo && e.statusAvaliacao === 'APROVADO');
          });

          if (todosObrigatoriosAprovados) {
            const dataPrazo = dataAgendamento ? new Date(dataAgendamento) : new Date();

            await tx.classificacaoCandidato.update({
              where: { id: idClassificacao },
              data: { 
                statusConvocacao: 'AGENDAMENTO_APRESENTACAO',
                prazoEnvio: dataAgendamento ? dataPrazo : undefined
              },
            });

            await tx.registroConvocacao.create({
              data: {
                classificacaoCandidatoId: idClassificacao,
                meioUtilizado: 'Avaliação de Documentos',
                prazoDocumentacao: dataPrazo,
                status: 'MUDANCA_FASE',
                observacoes: 'APROVAÇÃO FINAL: Todos os formulários obrigatórios foram validados e aprovados.',
                criadoPorId: usuarioId
              }
            });
            console.log('[DEBUG] Registro de AGENDAMENTO_APRESENTACAO criado com data:', dataPrazo);
          } else {
            await tx.registroConvocacao.create({
              data: {
                classificacaoCandidatoId: idClassificacao,
                meioUtilizado: 'Avaliação de Documentos',
                prazoDocumentacao: new Date(),
                status: 'MUDANCA_FASE',
                observacoes: `APROVAÇÃO PARCIAL: Formulário aprovado. Ainda restam outros formulários obrigatórios.`,
                criadoPorId: usuarioId
              }
            });
            console.log('[DEBUG] Registro de APROVAÇÃO PARCIAL criado');
          }
        }

        return updatedEnvio;
      } catch (error) {
        console.error('[ERRO AVALIAR]:', error);
        throw error;
      }
    });
  }

  async findByCandidatoAndModelo(classificacaoId: string, modeloId: string) {
    return this.prisma.envio.findFirst({
      where: { classificacaoCandidatoId: classificacaoId, modeloFormularioId: modeloId },
      orderBy: { enviadoEm: 'desc' }
    });
  }
}
