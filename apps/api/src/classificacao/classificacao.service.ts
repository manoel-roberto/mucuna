import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModalidadesConcorrenciaService } from '../modalidades-concorrencia/modalidades-concorrencia.service';
import { calcCota } from '../shared/utils/calcCota';

@Injectable()
export class ClassificacaoService {
  constructor(
    private prisma: PrismaService,
    private modalidadesConcorrenciaService: ModalidadesConcorrenciaService,
  ) {}

  async findByCpf(editalId: string, cpf: string) {
    return this.prisma.classificacaoCandidato.findFirst({
      where: {
        editalId,
        cpfCandidato: cpf,
      },
    });
  }

  async findAllByEdital(editalId: string): Promise<any[]> {
    const list = await this.prisma.classificacaoCandidato.findMany({
      where: { editalId },
      include: {
        modalidade: true,
        cargo: true,
        areaAtuacao: true,
        carreira: true,
        nivel: true,
        envios: {
          select: { id: true, statusAvaliacao: true },
        },
      },
      orderBy: { posicaoAmpla: 'asc' },
    });

    // Migração Automática (Lazy Migration)
    // Se encontrarmos registros que ainda não foram migrados para o novo modelo de concorrência
    if (
      list.length > 0 &&
      list.some(
        (c) =>
          !c.concorrenciaAmpla && !c.concorrenciaNegro && !c.concorrenciaPCD,
      )
    ) {
      for (const c of list) {
        if (
          !c.concorrenciaAmpla &&
          !c.concorrenciaNegro &&
          !c.concorrenciaPCD
        ) {
          const data: any = { concorrenciaAmpla: true };
          if (
            (c.posicaoAmpla === 0 || c.posicaoAmpla === null) &&
            (c.posicao ?? 0) > 0
          ) {
            data.posicaoAmpla = c.posicao;
          }
          if (c.modalidade?.nome.includes('Negros')) {
            data.concorrenciaNegro = true;
            data.posicaoNegro = c.posicao;
          }
          if (c.modalidade?.nome.includes('PCD')) {
            data.concorrenciaPCD = true;
            data.posicaoPCD = c.posicao;
          }
          await this.prisma.classificacaoCandidato.update({
            where: { id: c.id },
            data,
          });
        }
      }
      // Recarregar para retornar dados ordenados corretamente
      return this.findAllByEdital(editalId);
    }

    return list;
  }

  async migrarDadosLegados() {
    const all = await this.prisma.classificacaoCandidato.findMany({
      include: { modalidade: true },
    });

    let count = 0;
    for (const c of all) {
      const data: any = {};

      // 1. Migrar posição geral
      if (
        (c.posicaoAmpla === 0 || c.posicaoAmpla === null) &&
        (c.posicao ?? 0) > 0
      ) {
        data.posicaoAmpla = c.posicao;
      }

      // 2. Setar flags de concorrência baseada na modalidadeId legada
      if (!c.concorrenciaAmpla && !c.concorrenciaNegro && !c.concorrenciaPCD) {
        data.concorrenciaAmpla = true;
        if (c.modalidade?.nome.includes('Negros')) {
          data.concorrenciaNegro = true;
          if (!c.posicaoNegro) data.posicaoNegro = c.posicao;
        }
        if (c.modalidade?.nome.includes('PCD')) {
          data.concorrenciaPCD = true;
          if (!c.posicaoPCD) data.posicaoPCD = c.posicao;
        }
      }

      if (Object.keys(data).length > 0) {
        await this.prisma.classificacaoCandidato.update({
          where: { id: c.id },
          data,
        });
        count++;
      }
    }
    return { updated: count };
  }

  async findAllByUsuario(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario) return [];

    const cleanCpf = usuario.cpf.replace(/\D/g, '');

    return this.prisma.classificacaoCandidato.findMany({
      where: {
        OR: [{ usuarioId: usuario.id }, { cpfCandidato: cleanCpf }],
      },
      include: {
        edital: {
          include: {
            vagas: {
              include: { modeloFormulario: true },
            },
            formularios: {
              include: { modeloFormulario: true },
            },
          },
        },
        modalidade: true,
        cargo: true,
        areaAtuacao: true,
        carreira: true,
        nivel: true,
        modeloFormulario: true,
        envios: {
          include: { arquivos: true },
        },
      },
    });
  }

  private normalize(str: string | null | undefined): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private normalizeCpf(cpf: string | null | undefined): string {
    if (!cpf) return '';
    return cpf.replace(/\D/g, '');
  }

  async importar(editalId: string, candidatos: any[]) {
    console.log(
      `Iniciando importação de ${candidatos.length} candidatos para o edital ${editalId}`,
    );
    try {
      const modalidades = await this.modalidadesConcorrenciaService.findAll();
      const cargos = await this.prisma.cargo.findMany({
        include: { areas: true },
      });
      const carreiras = await this.prisma.carreira.findMany();
      const niveis = await this.prisma.nivel.findMany();
      const vagas = await this.prisma.vagaEdital.findMany({
        where: { editalId },
      });

      const success = [];
      const errors = [];

      for (const [index, cand] of candidatos.entries()) {
        try {
          const posicaoAmpla = parseInt(cand.posicaoAmpla) || 0;
          const posicaoNegro = cand.posicaoNegro
            ? parseInt(cand.posicaoNegro)
            : null;
          const posicaoPCD = cand.posicaoPCD ? parseInt(cand.posicaoPCD) : null;
          const nota = cand.nota
            ? parseFloat(String(cand.nota).replace(',', '.'))
            : null;

          if (isNaN(posicaoAmpla) && !cand.posicaoAmpla) {
            errors.push(
              `Linha ${index + 1}: Posição Ampla ausente ou inválida`,
            );
            continue;
          }

          const cleanCpf = this.normalizeCpf(cand.cpf);
          if (!cleanCpf) {
            errors.push(`Linha ${index + 1}: CPF ausente ou inválido`);
            continue;
          }

          // 1. Modalidade de Concorrência (Boolean Flags)
          const concorrenciaAmpla = true;
          let concorrenciaNegro = !!posicaoNegro; // Se tem posição, concorreu por esta cota
          let concorrenciaPCD = !!posicaoPCD; // Se tem posição, concorreu por esta cota

          const modalidadeValueRaw =
            cand.modalidadeConcorrencia || cand.tipoVaga || cand.modalidade;
          const modalidadeValue = this.normalize(modalidadeValueRaw);

          if (modalidadeValue) {
            if (modalidadeValue.includes('negro')) {
              concorrenciaNegro = true;
            } else if (
              modalidadeValue.includes('deficien') ||
              modalidadeValue.includes('pcd')
            ) {
              concorrenciaPCD = true;
            }
          }

          // Manter o modalidadeId para compatibilidade com as VagaEdital (provisório)
          let modalidadeId = null;
          if (modalidadeValueRaw) {
            const modalidadeEncontrada = modalidades.find(
              (m) =>
                this.normalize(m.nome) === this.normalize(modalidadeValueRaw),
            );
            if (modalidadeEncontrada) {
              modalidadeId = modalidadeEncontrada.id;
            }
          }

          // 2. Cargo e Área
          let cargoId = null;
          let areaAtuacaoId = null;

          if (cand.cargo) {
            let cargoEncontrado = cargos.find(
              (c) => this.normalize(c.nome) === this.normalize(cand.cargo),
            );

            if (!cargoEncontrado) {
              cargoEncontrado = await this.prisma.cargo.create({
                data: { nome: cand.cargo.trim() },
                include: { areas: true },
              });
              cargos.push(cargoEncontrado);
            }

            cargoId = cargoEncontrado.id;

            if (cand.area) {
              let areaEncontrada = cargoEncontrado.areas.find(
                (a) => this.normalize(a.nome) === this.normalize(cand.area),
              );

              if (!areaEncontrada) {
                areaEncontrada = await this.prisma.areaAtuacao.create({
                  data: {
                    nome: cand.area.trim(),
                    cargoId: cargoId,
                  },
                });
                cargoEncontrado.areas.push(areaEncontrada);
              }
              areaAtuacaoId = areaEncontrada.id;
            }
          }

          // 2.1 Carreira e Nível
          let carreiraId = null;
          let nivelId = null;

          if (cand.carreira) {
            let carreiraEncontrada = carreiras.find(
              (c) => this.normalize(c.nome) === this.normalize(cand.carreira),
            );
            if (!carreiraEncontrada) {
              carreiraEncontrada = await this.prisma.carreira.create({
                data: { nome: cand.carreira.trim() },
              });
              carreiras.push(carreiraEncontrada);
            }
            carreiraId = carreiraEncontrada.id;
          }

          if (cand.nivel) {
            let niv = niveis.find(
              (n) => this.normalize(n.nome) === this.normalize(cand.nivel),
            );
            if (!niv) {
              niv = await this.prisma.nivel.create({
                data: { nome: cand.nivel.trim() },
              });
              niveis.push(niv);
            }
            nivelId = niv.id;
          }

          // 6. Situação preliminar baseada em vagas
          const vagaCorrespondente = vagas.find(
            (v) =>
              v.cargoId === cargoId &&
              (v.areaAtuacaoId === areaAtuacaoId ||
                (!v.areaAtuacaoId && !areaAtuacaoId)) &&
              (v.carreiraId === carreiraId || (!v.carreiraId && !carreiraId)) &&
              (v.nivelId === nivelId || (!v.nivelId && !nivelId)) &&
              (v.modalidadeId === modalidadeId ||
                (!v.modalidadeId && !modalidadeId)),
          );

          let situacao: 'APROVADO_CONVOCAVEL' | 'CADASTRO_RESERVA' =
            'CADASTRO_RESERVA';
          if (
            vagaCorrespondente &&
            posicaoAmpla <= vagaCorrespondente.quantidadeVagas
          ) {
            situacao = 'APROVADO_CONVOCAVEL';
          }

          // 7. Upsert por CPF ou Número de Inscrição no Edital (Evitar duplicidade)
          const existente = await this.prisma.classificacaoCandidato.findFirst({
            where: {
              editalId,
              OR: [
                { cpfCandidato: cleanCpf },
                { numeroInscricao: String(cand.numeroInscricao) },
              ],
            },
          });

          // 7. Verificar se já existe um usuário com este CPF para vincular
          const usuarioExistente = await this.prisma.usuario.findUnique({
            where: { cpf: cleanCpf },
          });

          const baseData = {
            nomeCandidato: String(cand.nome),
            numeroInscricao: String(cand.numeroInscricao),
            usuarioId: usuarioExistente?.id || null,
            posicaoAmpla: Number(posicaoAmpla),
            posicaoNegro:
              posicaoNegro !== null && !isNaN(posicaoNegro)
                ? Number(posicaoNegro)
                : null,
            posicaoPCD:
              posicaoPCD !== null && !isNaN(posicaoPCD)
                ? Number(posicaoPCD)
                : null,
            nota: nota !== null && !isNaN(nota) ? Number(nota) : null,
            situacao,
            concorrenciaAmpla: Boolean(concorrenciaAmpla),
            concorrenciaNegro: Boolean(concorrenciaNegro),
            concorrenciaPCD: Boolean(concorrenciaPCD),
            emailCandidato: cand.email ? String(cand.email) : null,
            telefoneCandidato: cand.telefone ? String(cand.telefone) : null,
            celularCandidato: cand.celular ? String(cand.celular) : null,
            enderecoCandidato: cand.endereco ? String(cand.endereco) : null,
            modalidadeId: modalidadeId || null,
            cargoId: cargoId || null,
            areaAtuacaoId: areaAtuacaoId || null,
            carreiraId: carreiraId || null,
            nivelId: nivelId || null,
            posicao: null,
            posicaoConvocacao: null,
          };

          if (existente) {
            await this.prisma.classificacaoCandidato.update({
              where: { id: existente.id },
              data: baseData,
            });
          } else {
            await this.prisma.classificacaoCandidato.create({
              data: {
                ...baseData,
                editalId,
                cpfCandidato: cleanCpf,
              },
            });
          }
          success.push(cand.nome);
        } catch (error: any) {
          console.error(
            `DETALHE DO ERRO - Candidato ${cand.nome || 'sem nome'} (Payload: ${JSON.stringify(cand)}):`,
            JSON.stringify(error, null, 2),
          );
          console.error(`ERRO MESSAGE:`, error.message);
          errors.push(
            `Candidato ${cand.nome || 'sem nome'}: ${error.message.substring(0, 150)}...`,
          );
        }
      }

      if (success.length === 0 && errors.length > 0) {
        throw new BadRequestException(`Falha total: ${errors[0]}`);
      }

      // Re-classificar automaticamente após importação
      await this.reprocessarSituacaoCandidatos(editalId);

      return {
        total: success.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('Erro fatal na importação:', error);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        `DEBUG-API: Erro interno: ${error.message}`,
      );
    }
  }

  async create(editalId: string, data: any) {
    const {
      modalidadeId,
      cargoId,
      areaAtuacaoId,
      carreiraId,
      nivelId,
      situacao,
      ...rest
    } = data;

    // Validar duplicidade antes de criar
    const existente = await this.prisma.classificacaoCandidato.findFirst({
      where: {
        editalId,
        OR: [
          { cpfCandidato: rest.cpfCandidato },
          { numeroInscricao: rest.numeroInscricao },
        ],
      },
    });

    if (existente) {
      throw new BadRequestException(
        `Candidato já cadastrado neste edital com este CPF (${rest.cpfCandidato}) ou Inscrição (${rest.numeroInscricao}).`,
      );
    }

    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { cpf: rest.cpfCandidato },
    });

    return this.prisma.classificacaoCandidato.create({
      data: {
        ...rest,
        usuarioId: usuarioExistente?.id || null,
        posicao: rest.posicao || null,
        posicaoConvocacao: rest.posicaoConvocacao || null,
        situacao: situacao || 'CADASTRO_RESERVA',
        edital: { connect: { id: editalId } },
        modalidade: modalidadeId
          ? { connect: { id: modalidadeId } }
          : undefined,
        cargo: cargoId ? { connect: { id: cargoId } } : undefined,
        areaAtuacao: areaAtuacaoId
          ? { connect: { id: areaAtuacaoId } }
          : undefined,
        carreira: carreiraId ? { connect: { id: carreiraId } } : undefined,
        nivel: nivelId ? { connect: { id: nivelId } } : undefined,
      },
    });
  }

  async update(id: string, data: any) {
    const {
      modalidadeId,
      cargoId,
      areaAtuacaoId,
      carreiraId,
      nivelId,
      situacao,
      ...rest
    } = data;

    let usuarioId = undefined;
    if (rest.cpfCandidato) {
      const u = await this.prisma.usuario.findUnique({
        where: { cpf: rest.cpfCandidato },
      });
      if (u) usuarioId = u.id;
    }

    return this.prisma.classificacaoCandidato.update({
      where: { id },
      data: {
        ...rest,
        ...(usuarioId && { usuarioId }),
        ...(situacao && { situacao }),
        posicao: rest.posicao === undefined ? undefined : rest.posicao || null,
        posicaoConvocacao:
          rest.posicaoConvocacao === undefined
            ? undefined
            : rest.posicaoConvocacao || null,
        modalidade: modalidadeId
          ? { connect: { id: modalidadeId } }
          : modalidadeId === null
            ? { disconnect: true }
            : undefined,
        cargo: cargoId
          ? { connect: { id: cargoId } }
          : cargoId === null
            ? { disconnect: true }
            : undefined,
        areaAtuacao: areaAtuacaoId
          ? { connect: { id: areaAtuacaoId } }
          : areaAtuacaoId === null
            ? { disconnect: true }
            : undefined,
        carreira: carreiraId
          ? { connect: { id: carreiraId } }
          : carreiraId === null
            ? { disconnect: true }
            : undefined,
        nivel: nivelId
          ? { connect: { id: nivelId } }
          : nivelId === null
            ? { disconnect: true }
            : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.classificacaoCandidato.delete({ where: { id } });
  }

  async confirmarDados(id: string, data: any) {
    const classificacao = await this.prisma.classificacaoCandidato.findUnique({
      where: { id },
      select: { cpfCandidato: true },
    });

    if (!classificacao)
      throw new BadRequestException('Classificação não encontrada');

    // Atualizar todas as classificações do mesmo CPF para manter sincronia
    return this.prisma.classificacaoCandidato.updateMany({
      where: { cpfCandidato: classificacao.cpfCandidato },
      data: {
        emailCandidato: data.emailCandidato,
        telefoneCandidato: data.telefoneCandidato,
        celularCandidato: data.celularCandidato,
        enderecoCandidato: data.enderecoCandidato,
        dadosConfirmados: true,
      },
    });
  }

  async removeBulk(ids: string[]) {
    return this.prisma.classificacaoCandidato.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async getEstatisticasVagas(editalId: string) {
    const vagas = await this.prisma.vagaEdital.findMany({
      where: { editalId },
      include: {
        cargo: true,
        areaAtuacao: true,
        modalidade: true,
        modeloFormulario: true,
      },
    } as any);

    const grupos: Record<
      string,
      {
        vagasIds: string[];
        cargoId: string;
        areaAtuacaoId?: string | null;
        carreiraId?: string | null;
        nivelId?: string | null;
        cargoNome: string;
        areaNome: string;
        quantidadeVagas: number;
        modeloFormularioId?: string | null;
        modeloFormularioNome?: string | null;
      }
    > = {};

    for (const vaga of vagas as any[]) {
      const key = `${vaga.cargoId}_${vaga.areaAtuacaoId || 'geral'}_${vaga.carreiraId || 'geral'}_${vaga.nivelId || 'geral'}`;
      if (!grupos[key]) {
        grupos[key] = {
          vagasIds: [],
          cargoId: vaga.cargoId,
          areaAtuacaoId: vaga.areaAtuacaoId,
          carreiraId: vaga.carreiraId,
          nivelId: vaga.nivelId,
          cargoNome: vaga.cargo.nome,
          areaNome: vaga.areaAtuacao?.nome || 'Geral',
          quantidadeVagas: 0,
          modeloFormularioId: vaga.modeloFormularioId,
          modeloFormularioNome: vaga.modeloFormulario?.nome,
        };
      }
      grupos[key].vagasIds.push(vaga.id);
      grupos[key].quantidadeVagas += vaga.totalGeral || vaga.quantidadeVagas || 0;
    }

    const estatisticas = await Promise.all(
      Object.values(grupos).map(async (grupo) => {
        // Contar candidatos habilitados (situacao: APROVADO_CONVOCAVEL) em qualquer uma das modalidades do grupo
        const count = await this.prisma.classificacaoCandidato.count({
          where: {
            editalId,
            cargoId: grupo.cargoId,
            areaAtuacaoId: grupo.areaAtuacaoId || null,
            carreiraId: grupo.carreiraId || null,
            nivelId: grupo.nivelId || null,
          },
        });

        // Montar detalhamento de vagas por modalidade
        const vagasNoGrupo = (vagas as any[]).filter(
          (v) =>
            v.cargoId === grupo.cargoId &&
            (v.areaAtuacaoId || null) === (grupo.areaAtuacaoId || null) &&
            (v.carreiraId || null) === (grupo.carreiraId || null) &&
            (v.nivelId || null) === (grupo.nivelId || null),
        );

        const detalhesModalidades = vagasNoGrupo.map((v) => ({
          modalidadeId: v.modalidadeId,
          modalidadeNome: v.modalidade?.nome || 'Geral',
          quantidade: v.quantidadeVagas,
        }));

        // Manter o mapa legado para compatibilidade se necessário, mas focar no novo array
        const vagasPorModalidade: Record<string, number> = {};
        for (const v of vagasNoGrupo) {
          // Se for o novo modelo (posicional)
          if (v.totalGeral > 0) {
            vagasPorModalidade['ampla'] = v.vagasAC;
            vagasPorModalidade['negro'] = v.vagasNEG;
            vagasPorModalidade['pcd'] = v.vagasPCD;
            vagasPorModalidade['amplaImediatas'] = v.vagasACImediatas;
            vagasPorModalidade['amplaReserva'] = v.vagasACReserva;
            vagasPorModalidade['negroImediatas'] = v.vagasNEGImediatas;
            vagasPorModalidade['negroReserva'] = v.vagasNEGReserva;
            vagasPorModalidade['pcdImediatas'] = v.vagasPCDImediatas;
            vagasPorModalidade['pcdReserva'] = v.vagasPCDReserva;
          } else if (v.modalidadeId) {
            // Modelo legado
            vagasPorModalidade[v.modalidadeId] = v.quantidadeVagas;
          }
        }

        return {
          id: grupo.vagasIds[0], // ID de referência
          cargoId: grupo.cargoId,
          areaAtuacaoId: grupo.areaAtuacaoId,
          carreiraId: grupo.carreiraId,
          nivelId: grupo.nivelId,
          cargoNome: grupo.cargoNome,
          areaNome: grupo.areaNome,
          quantidadeVagas: grupo.quantidadeVagas,
          modeloFormularioId: grupo.modeloFormularioId,
          modeloFormularioNome: grupo.modeloFormularioNome,
          candidatosHabilitados: count,
          disponivel: Math.max(0, grupo.quantidadeVagas - count),
          // Campos flat para o frontend
          vagasImediatas: Number(vagasPorModalidade['amplaImediatas'] || 0) + Number(vagasPorModalidade['negroImediatas'] || 0) + Number(vagasPorModalidade['pcdImediatas'] || 0),
          vagasReserva: Number(vagasPorModalidade['amplaReserva'] || 0) + Number(vagasPorModalidade['negroReserva'] || 0) + Number(vagasPorModalidade['pcdReserva'] || 0),
          vagasACImediatas: Number(vagasPorModalidade['amplaImediatas'] || 0),
          vagasACReserva: Number(vagasPorModalidade['amplaReserva'] || 0),
          vagasNEGImediatas: Number(vagasPorModalidade['negroImediatas'] || 0),
          vagasNEGReserva: Number(vagasPorModalidade['negroReserva'] || 0),
          vagasPCDImediatas: Number(vagasPorModalidade['pcdImediatas'] || 0),
          vagasPCDReserva: Number(vagasPorModalidade['pcdReserva'] || 0),
          vagasPorModalidade,
          detalhesModalidades,
          vagasIds: grupo.vagasIds,
        };
      }),
    );

    return estatisticas;
  }

  async analisarCobertura(editalId: string) {
    // 1. Buscar dados fundamentais
    const edital = await this.prisma.edital.findUnique({
      where: { id: editalId },
    });
    if (!edital) throw new BadRequestException('Edital não encontrado');

    const candidatos = await this.prisma.classificacaoCandidato.findMany({
      where: { editalId },
      include: {
        cargo: true,
        areaAtuacao: true,
        carreira: true,
        nivel: true,
      },
    });

    const vagas = await this.prisma.vagaEdital.findMany({
      where: { editalId },
    });

    // 2. Agrupar candidatos por (Cargo, Área, Carreira, Nível)
    // Isso é necessário porque VagaEdital tem essa granularidade
    const gruposMap = new Map<string, any[]>();
    for (const c of candidatos) {
      const key = `${c.cargoId || 'none'}-${c.areaAtuacaoId || 'none'}-${c.carreiraId || 'none'}-${c.nivelId || 'none'}`;
      if (!gruposMap.has(key)) gruposMap.set(key, []);
      gruposMap.get(key)!.push(c);
    }

    const resultado = [];

    // 3. Analisar cada grupo
    for (const [key, candGrupo] of gruposMap.entries()) {
      const first = candGrupo[0];
      
      // Lazy Migration: Se as flags de concorrência estiverm todas false, assumir Ampla
      for (const c of candGrupo) {
        if (!c.concorrenciaAmpla && !c.concorrenciaNegro && !c.concorrenciaPCD) {
           c.concorrenciaAmpla = true;
        }
      }

      const totalCandidatos = candGrupo.length;
      const candidatosAC = candGrupo.filter((c) => c.concorrenciaAmpla).length;
      const candidatosNEG = candGrupo.filter((c) => c.concorrenciaNegro).length;
      const candidatosPCD = candGrupo.filter((c) => c.concorrenciaPCD).length;

      const vaga = vagas.find(
        (v) => 
          v.cargoId === first.cargoId && 
          v.areaAtuacaoId === first.areaAtuacaoId && 
          v.carreiraId === first.carreiraId && 
          v.nivelId === first.nivelId
      );

      // Metas legislativas (usando percentuais do edital)
      const negEsperado = calcCota(
        totalCandidatos,
        edital.percentualNegros || 0,
        'negro',
      );
      const pcdEsperado = calcCota(
        totalCandidatos,
        edital.percentualPCD || 0,
        'pcd',
      );
      const acEsperado = Math.max(
        0,
        totalCandidatos - negEsperado - pcdEsperado,
      );

      const inconsistencias = [];

      if (!vaga) {
        inconsistencias.push({
          tipo: 'SEM_VAGA',
          severidade: 'BLOQUEANTE',
          mensagem: 'Não existe VagaEdital configurada para este grupo (Cargo/Área/Carreira/Nível)',
        });
      } else {
        if (vaga.vagasImediatas === 0 && totalCandidatos > 0) {
          inconsistencias.push({
            tipo: 'SEM_IMEDIATAS',
            severidade: 'BLOQUEANTE',
            mensagem: 'Vagas Imediatas configuradas em zero, mas existem candidatos habilitados',
          });
        }
        if (vaga.totalNEGCalculado < negEsperado) {
          inconsistencias.push({
            tipo: 'NEG_INSUFICIENTE',
            severidade: 'BLOQUEANTE',
            mensagem: `Cota de Negros insuficiente (${vaga.totalNEGCalculado} configuradas < ${negEsperado} exigidas)`,
          });
        }
        if (vaga.totalPCDCalculado < pcdEsperado) {
          inconsistencias.push({
            tipo: 'PCD_INSUFICIENTE',
            severidade: 'BLOQUEANTE',
            mensagem: `Cota de PCD insuficiente (${vaga.totalPCDCalculado} configuradas < ${pcdEsperado} exigidas)`,
          });
        }
      }

      // Sugestão automática
      let sugestao = null;
      if (inconsistencias.length > 0) {
        sugestao = {
          vagasImediatas: totalCandidatos,
          vagasReserva: 0,
        };
      }

      // Título amigável
      const cNome = first.cargo?.nome || 'Cargo';
      const aNome = first.areaAtuacao?.nome || 'Geral';
      const detail = [first.carreira?.nome, first.nivel?.nome].filter(Boolean).join(' - ');
      const fullCargoNome = detail ? `${cNome} (${detail})` : cNome;
      
      const itemResultado = {
        "cargoId": first.cargoId || '',
        "areaAtuacaoId": first.areaAtuacaoId || '',
        "carreiraId": first.carreiraId || '',
        "nivelId": first.nivelId || '',
        "cargoNome": String(fullCargoNome),
        "areaNome": String(aNome),
        "carreiraNome": first.carreira?.nome || null,
        "nivelNome": first.nivel?.nome || null,
        "totalCandidatos": Number(totalCandidatos || 0),
        "candidatosAC": Number(candidatosAC || 0),
        "candidatosNEG": Number(candidatosNEG || 0),
        "candidatosPCD": Number(candidatosPCD || 0),
        "vagaConfigurada": Boolean(!!vaga),
        "vagasImediatas": Number(vaga?.vagasImediatas || 0),
        "vagasReserva": Number(vaga?.vagasReserva || 0),
        "vagasACImediatas": Number(vaga?.vagasACImediatas || 0),
        "vagasACReserva": Number(vaga?.vagasACReserva || 0),
        "vagasNEGImediatas": Number(vaga?.vagasNEGImediatas || 0),
        "vagasNEGReserva": Number(vaga?.vagasNEGReserva || 0),
        "vagasPCDImediatas": Number(vaga?.vagasPCDImediatas || 0),
        "vagasPCDReserva": Number(vaga?.vagasPCDReserva || 0),
        "negEsperado": Number(negEsperado || 0),
        "pcdEsperado": Number(pcdEsperado || 0),
        "acEsperado": Number(acEsperado || 0),
        "inconsistencias": inconsistencias || [],
        "sugestao": sugestao || null,
      };

      resultado.push(itemResultado);
    }

    return resultado;
  }

  async reprocessarSituacaoCandidatos(editalId: string) {
    console.log(
      `[RECLASSIFICAR] Iniciando reprocessamento para edital ${editalId}`,
    );

    // 1. Buscar todas as vagas configuradas
    const vagas = await this.prisma.vagaEdital.findMany({
      where: { editalId },
    });

    // 2. Resetar todos os candidatos deste edital para CADASTRO_RESERVA (Limpeza de segurança)
    await this.prisma.classificacaoCandidato.updateMany({
      where: { editalId },
      data: { situacao: 'CADASTRO_RESERVA', tipoVaga: null },
    });

    // 3. Para cada vaga de posição (Cargo/Área), marcar os Top N de cada lista
    for (const vaga of vagas) {
      if (vaga.totalNEGCalculado > 0) {
        const negrosParaVaga =
          await this.prisma.classificacaoCandidato.findMany({
            where: {
              editalId,
              cargoId: vaga.cargoId,
              areaAtuacaoId: vaga.areaAtuacaoId || null,
              carreiraId: vaga.carreiraId || null,
              nivelId: vaga.nivelId || null,
              concorrenciaNegro: true,
            },
            orderBy: { posicaoNegro: 'asc' },
            take: vaga.totalNEGCalculado,
          });
        
        const imedIds = negrosParaVaga.slice(0, vaga.vagasNEGImediatas).map(c => c.id);
        const resIds = negrosParaVaga.slice(vaga.vagasNEGImediatas).map(c => c.id);

        if (imedIds.length > 0) {
          await this.prisma.classificacaoCandidato.updateMany({
            where: { id: { in: imedIds } },
            data: { situacao: 'APROVADO_CONVOCAVEL', tipoVaga: 'IMEDIATA' },
          });
        }
        if (resIds.length > 0) {
          await this.prisma.classificacaoCandidato.updateMany({
            where: { id: { in: resIds } },
            data: { situacao: 'CADASTRO_RESERVA', tipoVaga: 'RESERVA' },
          });
        }
      }

      if (vaga.totalPCDCalculado > 0) {
        const pcdsParaVaga = await this.prisma.classificacaoCandidato.findMany({
          where: {
            editalId,
            cargoId: vaga.cargoId,
            areaAtuacaoId: vaga.areaAtuacaoId || null,
            carreiraId: vaga.carreiraId || null,
            nivelId: vaga.nivelId || null,
            concorrenciaPCD: true,
          },
          orderBy: { posicaoPCD: 'asc' },
          take: vaga.totalPCDCalculado,
        });

        const imedIds = pcdsParaVaga.slice(0, vaga.vagasPCDImediatas).map(c => c.id);
        const resIds = pcdsParaVaga.slice(vaga.vagasPCDImediatas).map(c => c.id);

        if (imedIds.length > 0) {
          await this.prisma.classificacaoCandidato.updateMany({
            where: { id: { in: imedIds } },
            data: { situacao: 'APROVADO_CONVOCAVEL', tipoVaga: 'IMEDIATA' },
          });
        }
        if (resIds.length > 0) {
          await this.prisma.classificacaoCandidato.updateMany({
            where: { id: { in: resIds } },
            data: { situacao: 'CADASTRO_RESERVA', tipoVaga: 'RESERVA' },
          });
        }
      }

      if (vaga.totalACCalculado > 0) {
        const amplaParaVaga = await this.prisma.classificacaoCandidato.findMany(
          {
            where: {
              editalId,
              cargoId: vaga.cargoId,
              areaAtuacaoId: vaga.areaAtuacaoId || null,
              carreiraId: vaga.carreiraId || null,
              nivelId: vaga.nivelId || null,
              concorrenciaAmpla: true,
            },
            orderBy: { posicaoAmpla: 'asc' },
            take: vaga.totalACCalculado,
          },
        );

        const imedIds = amplaParaVaga.slice(0, vaga.vagasACImediatas).map(c => c.id);
        const resIds = amplaParaVaga.slice(vaga.vagasACImediatas).map(c => c.id);

        if (imedIds.length > 0) {
          await this.prisma.classificacaoCandidato.updateMany({
            where: { id: { in: imedIds } },
            data: { situacao: 'APROVADO_CONVOCAVEL', tipoVaga: 'IMEDIATA' },
          });
        }
        if (resIds.length > 0) {
          await this.prisma.classificacaoCandidato.updateMany({
            where: { id: { in: resIds } },
            data: { situacao: 'CADASTRO_RESERVA', tipoVaga: 'RESERVA' },
          });
        }
      }
    }

    return { message: 'Reprocessamento concluído com sucesso' };
  }
}
