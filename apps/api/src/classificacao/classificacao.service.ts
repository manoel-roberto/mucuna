import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModalidadesConcorrenciaService } from '../modalidades-concorrencia/modalidades-concorrencia.service';

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
      include: {
        modalidade: true,
      },
    });
    const modalidades = await this.modalidadesConcorrenciaService.findAll();

    // Mapeamento de IDs para categorias de concorrência
    const getModId = (category: 'ampla' | 'negro' | 'pcd') => {
      const found = modalidades.find((m) => {
        const n = this.normalize(m.nome);
        if (category === 'ampla') return n.includes('ampla');
        if (category === 'negro') return n.includes('negro');
        if (category === 'pcd')
          return n.includes('pcd') || n.includes('deficien');
        return false;
      });
      return found?.id || null;
    };

    const modAmplaId = getModId('ampla');
    const modNegroId = getModId('negro');
    const modPcdId = getModId('pcd');

    const alertas = [];
    const chavesVistas = new Set<string>();

    // 2. Identificar todas as combinações únicas de (Cargo, Área, Carreira, Nível)
    for (const cand of candidatos) {
      const baseKey = `${cand.cargoId}-${cand.areaAtuacaoId || null}-${cand.carreiraId || null}-${cand.nivelId || null}`;
      if (chavesVistas.has(baseKey)) continue;
      chavesVistas.add(baseKey);

      // 3. Para cada combinação, validar as 3 listas independentemente
      const tiposConcorrencia = [
        {
          key: 'concorrenciaAmpla',
          modId: modAmplaId,
          label: 'Ampla Concorrência',
        },
        { key: 'concorrenciaNegro', modId: modNegroId, label: 'Negros' },
        { key: 'concorrenciaPCD', modId: modPcdId, label: 'PCD' },
      ];

      for (const tipo of tiposConcorrencia) {
        // Quantidade de candidatos nesta categoria específica para este cargo/área
        const candidatosNaLista = candidatos.filter(
          (c: any) =>
            (c.cargoId || null) === (cand.cargoId || null) &&
            (c.areaAtuacaoId || null) === (cand.areaAtuacaoId || null) &&
            (c.carreiraId || null) === (cand.carreiraId || null) &&
            (c.nivelId || null) === (cand.nivelId || null) &&
            c[tipo.key] === true,
        ).length;

        if (candidatosNaLista === 0) continue;

        // Buscar vagas configuradas para esta categoria específica
        const vagasConfiguradas = vagas
          .filter(
            (v) =>
              v.cargoId === cand.cargoId &&
              (v.areaAtuacaoId || null) === (cand.areaAtuacaoId || null) &&
              (v.carreiraId || null) === (cand.carreiraId || null) &&
              (v.nivelId || null) === (cand.nivelId || null),
          )
          .reduce((acc, curr: any) => {
            if (tipo.key === 'concorrenciaAmpla')
              return acc + (curr.vagasAC || 0);
            if (tipo.key === 'concorrenciaNegro')
              return acc + (curr.vagasNEG || 0);
            if (tipo.key === 'concorrenciaPCD')
              return acc + (curr.vagasPCD || 0);
            return acc;
          }, 0);

        // Gerar alertas se houver defasagem
        if (vagasConfiguradas === 0) {
          alertas.push({
            tipo: 'FALTANTE',
            cargoId: cand.cargoId,
            areaAtuacaoId: cand.areaAtuacaoId || null,
            modalidadeId: tipo.modId,
            carreiraId: cand.carreiraId || null,
            nivelId: cand.nivelId || null,
            cargo: cand.cargo?.nome || 'Não definido',
            area: cand.areaAtuacao?.nome || 'Geral',
            modalidade: tipo.label,
            carreira: cand.carreira?.nome || 'Não definida',
            nivel: cand.nivel?.nome || 'Não definido',
            candidatosAfetados: candidatosNaLista,
            vagasConfiguradas: 0,
          });
        } else if (vagasConfiguradas < candidatosNaLista) {
          alertas.push({
            tipo: 'INSUFICIENTE',
            cargoId: cand.cargoId,
            areaAtuacaoId: cand.areaAtuacaoId || null,
            modalidadeId: tipo.modId,
            carreiraId: cand.carreiraId || null,
            nivelId: cand.nivelId || null,
            cargo: cand.cargo?.nome || 'Não definido',
            area: cand.areaAtuacao?.nome || 'Geral',
            modalidade: tipo.label,
            carreira: cand.carreira?.nome || 'Não definida',
            nivel: cand.nivel?.nome || 'Não definido',
            candidatosAfetados: candidatosNaLista,
            vagasConfiguradas: vagasConfiguradas,
          });
        }
      }
    }

    return alertas;
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
      data: { situacao: 'CADASTRO_RESERVA' },
    });

    // 3. Para cada vaga de posição (Cargo/Área), marcar os Top N de cada lista
    for (const vaga of vagas) {
      // 3.1. Processar Lista de Negros
      if (vaga.vagasNEG > 0) {
        const negrosParaVaga =
          await this.prisma.classificacaoCandidato.findMany({
            where: {
              editalId,
              cargoId: vaga.cargoId,
              areaAtuacaoId: vaga.areaAtuacaoId || null,
              carreiraId: vaga.carreiraId || null,
              nivelId: vaga.nivelId || null,
              concorrenciaNegro: true,
              situacao: 'CADASTRO_RESERVA',
            },
            orderBy: { posicaoNegro: 'asc' },
            take: vaga.vagasNEG,
          });
        if (negrosParaVaga.length > 0) {
          await this.prisma.classificacaoCandidato.updateMany({
            where: { id: { in: negrosParaVaga.map((c) => c.id) } },
            data: { situacao: 'APROVADO_CONVOCAVEL' },
          });
        }
      }

      // 3.2. Processar Lista de PCD
      if (vaga.vagasPCD > 0) {
        const pcdsParaVaga = await this.prisma.classificacaoCandidato.findMany({
          where: {
            editalId,
            cargoId: vaga.cargoId,
            areaAtuacaoId: vaga.areaAtuacaoId || null,
            carreiraId: vaga.carreiraId || null,
            nivelId: vaga.nivelId || null,
            concorrenciaPCD: true,
            situacao: 'CADASTRO_RESERVA',
          },
          orderBy: { posicaoPCD: 'asc' },
          take: vaga.vagasPCD,
        });
        if (pcdsParaVaga.length > 0) {
          await this.prisma.classificacaoCandidato.updateMany({
            where: { id: { in: pcdsParaVaga.map((c) => c.id) } },
            data: { situacao: 'APROVADO_CONVOCAVEL' },
          });
        }
      }

      // 3.3. Processar Lista de Ampla Concorrência
      if (vaga.vagasAC > 0) {
        const amplaParaVaga = await this.prisma.classificacaoCandidato.findMany(
          {
            where: {
              editalId,
              cargoId: vaga.cargoId,
              areaAtuacaoId: vaga.areaAtuacaoId || null,
              carreiraId: vaga.carreiraId || null,
              nivelId: vaga.nivelId || null,
              concorrenciaAmpla: true,
              situacao: 'CADASTRO_RESERVA',
            },
            orderBy: { posicaoAmpla: 'asc' },
            take: vaga.vagasAC,
          },
        );
        if (amplaParaVaga.length > 0) {
          await this.prisma.classificacaoCandidato.updateMany({
            where: { id: { in: amplaParaVaga.map((c) => c.id) } },
            data: { situacao: 'APROVADO_CONVOCAVEL' },
          });
        }
      }
    }

    return { message: 'Reprocessamento concluído com sucesso' };
  }
}
