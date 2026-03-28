'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import Link from 'next/link';

interface CandidatoHabilitado {
  id: string;
  nomeCandidato: string;
  cpfCandidato: string;
  nota?: number;
  posicaoAmpla: number;
  posicaoNegro?: number;
  posicaoPCD?: number;
  concorrenciaAmpla: boolean;
  concorrenciaNegro: boolean;
  concorrenciaPCD: boolean;
  tipoVaga?: string;
  modalidade?: { id: string, nome: string };
  situacao: string;
  posicaoConvocacao?: number;
  statusConvocacao?: string;
  emailCandidato?: string;
  telefoneCandidato?: string;
  celularCandidato?: string;
  enderecoCandidato?: string;
  numeroInscricao?: string;
}

export default function ClassificacaoPage() {
  const params = useParams();
  const router = useRouter();
  const editalId = params.id as string;
  
  const [candidatos, setCandidatos] = useState<CandidatoHabilitado[]>([]);
  const [loading, setLoading] = useState(true);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [edital, setEdital] = useState<any>(null);
  const [editingCandidato, setEditingCandidato] = useState<any>(null);
  const [modalidades, setModalidades] = useState<any[]>([]);
  
  // Novos estados para Vagas
  const [vagasEstatisticas, setVagasEstatisticas] = useState<any[]>([]);
  const [showVagasModal, setShowVagasModal] = useState(false);
  const [cargos, setCargos] = useState<any[]>([]);
  const [carreiras, setCarreiras] = useState<any[]>([]);
  const [niveis, setNiveis] = useState<any[]>([]);
  const [modelosFormulario, setModelosFormulario] = useState<any[]>([]);
  const [newVaga, setNewVaga] = useState<{
    cargoId: string;
    areaAtuacaoId: string;
    carreiraId: string;
    nivelId: string;
    modeloFormularioId: string;
    vagasPorModalidade: Record<string, number>;
  }>({ 
    cargoId: '', 
    areaAtuacaoId: '', 
    carreiraId: '', 
    nivelId: '', 
    modeloFormularioId: '',
    vagasPorModalidade: {} 
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [coverageData, setCoverageData] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [applyingSuggestions, setApplyingSuggestions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedCandidatos, setSelectedCandidatos] = useState<string[]>([]);
  const [selectedVagasCards, setSelectedVagasCards] = useState<string[]>([]);
  const [marking, setMarking] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [resC, resE, resM, resV, resCargos, resCa, resNi, resForms] = await Promise.all([
        fetch(`${API_URL}/editais/${editalId}/classificacao`, { headers }),
        fetch(`${API_URL}/editais/${editalId}`, { headers }),
        fetch(`${API_URL}/modalidades-concorrencia`, { headers }),
        fetch(`${API_URL}/editais/${editalId}/classificacao/estatisticas-vagas`, { headers }),
        fetch(`${API_URL}/cargos`, { headers }),
        fetch(`${API_URL}/carreiras`, { headers }),
        fetch(`${API_URL}/niveis`, { headers }),
        fetch(`${API_URL}/formularios`, { headers })
      ]);

      if (resC.ok) setCandidatos(await resC.json());
      if (resE.ok) setEdital(await resE.json());
      if (resM.ok) setModalidades(await resM.json());
      if (resV.ok) setVagasEstatisticas(await resV.json());
      if (resCargos.ok) setCargos(await resCargos.json());
      if (resCa.ok) setCarreiras(await resCa.json());
      if (resNi.ok) setNiveis(await resNi.json());
      if (resForms && resForms.ok) setModelosFormulario(await resForms.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoverageAnalysis = async () => {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/editais/${editalId}/classificacao/analise-cobertura`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCoverageData(await res.json());
        setShowCoverageModal(true);
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Erro na análise de vagas: ${error.message || 'Erro no servidor'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao tentar analisar vagas.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGerarFila = async () => {
    if (!confirm('Deseja gerar a fila de convocação intercalada para este edital? Isso atualizará o status de todos os candidatos.')) return;
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/editais/${editalId}/convocacao/gerar-fila`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Fila de convocação gerada com sucesso!');
        fetchData();
      } else {
        alert('Erro ao gerar fila de convocação.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };


  const handleQuickCreateVaga = (item: any) => {
    setEditingId(null);
    setNewVaga({
      cargoId: item.cargoId,
      areaAtuacaoId: item.areaAtuacaoId || '',
      carreiraId: item.carreiraId || '',
      nivelId: item.nivelId || '',
      modeloFormularioId: item.modeloFormularioId || '',
      vagasPorModalidade: {
        [item.modalidadeId]: 1 // Sugerir 1 vaga para a modalidade que disparou o alerta
      }
    });
    setShowCoverageModal(false);
    setShowVagasModal(true);
  };

  const handleApplyAllSuggestions = async () => {
    if (!confirm('Deseja aplicar todas as sugestões de vagas faltantes/insuficientes automaticamente?')) return;
    setApplyingSuggestions(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/vagas-edital/edital/${editalId}/aplicar-sugestoes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Sugestões aplicadas com sucesso!');
        setShowCoverageModal(false);
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Erro ao aplicar sugestões: ${err.message || 'Erro no servidor'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao aplicar sugestões.');
    } finally {
      setApplyingSuggestions(false);
    }
  };

  const handleEditVaga = (vaga: any) => {
    setEditingId(vaga.id);
    setNewVaga({
      cargoId: vaga.cargoId,
      areaAtuacaoId: vaga.areaAtuacaoId || '',
      carreiraId: vaga.carreiraId || '',
      nivelId: vaga.nivelId || '',
      modeloFormularioId: vaga.modeloFormularioId || '',
      vagasPorModalidade: vaga.vagasPorModalidade || {}
    });
    setShowVagasModal(true);
  };

  const handleDeleteVaga = async (vaga: any) => {
    if (!confirm(`Tem certeza que deseja excluir toda a configuração de vagas para ${vaga.cargoNome}${vaga.areaNome !== 'Geral' ? ' / ' + vaga.areaNome : ''}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/vagas-edital/${vaga.id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (res.ok) {
        alert('Configuração de vagas excluída com sucesso!');
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Erro ao excluir configuração de vaga: ${errorData.message || 'Erro no servidor'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [editalId]);

  const handleImport = async () => {
    const lines = importText.trim().split(/\r?\n/);
    if (lines.length < 2) return;

    const headers = lines[0].toUpperCase().split(';').map(h => h.trim());
    const dataLines = lines.slice(1);

    const getIndex = (possibleHeaders: string[]) => {
      for (const h of possibleHeaders) {
        const idx = headers.indexOf(h.toUpperCase());
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const idxInscricao = getIndex(['INSCRICAO', 'INSC', 'INSCRIÇÃO']);
    const idxCpf = getIndex(['CPF']);
    const idxNome = getIndex(['NOME', 'CANDIDATO']);
    const idxNota = getIndex(['NOTA']);
    const idxPosAmpla = getIndex(['POS_AMPLA', 'POS_AMPLA', 'POSICAO', 'POS', 'POS_GERAL', 'AMPLA CONCORRENCIA', 'POSICAO AMPLA']);
    const idxPosNegro = getIndex(['POS_NEGRO', 'POS_NEGRO', 'POSICAO NEGRO', 'NEGRO', 'POSICAO_NEGRO']);
    const idxPosPCD = getIndex(['POS_PCD', 'POS_PCD', 'POSICAO PCD', 'PCD', 'POSICAO_PCD']);
    const idxCargo = getIndex(['CARGO', 'FUNÇÃO', 'FUNCAO']);
    const idxArea = getIndex(['AREA', 'ÁREA', 'AREA ATUACAO', 'AREA_ATUACAO', 'ESPECIALIDADE']);
    const idxCarreira = getIndex(['CARREIRA']);
    const idxNivel = getIndex(['NIVEL', 'NÍVEL']);
    const idxEmail = getIndex(['EMAIL', 'E-MAIL']);
    const idxTelefone = getIndex(['TELEFONE', 'TELEFONE FIXO']);
    const idxCelular = getIndex(['CELULAR']);
    const idxEndereco = getIndex(['ENDERECO', 'ENDEREÇO']);

    const parsed = dataLines.map((line) => {
      const parts = line.split(';').map(s => s.trim());
      if (parts.length < 3) return null;

      const getVal = (idx: number) => (idx !== -1 && parts[idx]) ? parts[idx] : undefined;

      const numeroInscricao = getVal(idxInscricao);
      const cpf = getVal(idxCpf);
      const nome = getVal(idxNome);
      const notaRaw = getVal(idxNota);
      const posicaoAmpla = getVal(idxPosAmpla);
      const posicaoNegro = getVal(idxPosNegro);
      const posicaoPCD = getVal(idxPosPCD);
      const cargo = getVal(idxCargo);
      const area = getVal(idxArea);
      const carreira = getVal(idxCarreira);
      const nivel = getVal(idxNivel);
      const email = getVal(idxEmail);
      const telefone = getVal(idxTelefone);
      const celular = getVal(idxCelular);
      const endereco = getVal(idxEndereco);

      return { 
        numeroInscricao, 
        cpf, 
        nome, 
        nota: notaRaw ? parseFloat(notaRaw.replace(',', '.')) : undefined,
        posicaoAmpla: posicaoAmpla ? parseInt(posicaoAmpla) : 0, 
        posicaoNegro: (posicaoNegro && !isNaN(parseInt(posicaoNegro))) ? parseInt(posicaoNegro) : undefined,
        posicaoPCD: (posicaoPCD && !isNaN(parseInt(posicaoPCD))) ? parseInt(posicaoPCD) : undefined,
        cargo,
        area,
        carreira,
        nivel,
        email,
        telefone,
        celular,
        endereco
      };
    }).filter((c): c is any => c !== null && !!c.nome && !!c.cpf && !!c.numeroInscricao);

    if (parsed.length === 0) {
      alert('Nenhum dado válido encontrado no CSV. Verifique cabeçalho (;) e nomes das colunas.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/editais/${editalId}/classificacao/importar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ candidatos: parsed }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.errors && data.errors.length > 0) {
          alert(`Importados ${data.total} candidatos. Algumas linhas falharam:\n\n${data.errors.join('\n')}`);
        } else {
          alert(`${data.total} candidatos importados com sucesso!`);
        }
        setShowImport(false);
        setImportText('');
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || 'DEBUG-WEB: Erro ao importar (sem mensagem da API).');
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const isEdit = !!editingCandidato.id;
      const url = isEdit 
        ? `${API_URL}/editais/${editalId}/classificacao/${editingCandidato.id}`
        : `${API_URL}/editais/${editalId}/classificacao`;
      
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nomeCandidato: editingCandidato.nomeCandidato,
          cpfCandidato: editingCandidato.cpfCandidato,
          numeroInscricao: editingCandidato.numeroInscricao,
          nota: editingCandidato.nota ? parseFloat(String(editingCandidato.nota).replace(',', '.')) : undefined,
          posicaoAmpla: parseInt(editingCandidato.posicaoAmpla) || 0,
          posicaoNegro: editingCandidato.posicaoNegro ? parseInt(editingCandidato.posicaoNegro) : null,
          posicaoPCD: editingCandidato.posicaoPCD ? parseInt(editingCandidato.posicaoPCD) : null,
          concorrenciaAmpla: editingCandidato.concorrenciaAmpla,
          concorrenciaNegro: !!editingCandidato.posicaoNegro,
          concorrenciaPCD: !!editingCandidato.posicaoPCD,
          cargoId: editingCandidato.cargoId,
          areaAtuacaoId: editingCandidato.areaAtuacaoId,
          carreiraId: editingCandidato.carreiraId,
          nivelId: editingCandidato.nivelId,
          emailCandidato: editingCandidato.emailCandidato,
          telefoneCandidato: editingCandidato.telefoneCandidato,
          celularCandidato: editingCandidato.celularCandidato,
          enderecoCandidato: editingCandidato.enderecoCandidato,
        }),
      });

      if (res.ok) {
        setEditingCandidato(null);
        fetchData();
      } else {
        alert(`Erro ao ${isEdit ? 'atualizar' : 'cadastrar'} candidato.`);
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  };

  const handleSaveVaga = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const vagasPayload = Object.entries(newVaga.vagasPorModalidade)
        .map(([modalId, qty]) => ({ modalidadeId: modalId, quantidadeVagas: qty }));

      if (vagasPayload.length === 0) {
        alert('Informe pelo menos uma vaga para alguma modalidade.');
        return;
      }

      const res = await fetch(`${API_URL}/vagas-edital/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          editalId,
          cargoId: newVaga.cargoId,
          areaAtuacaoId: newVaga.areaAtuacaoId,
          carreiraId: newVaga.carreiraId,
          nivelId: newVaga.nivelId,
          modeloFormularioId: newVaga.modeloFormularioId || null,
          vagas: vagasPayload 
        }),
      });

      if (res.ok) {
        setShowVagasModal(false);
        setEditingId(null);
        setNewVaga({ cargoId: '', areaAtuacaoId: '', carreiraId: '', nivelId: '', modeloFormularioId: '', vagasPorModalidade: {} });
        fetchData();
      } else {
        const error = await res.json();
        alert(`Erro ao salvar vagas: ${error.message || 'Erro inesperado'}`);
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  };

  const selectedCargo = cargos.find(c => c.id === newVaga.cargoId);

  const handleMarcarConvocacao = async () => {
    if(selectedCandidatos.length === 0) return;
    setMarking(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/editais/${editalId}/convocacoes/marcar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ candidatosIds: selectedCandidatos })
      });
      if (!res.ok) throw new Error('Falha ao marcar candidatos');
      setSelectedCandidatos([]);
      await fetchData();
      alert('Candidatos marcados com sucesso e enviados para a aba Controle de Convocação!');
    } catch (err) {
      alert('Erro ao marcar para convocação');
    } finally {
      setMarking(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCandidatos.length === 0) return;
    if (!confirm(`Deseja excluir permanentemente os ${selectedCandidatos.length} candidatos selecionados?`)) return;

    setMarking(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/editais/${editalId}/classificacao/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedCandidatos })
      });

      if (!res.ok) throw new Error('Falha ao excluir candidatos');
      
      setSelectedCandidatos([]);
      await fetchData();
      alert('Candidatos excluídos com sucesso!');
    } catch (err) {
      alert('Erro ao excluir candidatos em massa');
    } finally {
      setMarking(false);
    }
  };

  const handleBulkDeleteVagas = async () => {
    if (selectedVagasCards.length === 0) return;
    if (!confirm(`Deseja excluir permanentemente as ${selectedVagasCards.length} configurações de vagas selecionadas?`)) return;

    setMarking(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/vagas-edital/bulk-delete-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ editalId, ids: selectedVagasCards })
      });

      if (!res.ok) throw new Error('Falha ao excluir vagas');
      
      setSelectedVagasCards([]);
      await fetchData();
      alert('Configurações de vagas excluídas com sucesso!');
    } catch (err) {
      alert('Erro ao excluir vagas em massa');
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/funcionario/editais" className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Lista de Habilitados</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">
            {edital?.titulo || 'Carregando...'} • {edital?.ano}
          </p>
        </div>
      </div>

      {/* Painel de Estatísticas de Vagas */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedVagasCards(vagasEstatisticas.map(v => v.id));
              } else {
                setSelectedVagasCards([]);
              }
            }}
            checked={vagasEstatisticas.length > 0 && selectedVagasCards.length === vagasEstatisticas.length}
          />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Todas</span>
        </div>
        {selectedVagasCards.length > 0 && (
          <button 
            onClick={handleBulkDeleteVagas}
            disabled={marking}
            className="px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 border border-rose-100"
          >
            Excluir Selecionadas ({selectedVagasCards.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vagasEstatisticas.map((v) => (
          <div key={v.id} className={`bg-white p-6 rounded-[24px] shadow-sm border transition-all flex flex-col justify-between hover:shadow-md ${selectedVagasCards.includes(v.id) ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-100'}`}>
            <div>
              <div className="relative">
                <div className="absolute top-0 right-0 flex gap-1 -mt-1 -mr-1">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer mr-2 mt-1"
                    checked={selectedVagasCards.includes(v.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVagasCards([...selectedVagasCards, v.id]);
                      } else {
                        setSelectedVagasCards(selectedVagasCards.filter(id => id !== v.id));
                      }
                    }}
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEditVaga(v); }}
                    className="p-1.5 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    title="Editar Configuração"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteVaga(v); }}
                    className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    title="Excluir Configuração"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
                <div className="flex justify-between items-start mb-2 gap-2 pr-12">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest truncate">{v.cargoNome}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase flex-shrink-0 ${v.disponivel > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {v.disponivel > 0 ? `${v.disponivel} Vagas` : 'Esgotado'}
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900 leading-tight mb-1">{v.areaNome}</h3>
                {v.modeloFormularioNome && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">Formulário: {v.modeloFormularioNome}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter mb-1">
                  <span className="text-slate-400">Total Habilitados</span>
                  <span className="text-slate-900">{v.candidatosHabilitados} / {v.quantidadeVagas}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ease-out bg-emerald-500`}
                    style={{ width: `${Math.min(100, (v.candidatosHabilitados / (v.quantidadeVagas || 1)) * 100)}%` }}
                  />
                </div>
              </div>
              
              {v.detalhesModalidades && v.detalhesModalidades.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                  {v.detalhesModalidades.map((dm: any) => (
                    <div key={dm.modalidadeId} className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{dm.modalidadeNome}:</span>
                      <span className="text-[10px] font-black text-slate-700">{dm.quantidade}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <button 
          onClick={() => setShowVagasModal(true)}
          className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-[24px] flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-white transition-all group min-h-[120px]"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Configurar Vagas</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex gap-4">
             <div className="bg-emerald-50 px-4 py-2 rounded-2xl">
                <span className="text-[10px] font-black text-emerald-600 uppercase block mb-0.5">Total Habilitados</span>
                <span className="text-xl font-black text-emerald-900">{candidatos.length}</span>
             </div>
          </div>
          <div className="flex gap-3">
            {selectedCandidatos.length > 0 && (
              <button 
                onClick={handleMarcarConvocacao}
                disabled={marking}
                className="px-6 py-3 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all flex items-center gap-2 shadow-lg shadow-amber-100"
              >
                {marking ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                )}
                Marcar para Convocação ({selectedCandidatos.length})
              </button>
            )}
            {selectedCandidatos.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                disabled={marking}
                className="px-6 py-3 bg-rose-50 text-rose-600 font-black rounded-2xl hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 border border-rose-100 shadow-lg shadow-rose-100/50"
              >
                {marking ? (
                  <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                )}
                Excluir Selecionados ({selectedCandidatos.length})
              </button>
            )}
            <button 
              onClick={handleGerarFila}
              disabled={generating}
              className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
            >
              {generating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              )}
              Gerar Fila de Convocação
            </button>
            <button 
              onClick={fetchCoverageAnalysis}
              disabled={analyzing}
              className="px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              {analyzing ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              )}
              Análise de Vagas
            </button>
             <button 
              onClick={() => setEditingCandidato({ 
                nomeCandidato: '', 
                cpfCandidato: '', 
                numeroInscricao: '', 
                nota: '',
                posicaoAmpla: '',
                posicaoNegro: '',
                posicaoPCD: '',
                concorrenciaAmpla: true,
                concorrenciaNegro: false,
                concorrenciaPCD: false,
                cargoId: '',
                areaAtuacaoId: '',
                carreiraId: '',
                nivelId: '',
                emailCandidato: '',
                telefoneCandidato: '',
                celularCandidato: '',
                enderecoCandidato: '',
              })}
              className="px-6 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Adicionar Candidato
            </button>
            <button 
              onClick={() => setShowImport(true)}
              className="px-6 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Importar Listas
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-5 w-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCandidatos(candidatos.map(c => c.id));
                      } else {
                        setSelectedCandidatos([]);
                      }
                    }}
                    checked={selectedCandidatos.length > 0 && selectedCandidatos.length === candidatos.length}
                  />
                </th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inscrição</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidato</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nota</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialização</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lista / Convocação</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documentos</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...candidatos].sort((a, b) => {
                if (a.posicaoConvocacao && b.posicaoConvocacao) return a.posicaoConvocacao - b.posicaoConvocacao;
                if (a.posicaoConvocacao) return -1;
                if (b.posicaoConvocacao) return 1;
                return (a.posicaoAmpla || 0) - (b.posicaoAmpla || 0);
              }).map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                        checked={selectedCandidatos.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCandidatos([...selectedCandidatos, c.id]);
                          } else {
                            setSelectedCandidatos(selectedCandidatos.filter(id => id !== c.id));
                          }
                        }}
                      />
                  </td>
                  <td className="px-4 py-5 font-black text-slate-900">{c.numeroInscricao}</td>
                  <td className="px-8 py-5">

                    <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{c.nomeCandidato}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">CPF: {c.cpfCandidato}</div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                      {c.nota ? Number(c.nota).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '-'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-xs font-black text-emerald-600 uppercase tracking-tight">{c.cargo?.nome || 'Não definido'}</div>
                    <div className="text-sm font-bold text-slate-900">{c.areaAtuacao?.nome || 'Geral'}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                      {c.carreira?.nome || 'N/A'} • {c.nivel?.nome || 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2">
                          {c.posicaoConvocacao ? (
                            <div className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-xl shadow-lg shadow-indigo-100 animate-in zoom-in duration-500">
                               <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Conv.</span>
                               <span className="text-base font-black">{c.posicaoConvocacao}º</span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                               <span className="text-base font-black text-slate-900">A: {c.posicaoAmpla}º</span>
                               {c.posicaoNegro && <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">N: {c.posicaoNegro}º</span>}
                               {c.posicaoPCD && <span className="text-[9px] font-bold text-sky-600 uppercase tracking-tighter">P: {c.posicaoPCD}º</span>}
                             </div>
                          )}
                          <div className="flex flex-wrap gap-1">
                             {(c as any).concorrenciaAmpla && (
                               <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-slate-200">Ampla</span>
                             )}
                             {(c as any).concorrenciaNegro && (
                               <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[8px] font-black uppercase tracking-widest border border-amber-200">Negro</span>
                             )}
                             {(c as any).concorrenciaPCD && (
                               <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-md text-[8px] font-black uppercase tracking-widest border border-sky-200">PCD</span>
                             )}
                          </div>
                       </div>
                       
                       {c.situacao && (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                            c.situacao === 'APROVADO_CONVOCAVEL' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {c.situacao.replace(/_/g, ' ')}
                          </span>
                          {c.posicaoConvocacao && (
                            <span className="text-[8px] font-black text-slate-400 italic">Lista Geral: #{c.posicaoAmpla}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {c.envios && c.envios.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-widest w-fit">
                          {c.envios.length} Enviado(s)
                        </span>
                        {c.statusConvocacao && (
                          <span className="text-[9px] font-black text-emerald-600 uppercase italic font-bold">
                            Status: {c.statusConvocacao.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-300 uppercase italic">Nenhum envio</span>
                        {c.situacao === 'APROVADO_CONVOCAVEL' && (
                          <span className="text-[8px] font-black text-rose-500 uppercase animate-pulse">Aguardando Documentos</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right flex gap-2 justify-end">
                    <button 
                      onClick={() => setEditingCandidato({...c})}
                      className="p-2 text-slate-300 hover:text-emerald-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>
                    <button 
                      onClick={async () => {
                        if(!confirm('Remover candidato habilitado?')) return;
                        const res = await fetch(`${API_URL}/editais/${editalId}/classificacao/${c.id}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });
                        if(res.ok) fetchData();
                      }}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {candidatos.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-slate-400 font-bold italic">Nenhum candidato habilitado para este edital. Clique em "Importar Listas".</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Configuração de Vagas */}
      {showVagasModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-10 space-y-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-50 pb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{editingId ? 'Editar Configuração' : 'Configurar Vagas'}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Defina a oferta de especializações para este edital</p>
              </div>
              <button 
                onClick={() => { setShowVagasModal(false); setEditingId(null); setNewVaga({ cargoId: '', areaAtuacaoId: '', carreiraId: '', nivelId: '', modeloFormularioId: '', vagasPorModalidade: {} }); }} 
                className="text-slate-200 hover:text-slate-900 transition-all"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSaveVaga} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cargo</label>
                  <select 
                    required
                    value={newVaga.cargoId}
                    onChange={e => setNewVaga({...newVaga, cargoId: e.target.value, areaAtuacaoId: ''})}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm text-slate-700 appearance-none"
                  >
                    <option value="">Selecione o Cargo</option>
                    {cargos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Área de Atuação</label>
                  <select 
                    value={newVaga.areaAtuacaoId}
                    onChange={e => setNewVaga({...newVaga, areaAtuacaoId: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm text-slate-700 appearance-none"
                    disabled={!newVaga.cargoId}
                  >
                    <option value="">Geral / Sem Área</option>
                    {selectedCargo?.areas?.map((a: any) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Carreira</label>
                  <select 
                    required
                    value={newVaga.carreiraId}
                    onChange={e => setNewVaga({...newVaga, carreiraId: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm text-slate-700 appearance-none"
                  >
                    <option value="">Selecione a Carreira</option>
                    {carreiras.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nível</label>
                  <select 
                    required
                    value={newVaga.nivelId}
                    onChange={e => setNewVaga({...newVaga, nivelId: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm text-slate-700 appearance-none"
                  >
                    <option value="">Selecione o Nível</option>
                    {niveis.map(n => <option key={n.id} value={n.id}>{n.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Modelo de Formulário para o Candidato</label>
                <select 
                  value={newVaga.modeloFormularioId}
                  onChange={e => setNewVaga({...newVaga, modeloFormularioId: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm text-slate-700 appearance-none"
                >
                  <option value="">Selecione o Modelo de Formulário</option>
                  {modelosFormulario.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
                <p className="text-[9px] text-slate-400 font-bold italic ml-1">O candidato convocado para esta vaga preencherá este formulário eletronicamente.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vagas por Modalidade</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {modalidades.map(m => (
                    <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-200 focus-within:border-emerald-500 transition-all">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter block mb-2">{m.nome}</label>
                      <input 
                        type="number" min="0"
                        placeholder="0"
                        value={newVaga.vagasPorModalidade[m.id] || ''}
                        onChange={e => setNewVaga({
                          ...newVaga, 
                          vagasPorModalidade: {
                            ...newVaga.vagasPorModalidade,
                            [m.id]: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full bg-transparent outline-none font-black text-slate-900 border-b border-slate-100 focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pr-2 pt-2">
                <button type="submit" className="px-8 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex-shrink-0">
                  {editingId ? 'Salvar Alterações' : 'Adicionar Ofertas'}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vagas já Configuradas</h3>
              <div className="divide-y divide-slate-50 border border-slate-100 rounded-3xl overflow-hidden">
                {vagasEstatisticas.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-bold italic bg-slate-50/30">Nenhuma vaga configurada para este edital.</div>
                ) : (
                  vagasEstatisticas.map(v => (
                    <div key={v.id} className="p-4 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors group">
                      <div>
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">{v.cargoNome}</div>
                        <div className="text-sm font-black text-slate-900">{v.areaNome}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-[10px] font-black text-slate-300 uppercase">Vagas</div>
                          <div className="text-sm font-black text-slate-900">{v.quantidadeVagas}</div>
                        </div>
                        <button 
                          onClick={() => handleDeleteVaga(v)}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-all"
                          title="Excluir toda esta configuração de vagas"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
             <div className="flex justify-end pt-4">
                <button 
                  onClick={() => { setShowVagasModal(false); setEditingId(null); setNewVaga({ cargoId: '', areaAtuacaoId: '', carreiraId: '', nivelId: '', modeloFormularioId: '', vagasPorModalidade: {} }); }} 
                  className="px-8 py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-[.2em] rounded-[20px] hover:bg-emerald-600 transition-all shadow-xl"
                >
                  Concluir Configuração
                </button>
             </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-10 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Importação em Massa</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Cole os dados da banca examinadora abaixo</p>
              </div>
              <button onClick={() => setShowImport(false)} className="text-slate-200 hover:text-slate-900 transition-all">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
              <p className="text-sm text-emerald-700 leading-relaxed font-bold">
                Cole cada candidato em uma linha seguindo o padrão:<br/>
                <code className="bg-white px-2 py-0.5 rounded-md text-emerald-900 font-black text-[10px]">INSCRICAO;CPF;NOME;NOTA;POS_AMPLA;POS_NEGRO;POS_PCD;CARGO;AREA;CARREIRA;NIVEL;EMAIL;TELEFONE;CELULAR;ENDERECO</code>
              </p>
              <p className="text-[10px] text-emerald-600 mt-2 italic font-bold pr-10">Ex: 2026001;123.456.789-00;MANOEL SILVA;85,50;1;;;PROFESSOR;MATEMATICA;MAGISTERIO;SUPERIOR;teste@email.com;(75) 3333-3333;(75) 99999-9999;Rua Teste, 10, Bairro Cento, Cidade-BA</p>
              <a 
                href="/modelo_importacao.csv" 
                download="modelo_importacao.csv"
                className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 hover:bg-white text-emerald-900 rounded-lg text-[10px] font-black transition-all border border-emerald-200"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Baixar Modelo CSV
              </a>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center group hover:bg-white hover:border-emerald-500 transition-all cursor-pointer">
                <input 
                  type="file" 
                  id="csv-file-modal" 
                  accept=".csv,.txt"
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <label htmlFor="csv-file-modal" className="cursor-pointer space-y-2">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Enviar Arquivo .CSV</span>
                </label>
              </div>
            <textarea 
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="w-full h-80 px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-mono text-xs font-bold text-slate-700 placeholder:text-slate-300"
              placeholder="2026001;123.456.789-00;MANOEL SILVA;85,50;1;;;PROFESSOR;MATEMATICA;MAGISTERIO;SUPERIOR"
            />

            <div className="flex gap-4 justify-end pt-4">
              <button 
                onClick={() => setShowImport(false)}
                className="px-8 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleImport}
                className="px-10 py-4 bg-emerald-600 text-white font-black uppercase text-xs tracking-[.2em] rounded-[20px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
              >
                Processar e Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCandidato && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full p-10 space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{editingCandidato.id ? 'Editar' : 'Novo'} Habilitado</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {editingCandidato.id ? 'Ajuste os dados cadastrais' : 'Preencha os dados do novo candidato'}
                  </p>
                </div>
                <button onClick={() => setEditingCandidato(null)} className="text-slate-200 hover:text-slate-900 transition-all">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nome Completo</label>
                  <input 
                    type="text" required
                    value={editingCandidato.nomeCandidato}
                    onChange={e => setEditingCandidato({...editingCandidato, nomeCandidato: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">CPF</label>
                    <input 
                      type="text" required
                      value={editingCandidato.cpfCandidato}
                      onChange={e => setEditingCandidato({...editingCandidato, cpfCandidato: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Inscrição</label>
                    <input 
                      type="text" required
                      value={editingCandidato.numeroInscricao}
                      onChange={e => setEditingCandidato({...editingCandidato, numeroInscricao: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nota</label>
                    <input 
                      type="text"
                      value={editingCandidato.nota || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, nota: e.target.value})}
                      placeholder="0,00"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Posição Ampla (Obrigatória)</label>
                    <input 
                      type="number" required
                      value={editingCandidato.posicaoAmpla || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, posicaoAmpla: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Posição Negro</label>
                    </div>
                    <input 
                      type="number"
                      value={editingCandidato.posicaoNegro || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, posicaoNegro: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Posição PCD</label>
                    </div>
                    <input 
                      type="number"
                      value={editingCandidato.posicaoPCD || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, posicaoPCD: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Carreira</label>
                    <select 
                      value={editingCandidato.carreiraId || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, carreiraId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-slate-800 appearance-none"
                    >
                      <option value="">Selecione a Carreira</option>
                      {carreiras.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nível</label>
                    <select 
                      value={editingCandidato.nivelId || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, nivelId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-slate-800 appearance-none"
                    >
                      <option value="">Selecione o Nível</option>
                      {niveis.map(n => (
                        <option key={n.id} value={n.id}>{n.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cargo</label>
                    <select 
                      value={editingCandidato.cargoId || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, cargoId: e.target.value, areaAtuacaoId: ''})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-slate-800 appearance-none"
                    >
                      <option value="">Selecione o Cargo</option>
                      {cargos.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Área de Atuação</label>
                    <select 
                      value={editingCandidato.areaAtuacaoId || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, areaAtuacaoId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-slate-800 appearance-none"
                      disabled={!editingCandidato.cargoId}
                    >
                      <option value="">Geral / Sem Área</option>
                      {cargos.find(c => c.id === editingCandidato.cargoId)?.areas?.map((a: any) => (
                        <option key={a.id} value={a.id}>{a.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">E-mail</label>
                    <input 
                      type="email"
                      value={editingCandidato.emailCandidato || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, emailCandidato: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Celular</label>
                    <input 
                      type="text"
                      value={editingCandidato.celularCandidato || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, celularCandidato: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Telefone Fixo</label>
                    <input 
                      type="text"
                      value={editingCandidato.telefoneCandidato || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, telefoneCandidato: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Endereço de Correspondência</label>
                    <input 
                      type="text"
                      value={editingCandidato.enderecoCandidato || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, enderecoCandidato: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-6">
                  <button 
                    type="button"
                    onClick={() => setEditingCandidato(null)}
                    className="px-8 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-10 py-4 bg-emerald-600 text-white font-black uppercase text-xs tracking-[.2em] rounded-[20px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* Modal de Análise de Cobertura */}
      {showCoverageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 italic">Análise de Cobertura</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Diagnóstico de configurações do Edital</p>
              </div>
              <button 
                onClick={() => setShowCoverageModal(false)}
                className="p-3 hover:bg-white hover:shadow-lg rounded-2xl transition-all text-slate-400 hover:text-rose-500"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {coverageData.length === 0 ? (
                <div className="text-center py-12">
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                   </div>
                   <h4 className="text-2xl font-black text-slate-900 mb-2">Tudo Configurado!</h4>
                   <p className="text-slate-500 font-bold">Todos os candidatos possuem vagas correspondentes cadastradas no edital.</p>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className={`p-6 ${coverageData.some(d => d.tipo === 'INSUFICIENTE') ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'} rounded-3xl flex items-center gap-6`}>
                      <div className={`w-12 h-12 ${coverageData.some(d => d.tipo === 'INSUFICIENTE') ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      </div>
                      <div>
                         <h4 className={`font-black ${coverageData.some(d => d.tipo === 'INSUFICIENTE') ? 'text-amber-900' : 'text-rose-900'}`}>Inconsistências de Vagas Detectadas</h4>
                         <p className={`text-sm ${coverageData.some(d => d.tipo === 'INSUFICIENTE') ? 'text-amber-700' : 'text-rose-700'} font-bold`}>
                           Identificamos <span className="underline">{coverageData.length} problemas</span> que precisam de atenção.
                         </p>
                      </div>
                   </div>

                   <div className="overflow-hidden rounded-3xl border border-slate-100">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50">
                          <tr className="bg-slate-50/50">
                               <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Problema</th>
                               <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo / Área</th>
                               <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Modalidade</th>
                               <th className="text-center py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vagas</th>
                               <th className="text-center py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Habilitados</th>
                               <th className="text-center py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {coverageData.map((item, idx) => (
                               <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                  <td className="py-4 px-6">
                                     <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter ${item.tipo === 'FALTANTE' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {item.tipo === 'FALTANTE' ? 'Não Configurado' : 'Qtd Insuficiente'}
                                     </span>
                                  </td>
                                  <td className="py-4 px-6">
                                     <div className="text-xs font-black text-slate-900">{item.cargo}</div>
                                     <div className="text-[10px] font-bold text-slate-400 uppercase">{item.area}</div>
                                  </td>
                                  <td className="py-4 px-6">
                                     <div className="text-[10px] font-black text-slate-600 uppercase tracking-tighter bg-slate-100 inline-block px-2 py-1 rounded-lg">
                                        {item.modalidade}
                                     </div>
                                  </td>
                                  <td className="py-4 px-6 text-center">
                                     <span className={`text-xs font-black ${item.tipo === 'INSUFICIENTE' ? 'text-amber-600' : 'text-slate-400 italic'}`}>
                                        {item.vagasConfiguradas}
                                     </span>
                                  </td>
                                  <td className="py-4 px-6 text-center">
                                     <span className="text-xs font-black text-slate-900">{item.candidatosAfetados}</span>
                                  </td>
                                  <td className="py-4 px-6 text-center">
                                     <button 
                                        onClick={() => handleQuickCreateVaga(item)}
                                        className="px-4 py-2 bg-white border border-slate-200 text-[10px] font-black uppercase text-slate-600 rounded-xl hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
                                     >
                                        {item.tipo === 'FALTANTE' ? 'Cadastrar Vaga' : 'Ajustar Vagas'}
                                     </button>
                                  </td>
                               </tr>
                             ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
               <button 
                 onClick={() => setShowCoverageModal(false)}
                 className="px-6 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all"
               >
                 Fechar Análise
               </button>
               {coverageData.length > 0 && (
                 <button 
                    onClick={handleApplyAllSuggestions}
                    disabled={applyingSuggestions}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50"
                 >
                    {applyingSuggestions ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    )}
                    Aplicar Todas as Sugestões
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
