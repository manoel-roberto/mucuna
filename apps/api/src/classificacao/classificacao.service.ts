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
          select: { id: true, statusAvaliacao: true }
        }
      },
      orderBy: { posicaoAmpla: 'asc' },
    });

    // Migração Automática (Lazy Migration)
    // Se encontrarmos registros que ainda não foram migrados para o novo modelo de concorrência
    if (list.length > 0 && list.some(c => !c.concorrenciaAmpla && !c.concorrenciaNegro && !c.concorrenciaPCD)) {
       for (const c of list) {
         if (!c.concorrenciaAmpla && !c.concorrenciaNegro && !c.concorrenciaPCD) {
            const data: any = { concorrenciaAmpla: true };
            if ((c.posicaoAmpla === 0 || c.posicaoAmpla === null) && (c.posicao ?? 0) > 0) {
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
            await this.prisma.classificacaoCandidato.update({ where: { id: c.id }, data });
         }
       }
       // Recarregar para retornar dados ordenados corretamente
       return this.findAllByEdital(editalId);
    }
    
    return list;
  }

  async migrarDadosLegados() {
    const all = await this.prisma.classificacaoCandidato.findMany({
      include: { modalidade: true }
    });
    
    let count = 0;
    for (const c of all) {
      const data: any = {};
      
      // 1. Migrar posição geral
      if ((c.posicaoAmpla === 0 || c.posicaoAmpla === null) && (c.posicao ?? 0) > 0) {
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
          data
        });
        count++;
      }
    }
    return { updated: count };
  }

  async findAllByUsuario(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) return [];
    
    const cleanCpf = usuario.cpf.replace(/\D/g, '');

    return this.prisma.classificacaoCandidato.findMany({
      where: { 
        OR: [
          { usuarioId: usuario.id },
          { cpfCandidato: cleanCpf }
        ]
      },
      include: { 
        edital: {
          include: { 
            vagas: {
              include: { modeloFormulario: true }
            },
            formularios: { 
              include: { modeloFormulario: true } 
            }
          }
        },
        modalidade: true,
        cargo: true,
        areaAtuacao: true,
        carreira: true,
        nivel: true,
        modeloFormulario: true,
        envios: {
          include: { arquivos: true }
        }
      }
    });
  }

  private normalize(str: string | null | undefined): string {
    if (!str) return '';
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  private normalizeCpf(cpf: string | null | undefined): string {
    if (!cpf) return '';
    return cpf.replace(/\D/g, '');
  }

  async importar(editalId: string, candidatos: any[]) {
    console.log(`Iniciando importação de ${candidatos.length} candidatos para o edital ${editalId}`);
    try {
      const modalidades = await this.modalidadesConcorrenciaService.findAll();
      const cargos = await this.prisma.cargo.findMany({ include: { areas: true } });
      const carreiras = await this.prisma.carreira.findMany();
      const niveis = await this.prisma.nivel.findMany();
      const vagas = await this.prisma.vagaEdital.findMany({ where: { editalId } });
      
      const success = [];
      const errors = [];

      for (const [index, cand] of candidatos.entries()) {
        try {
          const posicaoAmpla = parseInt(cand.posicaoAmpla) || 0;
          const posicaoNegro = cand.posicaoNegro ? parseInt(cand.posicaoNegro) : null;
          const posicaoPCD = cand.posicaoPCD ? parseInt(cand.posicaoPCD) : null;
          const nota = cand.nota ? parseFloat(String(cand.nota).replace(',', '.')) : null;

          if (isNaN(posicaoAmpla) && !cand.posicaoAmpla) {
            errors.push(`Linha ${index + 1}: Posição Ampla ausente ou inválida`);
            continue;
          }

          const cleanCpf = this.normalizeCpf(cand.cpf);
          if (!cleanCpf) {
            errors.push(`Linha ${index + 1}: CPF ausente ou inválido`);
            continue;
          }

          // 1. Modalidade de Concorrência (Boolean Flags)
          let concorrenciaAmpla = true;
          let concorrenciaNegro = !!posicaoNegro; // Se tem posição, concorreu por esta cota
          let concorrenciaPCD = !!posicaoPCD;     // Se tem posição, concorreu por esta cota

          const modalidadeValueRaw = cand.modalidadeConcorrencia || cand.tipoVaga || cand.modalidade;
          const modalidadeValue = this.normalize(modalidadeValueRaw);
          
          if (modalidadeValue) {
            if (modalidadeValue.includes('negro')) {
              concorrenciaNegro = true;
            } else if (modalidadeValue.includes('deficien') || modalidadeValue.includes('pcd')) {
              concorrenciaPCD = true;
            }
          }

          // Manter o modalidadeId para compatibilidade com as VagaEdital (provisório)
          let modalidadeId = null;
          if (modalidadeValueRaw) {
            const modalidadeEncontrada = modalidades.find(m =>
              this.normalize(m.nome) === this.normalize(modalidadeValueRaw)
            );
            if (modalidadeEncontrada) {
              modalidadeId = modalidadeEncontrada.id;
            }
          }

          // 2. Cargo e Área
          let cargoId = null;
          let areaAtuacaoId = null;

          if (cand.cargo) {
            let cargoEncontrado = cargos.find(c =>
              this.normalize(c.nome) === this.normalize(cand.cargo)
            );
            
            if (!cargoEncontrado) {
              cargoEncontrado = await this.prisma.cargo.create({
                data: { nome: cand.cargo.trim() },
                include: { areas: true }
              });
              cargos.push(cargoEncontrado);
            }

            cargoId = cargoEncontrado.id;
            
            if (cand.area) {
              let areaEncontrada = cargoEncontrado.areas.find(a =>
                this.normalize(a.nome) === this.normalize(cand.area)
              );
              
              if (!areaEncontrada) {
                areaEncontrada = await this.prisma.areaAtuacao.create({
                  data: {
                    nome: cand.area.trim(),
                    cargoId: cargoId
                  }
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
            let carreiraEncontrada = carreiras.find(c =>
              this.normalize(c.nome) === this.normalize(cand.carreira)
            );
            if (!carreiraEncontrada) {
              carreiraEncontrada = await this.prisma.carreira.create({
                data: { nome: cand.carreira.trim() }
              });
              carreiras.push(carreiraEncontrada);
            }
            carreiraId = carreiraEncontrada.id;
          }

          if (cand.nivel) {
            let niv = niveis.find(n => this.normalize(n.nome) === this.normalize(cand.nivel));
            if (!niv) {
              niv = await this.prisma.nivel.create({
                data: { nome: cand.nivel.trim() }
              });
              niveis.push(niv);
            }
            nivelId = niv.id;
          }

          // 6. Situação preliminar baseada em vagas
          const vagaCorrespondente = vagas.find(v => 
            v.cargoId === cargoId && 
            (v.areaAtuacaoId === areaAtuacaoId || (!v.areaAtuacaoId && !areaAtuacaoId)) && 
            (v.carreiraId === carreiraId || (!v.carreiraId && !carreiraId)) &&
            (v.nivelId === nivelId || (!v.nivelId && !nivelId)) &&
            (v.modalidadeId === modalidadeId || (!v.modalidadeId && !modalidadeId))
          );

          let situacao: 'APROVADO_CONVOCAVEL' | 'CADASTRO_RESERVA' = 'CADASTRO_RESERVA';
          if (vagaCorrespondente && (posicaoAmpla <= vagaCorrespondente.quantidadeVagas)) {
            situacao = 'APROVADO_CONVOCAVEL';
          }

          // 7. Upsert por CPF ou Número de Inscrição no Edital (Evitar duplicidade)
          const existente = await this.prisma.classificacaoCandidato.findFirst({
            where: {
              editalId,
              OR: [
                { cpfCandidato: cleanCpf },
                { numeroInscricao: String(cand.numeroInscricao) }
              ]
            },
          });

          // 7. Verificar se já existe um usuário com este CPF para vincular
          const usuarioExistente = await this.prisma.usuario.findUnique({ where: { cpf: cleanCpf } });

          const baseData = {
            nomeCandidato: String(cand.nome),
            numeroInscricao: String(cand.numeroInscricao),
            usuarioId: usuarioExistente?.id || null,
            posicaoAmpla: Number(posicaoAmpla),
            posicaoNegro: (posicaoNegro !== null && !isNaN(posicaoNegro)) ? Number(posicaoNegro) : null,
            posicaoPCD: (posicaoPCD !== null && !isNaN(posicaoPCD)) ? Number(posicaoPCD) : null,
            nota: (nota !== null && !isNaN(nota)) ? Number(nota) : null,
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
          console.error(`DETALHE DO ERRO - Candidato ${cand.nome || 'sem nome'} (Payload: ${JSON.stringify(cand)}):`, JSON.stringify(error, null, 2));
          console.error(`ERRO MESSAGE:`, error.message);
          errors.push(`Candidato ${cand.nome || 'sem nome'}: ${error.message.substring(0, 150)}...`);
        }
      }

      if (success.length === 0 && errors.length > 0) {
        throw new BadRequestException(`Falha total: ${errors[0]}`);
      }

      // Re-classificar automaticamente após importação
      await this.reprocessarSituacaoCandidatos(editalId);

      return { total: success.length, errors: errors.length > 0 ? errors : undefined };
    } catch (error) {
      console.error('Erro fatal na importação:', error);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`DEBUG-API: Erro interno: ${error.message}`);
    }
  }

  async create(editalId: string, data: any) {
    const { modalidadeId, cargoId, areaAtuacaoId, carreiraId, nivelId, situacao, ...rest } = data;
    
    // Validar duplicidade antes de criar
    const existente = await this.prisma.classificacaoCandidato.findFirst({
      where: {
        editalId,
        OR: [
          { cpfCandidato: rest.cpfCandidato },
          { numeroInscricao: rest.numeroInscricao }
        ]
      }
    });

    if (existente) {
      throw new BadRequestException(`Candidato já cadastrado neste edital com este CPF (${rest.cpfCandidato}) ou Inscrição (${rest.numeroInscricao}).`);
    }

    const usuarioExistente = await this.prisma.usuario.findUnique({ where: { cpf: rest.cpfCandidato } });

    return this.prisma.classificacaoCandidato.create({
      data: {
        ...rest,
        usuarioId: usuarioExistente?.id || null,
        posicao: rest.posicao || null,
        posicaoConvocacao: rest.posicaoConvocacao || null,
        situacao: situacao || 'CADASTRO_RESERVA',
        edital: { connect: { id: editalId } },
        modalidade: modalidadeId ? { connect: { id: modalidadeId } } : undefined,
        cargo: cargoId ? { connect: { id: cargoId } } : undefined,
        areaAtuacao: areaAtuacaoId ? { connect: { id: areaAtuacaoId } } : undefined,
        carreira: carreiraId ? { connect: { id: carreiraId } } : undefined,
        nivel: nivelId ? { connect: { id: nivelId } } : undefined,
      },
    });
  }

  async update(id: string, data: any) {
    const { modalidadeId, cargoId, areaAtuacaoId, carreiraId, nivelId, situacao, ...rest } = data;
    
    let usuarioId = undefined;
    if (rest.cpfCandidato) {
      const u = await this.prisma.usuario.findUnique({ where: { cpf: rest.cpfCandidato } });
      if (u) usuarioId = u.id;
    }

    return this.prisma.classificacaoCandidato.update({
      where: { id },
      data: {
        ...rest,
        ...(usuarioId && { usuarioId }),
        ...(situacao && { situacao }),
        posicao: rest.posicao === undefined ? undefined : (rest.posicao || null),
        posicaoConvocacao: rest.posicaoConvocacao === undefined ? undefined : (rest.posicaoConvocacao || null),
        modalidade: modalidadeId ? { connect: { id: modalidadeId } } : (modalidadeId === null ? { disconnect: true } : undefined),
        cargo: cargoId ? { connect: { id: cargoId } } : (cargoId === null ? { disconnect: true } : undefined),
        areaAtuacao: areaAtuacaoId ? { connect: { id: areaAtuacaoId } } : (areaAtuacaoId === null ? { disconnect: true } : undefined),
        carreira: carreiraId ? { connect: { id: carreiraId } } : (carreiraId === null ? { disconnect: true } : undefined),
        nivel: nivelId ? { connect: { id: nivelId } } : (nivelId === null ? { disconnect: true } : undefined),
      },
    });
  }

  async remove(id: string) {
    return this.prisma.classificacaoCandidato.delete({ where: { id } });
  }

  async confirmarDados(id: string, data: any) {
    const classificacao = await this.prisma.classificacaoCandidato.findUnique({
      where: { id },
      select: { cpfCandidato: true }
    });

    if (!classificacao) throw new BadRequestException('Classificação não encontrada');

    // Atualizar todas as classificações do mesmo CPF para manter sincronia
    return this.prisma.classificacaoCandidato.updateMany({
      where: { cpfCandidato: classificacao.cpfCandidato },
      data: {
        emailCandidato: data.emailCandidato,
        telefoneCandidato: data.telefoneCandidato,
        celularCandidato: data.celularCandidato,
        enderecoCandidato: data.enderecoCandidato,
        dadosConfirmados: true
      }
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
      }
    } as any);

    const grupos: Record<string, {
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
    }> = {};

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
      grupos[key].quantidadeVagas += vaga.quantidadeVagas;
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
        const vagasNoGrupo = (vagas as any[]).filter(v => 
          v.cargoId === grupo.cargoId && 
          (v.areaAtuacaoId || null) === (grupo.areaAtuacaoId || null) &&
          (v.carreiraId || null) === (grupo.carreiraId || null) &&
          (v.nivelId || null) === (grupo.nivelId || null)
        );

        const detalhesModalidades = vagasNoGrupo.map(v => ({
          modalidadeId: v.modalidadeId,
          modalidadeNome: v.modalidade?.nome || 'Geral',
          quantidade: v.quantidadeVagas,
        }));

        // Manter o mapa legado para compatibilidade se necessário, mas focar no novo array
        const vagasPorModalidade: Record<string, number> = {};
        for (const v of vagasNoGrupo) {
          if (v.modalidadeId) {
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
    // 1. Buscar todos os candidatos e vagas
    const candidatos = await this.prisma.classificacaoCandidato.findMany({
      where: { editalId },
      include: {
        cargo: true,
        areaAtuacao: true,
        modalidade: true,
        carreira: true,
        nivel: true,
      },
    });

    const vagas = await this.prisma.vagaEdital.findMany({
      where: { editalId },
      include: {
        cargo: true,
        areaAtuacao: true,
        carreira: true,
        nivel: true,
        modalidade: true,
      }
    });

    // 2. Identificar candidatos sem vaga correspondente ou com vagas insuficientes
    const alertas = [];
    const combinacoesVistas = new Set();

    // Map para acesso rápido por ID e soma de quantidades por chave
    const mapaVagas = new Map<string, number>();
    for (const v of vagas) {
      const key = `${v.cargoId}-${v.areaAtuacaoId || null}-${v.modalidadeId || null}-${v.carreiraId || null}-${v.nivelId || null}`;
      mapaVagas.set(key, (mapaVagas.get(key) || 0) + v.quantidadeVagas);
    }

    for (const cand of candidatos) {
      const keyCand = `${cand.cargoId}-${cand.areaAtuacaoId || null}-${cand.modalidadeId || null}-${cand.carreiraId || null}-${cand.nivelId || null}`;
      
      if (combinacoesVistas.has(keyCand)) continue;
      combinacoesVistas.add(keyCand);

      // Quantidade de candidatos nesta combinação exata
      const totalCandidatos = candidatos.filter(c => 
        (c.cargoId || null) === (cand.cargoId || null) && 
        (c.areaAtuacaoId || null) === (cand.areaAtuacaoId || null) && 
        (c.modalidadeId || null) === (cand.modalidadeId || null) &&
        (c.carreiraId || null) === (cand.carreiraId || null) &&
        (c.nivelId || null) === (cand.nivelId || null)
      ).length;

      // Buscar quantidade configurada (pelo ID ou fallback por Nome se necessário)
      let qtdConfigurada = mapaVagas.get(keyCand) || 0;

      // Se por ID não achou nada, tenta o fallback por nomes para evitar falso positivo de "Faltante"
      if (qtdConfigurada === 0) {
        const nomeCargo = this.normalize(cand.cargo?.nome);
        const nomeArea = this.normalize(cand.areaAtuacao?.nome || 'Geral');
        const nomeMod = this.normalize(cand.modalidade?.nome || 'Ampla Concorrencia');
        const nomeCarr = this.normalize(cand.carreira?.nome);
        const nomeNivel = this.normalize(cand.nivel?.nome);

        const vagaNome = vagas.find(v => 
          this.normalize(v.cargo?.nome) === nomeCargo &&
          this.normalize(v.areaAtuacao?.nome || 'Geral') === nomeArea &&
          this.normalize(v.modalidade?.nome || 'Ampla Concorrencia') === nomeMod &&
          this.normalize(v.carreira?.nome) === nomeCarr &&
          this.normalize(v.nivel?.nome) === nomeNivel
        );
        
        if (vagaNome) {
           // Se achou por nome, pega a soma de todas que batem com esse nome
           const vagasBatendoNome = vagas.filter(v => 
              this.normalize(v.cargo?.nome) === nomeCargo &&
              this.normalize(v.areaAtuacao?.nome || 'Geral') === nomeArea &&
              this.normalize(v.modalidade?.nome || 'Ampla Concorrencia') === nomeMod &&
              this.normalize(v.carreira?.nome) === nomeCarr &&
              this.normalize(v.nivel?.nome) === nomeNivel
           );
           qtdConfigurada = vagasBatendoNome.reduce((acc, curr) => acc + curr.quantidadeVagas, 0);
        }
      }

      // DECISÃO DE ALERTA:
      if (qtdConfigurada === 0) {
        // FALTA TOTAL
        alertas.push({
          tipo: 'FALTANTE',
          cargoId: cand.cargoId,
          areaAtuacaoId: cand.areaAtuacaoId || null,
          modalidadeId: cand.modalidadeId || null,
          carreiraId: cand.carreiraId || null,
          nivelId: cand.nivelId || null,
          cargo: cand.cargo?.nome || 'Não definido',
          area: cand.areaAtuacao?.nome || 'Geral',
          modalidade: cand.modalidade?.nome || 'Geral',
          carreira: cand.carreira?.nome || 'Não definida',
          nivel: cand.nivel?.nome || 'Não definido',
          candidatosAfetados: totalCandidatos,
          vagasConfiguradas: 0
        });
      } else if (qtdConfigurada < totalCandidatos) {
        // QUANTIDADE INSUFICIENTE
        alertas.push({
          tipo: 'INSUFICIENTE',
          cargoId: cand.cargoId,
          areaAtuacaoId: cand.areaAtuacaoId || null,
          modalidadeId: cand.modalidadeId || null,
          carreiraId: cand.carreiraId || null,
          nivelId: cand.nivelId || null,
          cargo: cand.cargo?.nome || 'Não definido',
          area: cand.areaAtuacao?.nome || 'Geral',
          modalidade: cand.modalidade?.nome || 'Geral',
          carreira: cand.carreira?.nome || 'Não definida',
          nivel: cand.nivel?.nome || 'Não definido',
          candidatosAfetados: totalCandidatos,
          vagasConfiguradas: qtdConfigurada
        });
      }
    }

    return alertas;
  }

  async reprocessarSituacaoCandidatos(editalId: string) {
    console.log(`[RECLASSIFICAR] Iniciando reprocessamento para edital ${editalId}`);
    
    // 1. Buscar todas as vagas configuradas
    const vagas = await this.prisma.vagaEdital.findMany({
      where: { editalId }
    });

    // 2. Resetar todos os candidatos deste edital para CADASTRO_RESERVA (Limpeza de segurança)
    await this.prisma.classificacaoCandidato.updateMany({
      where: { editalId },
      data: { situacao: 'CADASTRO_RESERVA' }
    });

    // 3. Para cada vaga, marcar os Top N que se qualificam
    const modalidades = await this.modalidadesConcorrenciaService.findAll();

    for (const vaga of vagas) {
      // Determinar filtro de cota baseado na modalidade da vaga
      const modVaga = modalidades.find(m => m.id === vaga.modalidadeId);
      const modNome = this.normalize(modVaga?.nome);
      
      const filterMod: any = {};
      let orderBy: any = { posicaoAmpla: 'asc' };
      if (modNome.includes('negro')) {
        filterMod.concorrenciaNegro = true;
        orderBy = { posicaoNegro: 'asc' };
      } else if (modNome.includes('deficien') || modNome.includes('pcd')) {
        filterMod.concorrenciaPCD = true;
        orderBy = { posicaoPCD: 'asc' };
      } else {
        filterMod.concorrenciaAmpla = true;
        orderBy = { posicaoAmpla: 'asc' };
      }

      const candidatosParaVaga = await this.prisma.classificacaoCandidato.findMany({
        where: {
          editalId,
          cargoId: vaga.cargoId,
          areaAtuacaoId: vaga.areaAtuacaoId,
          carreiraId: vaga.carreiraId,
          nivelId: vaga.nivelId,
          ...filterMod,
        },
        orderBy,
        take: vaga.quantidadeVagas
      });

      if (candidatosParaVaga.length > 0) {
        const idsAprovados = candidatosParaVaga.map(c => c.id);
        await this.prisma.classificacaoCandidato.updateMany({
          where: { id: { in: idsAprovados } },
          data: { situacao: 'APROVADO_CONVOCAVEL' }
        });
        console.log(`[RECLASSIFICAR] Vaga ${vaga.id}: ${idsAprovados.length} candidatos marcados como APROVADO_CONVOCAVEL`);
      }
    }

    return { message: 'Reprocessamento concluído com sucesso' };
  }
}
