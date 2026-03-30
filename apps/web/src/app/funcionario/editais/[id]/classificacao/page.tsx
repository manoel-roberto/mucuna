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
  cargo?: { id: string, nome: string };
  areaAtuacao?: { id: string, nome: string };
  carreira?: { id: string, nome: string };
  nivel?: { id: string, nome: string };
  envios?: any[];
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
    vagasImediatas: number;
    vagasReserva: number;
    justificativa: string;
  }>({ 
    cargoId: '', 
    areaAtuacaoId: '', 
    carreiraId: '', 
    nivelId: '', 
    modeloFormularioId: '',
    vagasImediatas: 0,
    vagasReserva: 0,
    justificativa: ''
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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCandidatos = candidatos.filter(c => 
    c.nomeCandidato.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.cpfCandidato.includes(searchQuery) ||
    c.numeroInscricao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.cargo?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.areaAtuacao?.nome?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    const totalGeral = item.candidatosAfetados || 1;

    setNewVaga({
      cargoId: item.cargoId,
      areaAtuacaoId: item.areaAtuacaoId || '',
      carreiraId: item.carreiraId || '',
      nivelId: item.nivelId || '',
      modeloFormularioId: item.modeloFormularioId || '',
      vagasImediatas: totalGeral,
      vagasReserva: 0,
      justificativa: `Criação automática sugerida para ${item.modalidade || 'concorrência faltante'}.`
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
      vagasImediatas: (vaga.vagasACImediatas || 0) + (vaga.vagasNEGImediatas || 0) + (vaga.vagasPCDImediatas || 0),
      vagasReserva: (vaga.vagasACReserva || 0) + (vaga.vagasNEGReserva || 0) + (vaga.vagasPCDReserva || 0),
      justificativa: ''
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

  const calcCota = (t: number, p: number, type: 'negro' | 'pcd') => {
    if (t === 0) return 0;
    const r = t * (p / 100);
    let f = (r - Math.floor(r)) >= 0.5 ? Math.ceil(r) : Math.floor(r);
    if (type === 'negro' && t >= 5 && f < 1) f = 1;
    if (type === 'pcd' && t >= 20 && f < 1) f = 1;
    return f;
  };

  const handleSaveVaga = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const pN = edital?.percentualNegros ?? 20;
      const pP = edital?.percentualPCD ?? 5;

      if ((newVaga.vagasImediatas + newVaga.vagasReserva) <= 0) {
        alert('Informe a quantidade de vagas (Imediatas ou Reserva).');
        return;
      }

      const res = await fetch(`${API_URL}/vagas-edital`, {
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
          vagasImediatas:    newVaga.vagasImediatas,
          vagasReserva:      newVaga.vagasReserva,
          justificativa: newVaga.justificativa
        }),
      });

      if (res.ok) {
        setShowVagasModal(false);
        setEditingId(null);
        setNewVaga({ 
          cargoId: '', areaAtuacaoId: '', carreiraId: '', nivelId: '', modeloFormularioId: '',
          vagasImediatas: 0, vagasReserva: 0, justificativa: '' 
        });
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
    <div className="space-y-8 pb-32 relative">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <Link href="/funcionario/editais" className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight font-display tracking-tight">Lista de Habilitados</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
                {edital?.titulo || 'Carregando...'}
              </span>
              <span className="text-sm font-black text-slate-300">•</span>
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{edital?.ano}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Servidores Operacionais</span>
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
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Selecionar Todas</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {vagasEstatisticas.map((v) => (
          <div key={v.id} className={`bg-white p-7 rounded-[32px] shadow-sm border transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-emerald-900/5 ${selectedVagasCards.includes(v.id) ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-100'}`}>
            <div>
              <div className="relative">
                <div className="absolute top-0 right-0 flex gap-2 -mt-1 -mr-1">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500 border-slate-200 cursor-pointer transition-all"
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
                    className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                    title="Editar Configuração"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteVaga(v); }}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Excluir Configuração"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
                <div className="flex justify-between items-start mb-3 gap-2 pr-20">
                  <span className="text-sm font-black text-emerald-600 uppercase tracking-[2px] truncate">{v.cargoNome}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 font-display">{v.areaNome}</h3>
                
                {v.modeloFormularioNome && (
                  <div className="inline-flex items-center gap-2 bg-indigo-50 px-2 py-1 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    <span className="text-[9px] font-black text-indigo-700 uppercase tracking-tighter">Formulário: {v.modeloFormularioNome}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm font-black uppercase tracking-widest mb-1.5">
                  <span className="text-slate-400">Total Habilitados</span>
                  <span className="text-slate-900">{v.candidatosHabilitados} / {v.quantidadeVagas}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]`}
                    style={{ width: `${Math.min(100, (v.candidatosHabilitados / (v.quantidadeVagas || 1)) * 100)}%` }}
                  />
                </div>
              </div>
              
              {v.vagasAC > 0 && (
                <div className="flex bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                  <div className="px-3 py-1.5 flex flex-col items-center border-r border-slate-100 min-w-[50px]">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">AC IMED</span>
                    <span className="text-sm font-black text-slate-900">{v.vagasACImediatas}</span>
                  </div>
                  <div className="px-3 py-1.5 flex flex-col items-center bg-slate-100/50 min-w-[50px]">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">AC RES</span>
                    <span className="text-sm font-black text-slate-900">{v.vagasACReserva}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {v.vagasNEG > 0 && (
                  <div className="flex bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
                    <div className="px-2 py-1 flex flex-col items-center border-r border-amber-100">
                      <span className="text-[7px] font-black text-amber-500 uppercase tracking-tighter">NEG IMED</span>
                      <span className="text-xs font-black text-amber-700">{v.vagasNEGImediatas}</span>
                    </div>
                    <div className="px-2 py-1 flex flex-col items-center bg-amber-100/30">
                      <span className="text-[7px] font-black text-amber-500 uppercase tracking-tighter">NEG RES</span>
                      <span className="text-xs font-black text-amber-700">{v.vagasNEGReserva}</span>
                    </div>
                  </div>
                )}
                {v.vagasPCD > 0 && (
                  <div className="flex bg-sky-50 rounded-xl border border-sky-100 overflow-hidden">
                    <div className="px-2 py-1 flex flex-col items-center border-r border-sky-100">
                      <span className="text-[7px] font-black text-sky-500 uppercase tracking-tighter">PCD IMED</span>
                      <span className="text-xs font-black text-sky-700">{v.vagasPCDImediatas}</span>
                    </div>
                    <div className="px-2 py-1 flex flex-col items-center bg-sky-100/30">
                      <span className="text-[7px] font-black text-sky-500 uppercase tracking-tighter">PCD RES</span>
                      <span className="text-xs font-black text-sky-700">{v.vagasPCDReserva}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <button 
          onClick={() => setShowVagasModal(true)}
          className="bg-white border-2 border-dashed border-slate-200 p-7 rounded-[32px] flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/10 transition-all group min-h-[220px]"
        >
          <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 group-hover:bg-white transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          </div>
          <span className="text-sm font-black uppercase tracking-[3px]">Configurar Vagas</span>
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative z-10 transition-all">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 backdrop-blur-sm">
          <div className="flex gap-4">
             <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100/50">
                <span className="text-sm font-black text-emerald-600 uppercase tracking-widest block mb-1">Total Habilitados</span>
                <span className="text-2xl font-black text-emerald-900 font-display">{candidatos.length}</span>
             </div>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            {selectedCandidatos.length > 0 && (
              <button 
                onClick={handleMarcarConvocacao}
                disabled={marking}
                className="px-6 py-3.5 bg-amber-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-amber-600 transition-all flex items-center gap-3 shadow-lg shadow-amber-200/50"
              >
                {marking ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                )}
                Gerar Fila de Convocação ({selectedCandidatos.length})
              </button>
            )}
            {selectedCandidatos.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                disabled={marking}
                className="px-6 py-3.5 bg-rose-50 text-rose-600 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-rose-600 hover:text-white transition-all flex items-center gap-3 border border-rose-100 shadow-lg shadow-rose-100/30"
              >
                {marking ? (
                  <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                )}
                Excluir Selecionados
              </button>
            )}
            
            <button 
              onClick={fetchCoverageAnalysis}
              disabled={analyzing}
              className="px-6 py-3.5 bg-slate-100 text-slate-600 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-3 relative"
            >
              {analyzing ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              )}
              Análise de Vagas
              {coverageData && coverageData.filter((d: any) => d.inconsistencias?.some((inc: any) => inc.severidade === 'BLOQUEANTE')).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full px-2 py-0.5 text-[10px] font-black shadow-lg shadow-rose-200">
                  {coverageData.filter((d: any) => d.inconsistencias?.some((inc: any) => inc.severidade === 'BLOQUEANTE')).length}
                </span>
              )}
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
              className="px-6 py-3.5 bg-emerald-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all flex items-center gap-3 shadow-lg shadow-emerald-200/50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Adicionar Candidato
            </button>
            <button 
              onClick={() => setShowImport(true)}
              className="px-6 py-3.5 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all flex items-center gap-3 shadow-xl"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Importar Listas
            </button>
          </div>
        </div>

        {/* Barra de Pesquisa e Filtros Rápidos */}
        <div className="relative z-10 mb-6 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Pesquisar por nome, CPF, inscrição ou cargo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-8 py-5 bg-white border border-slate-100 rounded-[24px] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-700 shadow-sm placeholder:text-slate-300"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-6 flex items-center text-slate-300 hover:text-rose-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        <div className="overflow-x-auto bg-white rounded-[40px] shadow-sm border border-slate-100/50">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 w-10">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500 border-slate-200 cursor-pointer transition-all"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCandidatos(filteredCandidatos.map(c => c.id));
                      } else {
                        setSelectedCandidatos([]);
                      }
                    }}
                    checked={filteredCandidatos.length > 0 && selectedCandidatos.length === filteredCandidatos.length}
                  />
                </th>
                <th className="px-4 py-6 text-xs font-black text-slate-400 uppercase tracking-[3px]">Inscrição</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[3px]">Candidato</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[3px] text-center">Nota</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[3px]">Especialização</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[3px]">Lista / Convocação</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[3px]">Documentos</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[3px] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {[...filteredCandidatos].sort((a, b) => {
                if (a.posicaoConvocacao && b.posicaoConvocacao) return a.posicaoConvocacao - b.posicaoConvocacao;
                if (a.posicaoConvocacao) return -1;
                if (b.posicaoConvocacao) return 1;
                return (a.posicaoAmpla || 0) - (b.posicaoAmpla || 0);
              }).map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                  <td className="px-8 py-6">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500 border-slate-200 cursor-pointer transition-all"
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
                  <td className="px-4 py-6 font-black text-slate-900 font-display tracking-tight text-base">{c.numeroInscricao}</td>
                  <td className="px-8 py-6">
                    <div className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors text-base uppercase font-display leading-tight">{c.nomeCandidato}</div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-0.5">CPF: {c.cpfCandidato}</div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/50 shadow-sm shadow-emerald-50 tabular-nums">
                      {c.nota ? Number(c.nota).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '-'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">{c.cargo?.nome || 'Não definido'}</div>
                    <div className="text-sm font-black text-slate-800 leading-tight">{c.areaAtuacao?.nome || 'Geral'}</div>
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-1.5 opacity-60">
                      {c.carreira?.nome || 'N/A'} • {c.nivel?.nome || 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2.5">
                       <div className="flex items-center gap-3">
                          {c.posicaoConvocacao ? (
                            <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl shadow-slate-200 animate-in zoom-in duration-500">
                               <span className="text-sm font-black uppercase tracking-widest text-emerald-400">#</span>
                               <span className="text-xl font-black font-display leading-none">{c.posicaoConvocacao}º</span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                               <div className="flex items-baseline gap-1">
                                 <span className="text-sm font-black text-slate-400 uppercase tracking-tighter">A:</span>
                                 <span className="text-xl font-black text-slate-900 font-display leading-none">{c.posicaoAmpla}º</span>
                               </div>
                               <div className="flex gap-2 mt-1">
                                 {c.posicaoNegro && <span className="text-sm font-black text-amber-600 uppercase tracking-tighter flex items-center gap-1">N: <span className="text-sm">{c.posicaoNegro}º</span></span>}
                                 {c.posicaoPCD && <span className="text-sm font-black text-sky-600 uppercase tracking-tighter flex items-center gap-1">P: <span className="text-sm">{c.posicaoPCD}º</span></span>}
                               </div>
                             </div>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                             {(c as any).concorrenciaAmpla && (
                               <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200/50 shadow-sm">Ampla</span>
                             )}
                             {(c as any).concorrenciaNegro && (
                               <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100 shadow-sm">Negro</span>
                             )}
                             {(c as any).concorrenciaPCD && (
                               <span className="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-sky-100 shadow-sm">PCD</span>
                             )}
                          </div>
                       </div>
                       
                       {c.situacao && (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                            c.situacao === 'APROVADO_CONVOCAVEL' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-50' : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            <div className={`w-1 h-1 rounded-full ${c.situacao === 'APROVADO_CONVOCAVEL' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                            {c.situacao.replace(/_/g, ' ')}
                          </span>
                          {c.tipoVaga && (
                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                              c.tipoVaga === 'IMEDIATA' ? 'bg-emerald-900 text-white border border-emerald-800 shadow-lg' : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                              {c.tipoVaga}
                            </span>
                          )}
                          {c.posicaoConvocacao && (
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Geral: #{c.posicaoAmpla}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {c.envios && c.envios.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          </div>
                          <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">{c.envios.length} Documentos</span>
                        </div>
                        {c.statusConvocacao && (
                          <div className="flex items-center gap-1 mt-1">
                             <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span>
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                               Status: {c.statusConvocacao.replace(/_/g, ' ')}
                             </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 opacity-30 grayscale group-hover:grayscale-0 transition-all">
                          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          <span className="text-sm font-black text-slate-300 uppercase tracking-widest">Vazio</span>
                        </div>
                        {c.situacao === 'APROVADO_CONVOCAVEL' && (
                          <div className="flex items-center gap-2 mt-1 px-2 py-0.5 bg-rose-50 rounded-md border border-rose-100/50 w-fit">
                             <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse"></div>
                             <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">Pendente</span>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => setEditingCandidato({...c})}
                      className="p-2.5 bg-slate-50 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
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
                      className="p-2.5 bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCandidatos.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-8 py-32 text-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                       <span className="text-9xl font-black italic tracking-tighter">VACAT</span>
                    </div>
                    <div className="relative z-10 space-y-4">
                       <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                          <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 012-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                          </svg>
                       </div>
                       <h3 className="text-xl font-black text-slate-900 font-display italic">Nenhum resultado encontrado</h3>
                       <p className="text-sm font-black text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-loose">
                         {searchQuery ? `Não encontramos candidatos para "${searchQuery}" nesta categoria.` : "A base de dados de habilitados está vazia para este edital."}
                       </p>
                       {!searchQuery && (
                         <button 
                           onClick={() => setShowImport(true)}
                           className="mt-6 px-10 py-4 bg-slate-900 text-white text-sm font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-emerald-600 transition-all shadow-xl"
                         >
                           Importar Listas Agora
                         </button>
                       )}
                    </div>
                  </td>
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
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Defina a oferta de especializações para este edital</p>
              </div>
              <button 
                onClick={() => { setShowVagasModal(false); setEditingId(null); setNewVaga({ cargoId: '', areaAtuacaoId: '', carreiraId: '', nivelId: '', modeloFormularioId: '', vagasImediatas: 0, vagasReserva: 0, justificativa: '' }); }} 
                className="text-slate-200 hover:text-slate-900 transition-all"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSaveVaga} className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Cargo</label>
                  <select 
                    required
                    value={newVaga.cargoId}
                    onChange={e => setNewVaga({...newVaga, cargoId: e.target.value, areaAtuacaoId: ''})}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-sm text-slate-700 appearance-none shadow-sm transition-all"
                  >
                    <option value="">Selecione o Cargo</option>
                    {cargos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Área de Atuação</label>
                  <select 
                    value={newVaga.areaAtuacaoId}
                    onChange={e => setNewVaga({...newVaga, areaAtuacaoId: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-sm text-slate-700 appearance-none shadow-sm transition-all"
                    disabled={!newVaga.cargoId}
                  >
                    <option value="">Geral / Sem Área</option>
                    {selectedCargo?.areas?.map((a: any) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Carreira</label>
                  <select 
                    required
                    value={newVaga.carreiraId}
                    onChange={e => setNewVaga({...newVaga, carreiraId: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-sm text-slate-700 appearance-none shadow-sm transition-all"
                  >
                    <option value="">Selecione a Carreira</option>
                    {carreiras.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Nível</label>
                  <select 
                    required
                    value={newVaga.nivelId}
                    onChange={e => setNewVaga({...newVaga, nivelId: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-sm text-slate-700 appearance-none shadow-sm transition-all"
                  >
                    <option value="">Selecione o Nível</option>
                    {niveis.map(n => <option key={n.id} value={n.id}>{n.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Modelo de Formulário para o Candidato</label>
                <select 
                  value={newVaga.modeloFormularioId}
                  onChange={e => setNewVaga({...newVaga, modeloFormularioId: e.target.value})}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-sm text-slate-700 appearance-none shadow-sm transition-all"
                >
                  <option value="">Selecione o Modelo de Formulário</option>
                  {modelosFormulario.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>

              <div className="pt-4 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Vagas Imediatas</label>
                    <input 
                      type="number" min="0"
                      value={newVaga.vagasImediatas}
                      onChange={e => setNewVaga({...newVaga, vagasImediatas: parseInt(e.target.value) || 0})}
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-black text-sm text-slate-700 shadow-sm transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Cadastro de Reserva</label>
                    <input 
                      type="number" min="0"
                      value={newVaga.vagasReserva}
                      onChange={e => setNewVaga({...newVaga, vagasReserva: parseInt(e.target.value) || 0})}
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-black text-sm text-slate-700 shadow-sm transition-all"
                    />
                  </div>
                </div>

                {/* Tabela de Conferência Somente Leitura */}
                {(() => {
                  const pN = edital?.percentualNegros ?? 20;
                  const pP = edital?.percentualPCD ?? 5;
                  const calcCota = (t: number, p: number, type: string) => {
                    const res = t * (p / 100);
                    const int = Math.floor(res);
                    const frac = res - int;
                    let f = frac >= 0.5 ? Math.ceil(res) : Math.floor(res);
                    if (type === 'negro' && t >= 5 && f < 1) f = 1;
                    if (type === 'pcd' && t >= 20 && f < 1) f = 1;
                    return f;
                  };
                  const negImed = calcCota(newVaga.vagasImediatas, pN, 'negro');
                  const pcdImed = calcCota(newVaga.vagasImediatas, pP, 'pcd');
                  const acImed  = newVaga.vagasImediatas - negImed - pcdImed;
                  const negRes  = calcCota(newVaga.vagasReserva, pN, 'negro');
                  const pcdRes  = calcCota(newVaga.vagasReserva, pP, 'pcd');
                  const acRes   = newVaga.vagasReserva - negRes - pcdRes;

                  return (
                    <div className="overflow-hidden rounded-[24px] border border-slate-200/60 shadow-inner bg-white">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-slate-50 text-slate-400 uppercase font-black border-b border-slate-100">
                          <tr>
                            <th className="px-5 py-3">Modalidade</th>
                            <th className="px-5 py-3 text-center">Imediatas</th>
                            <th className="px-5 py-3 text-center">Reserva</th>
                            <th className="px-5 py-3 text-center">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          <tr>
                            <td className="px-5 py-3 font-bold text-slate-600">Ampla Concorrência</td>
                            <td className="px-5 py-3 text-center font-black text-slate-900">{acImed}</td>
                            <td className="px-5 py-3 text-center font-black text-slate-900">{acRes}</td>
                            <td className="px-5 py-3 text-center font-black text-slate-900 bg-slate-50/50">{acImed + acRes}</td>
                          </tr>
                          <tr className="bg-amber-50/30 font-bold">
                            <td className="px-5 py-3 text-amber-700">Negros ({pN}%)</td>
                            <td className="px-5 py-3 text-center font-black text-amber-600">{negImed}</td>
                            <td className="px-5 py-3 text-center font-black text-amber-600">{negRes}</td>
                            <td className="px-5 py-3 text-center font-black text-amber-600 bg-amber-100/20">{negImed + negRes}</td>
                          </tr>
                          <tr className="bg-sky-50/30 font-bold">
                            <td className="px-5 py-3 text-sky-700">PCD ({pP}%)</td>
                            <td className="px-5 py-3 text-center font-black text-sky-600">{pcdImed}</td>
                            <td className="px-5 py-3 text-center font-black text-sky-600">{pcdRes}</td>
                            <td className="px-5 py-3 text-center font-black text-sky-600 bg-sky-100/20">{pcdImed + pcdRes}</td>
                          </tr>
                          <tr className="bg-slate-900 text-white font-black">
                            <td className="px-5 py-3 border-t border-slate-800">Geral</td>
                            <td className="px-5 py-3 text-center border-t border-slate-800">{newVaga.vagasImediatas}</td>
                            <td className="px-5 py-3 text-center border-t border-slate-800">{newVaga.vagasReserva}</td>
                            <td className="px-5 py-3 text-center border-t border-slate-800 text-emerald-400">{newVaga.vagasImediatas + newVaga.vagasReserva}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

                <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl flex justify-between items-center mt-4">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Geral de Vagas</span>
                  <span className="text-3xl font-black text-white tabular-nums font-display">{newVaga.vagasImediatas + newVaga.vagasReserva}</span>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                  <button 
                    type="button"
                    onClick={() => { setShowVagasModal(false); setEditingId(null); }}
                    className="text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all font-display"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-10 py-5 bg-emerald-600 text-white text-sm font-black uppercase tracking-[0.2em] rounded-[24px] shadow-xl hover:bg-emerald-700 transition-all active:scale-95 font-display shadow-emerald-200/50"
                  >
                    {editingId ? 'Confirmar Alterações' : 'Publicar Vagas'}
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Vagas já Configuradas</h3>
              <div className="divide-y divide-slate-50 border border-slate-100 rounded-3xl overflow-hidden">
                {vagasEstatisticas.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400 font-bold italic bg-slate-50/30">Nenhuma vaga configurada para este edital.</div>
                ) : (
                  vagasEstatisticas.map(v => (
                    <div key={v.id} className="p-6 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors group">
                      <div>
                        <div className="text-sm font-black text-emerald-600 uppercase tracking-widest">{v.cargoNome}</div>
                        <div className="text-base font-black text-slate-900 font-display leading-tight">{v.areaNome}</div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="flex gap-4">
                          <div className="text-center group-hover:bg-slate-100 p-2 rounded-xl transition-all">
                             <div className="text-sm font-black text-slate-300 uppercase tracking-widest leading-none mb-1">AC</div>
                             <div className="text-base font-black text-slate-900 tabular-nums">{v.vagasAC}</div>
                          </div>
                          <div className="text-center group-hover:bg-amber-50 p-2 rounded-xl transition-all">
                             <div className="text-sm font-black text-amber-300 uppercase tracking-widest leading-none mb-1">NEG</div>
                             <div className="text-base font-black text-amber-600 tabular-nums">{v.vagasNEG}</div>
                          </div>
                          <div className="text-center group-hover:bg-sky-50 p-2 rounded-xl transition-all">
                             <div className="text-sm font-black text-sky-300 uppercase tracking-widest leading-none mb-1">PCD</div>
                             <div className="text-base font-black text-sky-600 tabular-nums">{v.vagasPCD}</div>
                          </div>
                        </div>
                        <div className="text-right border-l border-slate-100 pl-4">
                          <div className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</div>
                          <div className="text-2xl font-black text-slate-900 font-display tabular-nums leading-none">{v.totalGeral}</div>
                        </div>
                        <button 
                          onClick={() => handleDeleteVaga(v)}
                          className="p-3 bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
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
                  onClick={() => { setShowVagasModal(false); setEditingId(null); setNewVaga({ cargoId: '', areaAtuacaoId: '', carreiraId: '', nivelId: '', modeloFormularioId: '', vagasImediatas: 0, vagasReserva: 0, justificativa: '' }); }} 
                  className="px-10 py-5 bg-slate-900 text-white font-black uppercase text-sm tracking-[.2em] rounded-[24px] hover:bg-emerald-600 transition-all shadow-2xl"
                >
                  Concluir Configuração
                </button>
             </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-10 space-y-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-50 pb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-display">Importação em Massa</h2>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Cole os dados da banca examinadora abaixo</p>
              </div>
              <button onClick={() => setShowImport(false)} className="text-slate-200 hover:text-slate-900 transition-all">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="bg-emerald-50 p-8 rounded-[32px] border border-emerald-100/50">
              <div className="flex items-start gap-4">
                 <div className="bg-white p-2 rounded-xl text-emerald-600 shadow-sm border border-emerald-100">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                 </div>
                 <div className="flex-1">
                    <p className="text-sm text-emerald-900 leading-relaxed font-black mb-2 font-display">Instruções de Formatação</p>
                    <p className="text-sm text-emerald-700/80 leading-relaxed font-bold">
                      Use ponto e vírgula (;) para separar os campos. A primeira linha deve conter os cabeçalhos.
                    </p>
                    <div className="mt-4 p-3 bg-white/50 rounded-xl font-mono text-[9px] text-emerald-900/60 break-all border border-emerald-100 uppercase tracking-tighter">
                      INSCRICAO;CPF;NOME;NOTA;POS_AMPLA;POS_NEGRO;POS_PCD;CARGO;AREA;CARREIRA;NIVEL;EMAIL;TELEFONE;CELULAR;ENDERECO
                    </div>
                 </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                 <a 
                  href="/modelo_importacao.csv" 
                  download="modelo_importacao.csv"
                  className="flex-1 py-4 px-6 bg-white hover:bg-emerald-600 hover:text-white text-emerald-900 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border border-emerald-100 shadow-sm text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Modelo CSV
                </a>
                <div className="flex-1">
                  <input 
                    type="file" id="csv-file-modal-final" accept=".csv,.txt" className="hidden" 
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="csv-file-modal-final" className="w-full py-4 px-6 bg-slate-900 text-white hover:bg-emerald-600 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl cursor-pointer text-center flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                    Upload CSV
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Conteúdo da Lista</label>
               <textarea 
                value={importText}
                onChange={e => setImportText(e.target.value)}
                className="w-full h-80 px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all font-mono text-[11px] font-bold text-slate-700 placeholder:text-slate-200"
                placeholder="2026001;123.456.789-00;MANOEL SILVA;85,50;1;;;PROFESSOR;MATEMATICA;MAGISTERIO;SUPERIOR"
              />
            </div>

            <div className="flex gap-4 justify-between items-center pt-4 border-t border-slate-50">
              <button 
                onClick={() => setShowImport(false)}
                className="px-8 py-4 text-slate-400 font-black uppercase text-sm tracking-widest hover:text-slate-900 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleImport}
                disabled={!importText.trim()}
                className="px-12 py-5 bg-emerald-600 text-white font-black uppercase text-sm tracking-[.25em] rounded-[24px] hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200/50 disabled:opacity-50 disabled:shadow-none animate-in zoom-in-95 duration-200"
              >
                Importar Base
              </button>
            </div>
          </div>
        </div>
      )}

      {showCoverageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl max-w-4xl w-full p-10 space-y-8 max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="flex justify-between items-start border-b border-slate-50 pb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 font-display italic">Diagnóstico de Cobertura</h2>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-[.2em] mt-2">Identificação de inconsistências e conferência legislativa</p>
                </div>
                <button onClick={() => setShowCoverageModal(false)} className="p-2 bg-slate-50 text-slate-300 hover:text-slate-900 rounded-2xl transition-all">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              {!coverageData ? (
                 <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto animate-pulse">
                       <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    </div>
                    <p className="text-slate-400 font-black uppercase text-sm tracking-widest">Processando métricas...</p>
                 </div>
              ) : coverageData.length === 0 ? (
                <div className="py-20 text-center space-y-6">
                   <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[40px] flex items-center justify-center mx-auto shadow-inner">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                   </div>
                   <div>
                      <h4 className="text-2xl font-black text-slate-900 mb-2 font-display italic">Tudo em Ordem!</h4>
                      <p className="text-slate-500 font-bold max-w-sm mx-auto">Nenhuma inconsistência de vagas foi detectada para este edital.</p>
                   </div>
                </div>
              ) : (
                <div className="space-y-10">
                   {coverageData.some((d: any) => d.inconsistencias?.some((inc: any) => inc.severidade === 'BLOQUEANTE')) && (
                     <div className="p-8 rounded-[32px] flex items-center gap-8 bg-rose-50 border border-rose-100">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl bg-rose-600 text-white">
                           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </div>
                        <div className="flex-1">
                           <h4 className="text-lg font-black text-slate-900 font-display">Inconsistências Bloqueantes</h4>
                           <p className="text-slate-500 text-sm font-bold">Existem {coverageData.filter((d: any) => d.inconsistencias?.some((inc: any) => inc.severidade === 'BLOQUEANTE')).length} grupos com erros que impedem a classificação correta.</p>
                        </div>
                     </div>
                   )}

                   <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        {coverageData.map((item: any, idx: number) => (
                          <div key={idx} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all duration-500">
                             <div className="border-b border-slate-50 pb-6 mb-6">
                                <h3 className="text-xl font-black text-slate-900 font-display uppercase tracking-tight">{item.cargoNome} / {item.areaNome}</h3>
                                <div className="flex items-center gap-4 mt-3">
                                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                      {item.totalCandidatos} Candidatos Habilitados
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-bold text-slate-300 uppercase">{item.candidatosAC} AC</span>
                                      <span className="text-[9px] font-bold text-slate-300 uppercase italic">/</span>
                                      <span className="text-[9px] font-bold text-slate-300 uppercase">{item.candidatosNEG} NEG</span>
                                      <span className="text-[9px] font-bold text-slate-300 uppercase italic">/</span>
                                      <span className="text-[9px] font-bold text-slate-300 uppercase">{item.candidatosPCD} PCD</span>
                                   </div>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[.2em] flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                      Status da Configuração
                                   </h4>
                                   
                                   <div className="grid grid-cols-3 gap-3">
                                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                         <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Ampla</div>
                                         <div className="text-sm font-black text-slate-900">{(item.vagasACImediatas || 0) + (item.vagasACReserva || 0)}</div>
                                      </div>
                                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                                         <div className="text-[8px] font-black text-amber-500 uppercase mb-1">Negros</div>
                                         <div className="text-sm font-black text-amber-600 font-display">{(item.vagasNEGImediatas || 0) + (item.vagasNEGReserva || 0)}</div>
                                      </div>
                                      <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 text-center">
                                         <div className="text-[8px] font-black text-sky-500 uppercase mb-1">PCD</div>
                                         <div className="text-sm font-black text-sky-600 font-display">{(item.vagasPCDImediatas || 0) + (item.vagasPCDReserva || 0)}</div>
                                      </div>
                                   </div>

                                   <div className="flex items-center justify-between bg-slate-900 rounded-2xl px-6 py-4">
                                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Requisito Legal</span>
                                      <div className="flex gap-4">
                                         <span className="text-[10px] font-black text-amber-400 uppercase tracking-tighter">NEG ≥ {item.negEsperado || 0}</span>
                                         <span className="text-[10px] font-black text-sky-400 uppercase tracking-tighter">PCD ≥ {item.pcdEsperado || 0}</span>
                                      </div>
                                   </div>
                                </div>

                                <div className="space-y-4">
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[.2em] flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                                      Conclusões do Diagnóstico
                                   </h4>
                                   <div className="space-y-3">
                                      {item.inconsistencias?.map((inc: any, i: number) => (
                                        <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${inc.severidade === 'BLOQUEANTE' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                                           <div className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${inc.severidade === 'BLOQUEANTE' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>
                                              {inc.severidade === 'BLOQUEANTE' ? (
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg>
                                              ) : (
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                              )}
                                           </div>
                                           <div>
                                              <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{inc.tipo}</div>
                                              <p className="text-xs font-bold leading-relaxed">{inc.mensagem}</p>
                                           </div>
                                        </div>
                                      ))}
                                   </div>

                                   {item.sugestao && (
                                     <div className="flex gap-2 pt-2">
                                        <button 
                                          onClick={() => {
                                            setNewVaga({
                                              cargoId: item.cargoId,
                                              areaAtuacaoId: item.areaAtuacaoId || '',
                                              carreiraId: '',
                                              nivelId: '',
                                              modeloFormularioId: '',
                                              vagasImediatas: item.sugestao.vagasImediatas,
                                              vagasReserva: item.sugestao.vagasReserva,
                                              justificativa: 'Correção sugerida pelo Diagnosis de Cobertura.'
                                            });
                                            setShowCoverageModal(false);
                                            setShowVagasModal(true);
                                          }}
                                          className="flex-1 px-4 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200"
                                        >
                                          Corrigir com Sugestão
                                        </button>
                                        <button 
                                          onClick={() => {
                                            const v = vagasEstatisticas.find(ve => ve.cargoId === item.cargoId && ve.areaAtuacaoId === item.areaAtuacaoId);
                                            if (v) handleEditVaga(v);
                                            else handleQuickCreateVaga(item);
                                          }}
                                          className="px-4 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-slate-900 transition-all"
                                        >
                                          Editar Manualmente
                                        </button>
                                     </div>
                                   )}
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                <button 
                  onClick={() => setShowCoverageModal(false)}
                  className="px-8 py-4 text-slate-400 font-black uppercase text-sm tracking-widest hover:text-slate-900 transition-all font-display italic"
                >
                  Fechar Diagnóstico
                </button>
                {coverageData && coverageData.length > 0 && (
                  <button 
                    onClick={handleApplyAllSuggestions}
                    disabled={applyingSuggestions}
                    className="px-10 py-5 bg-emerald-600 text-white font-black uppercase text-sm tracking-[.25em] rounded-[24px] hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200/50 flex items-center gap-3 disabled:opacity-50"
                  >
                    {applyingSuggestions && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                    Resolver Todas Automaticamente
                  </button>
                )}
              </div>
           </div>
        </div>
      )}

      {editingCandidato && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-10 space-y-8 max-h-[95vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 font-display italic">{editingCandidato.id ? 'Ficha do Candidato' : 'Novo Habilitado'}</h2>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Gestão de dados sensíveis e classificação</p>
                </div>
                <button onClick={() => setEditingCandidato(null)} className="text-slate-200 hover:text-slate-900 transition-all">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Nome Completo</label>
                    <input 
                      type="text" required
                      value={editingCandidato.nomeCandidato}
                      onChange={e => setEditingCandidato({...editingCandidato, nomeCandidato: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-black text-slate-800 font-display text-lg uppercase shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">CPF</label>
                    <input 
                      type="text" required
                      value={editingCandidato.cpfCandidato}
                      onChange={e => setEditingCandidato({...editingCandidato, cpfCandidato: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800 tabular-nums"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Número de Inscrição</label>
                    <input 
                      type="text" required
                      value={editingCandidato.numeroInscricao}
                      onChange={e => setEditingCandidato({...editingCandidato, numeroInscricao: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between mb-4 pl-1">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Pontuação e Posicionamento</h3>
                       {editingCandidato.tipoVaga && (
                         <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${
                           editingCandidato.tipoVaga === 'IMEDIATA' 
                             ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' 
                             : 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm'
                         }`}>
                           {editingCandidato.tipoVaga === 'IMEDIATA' ? 'Vaga Imediata' : 'Cadastro de Reserva'}
                         </div>
                       )}
                    </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">Nota</label>
                         <input 
                           type="text" value={editingCandidato.nota || ''}
                           onChange={e => setEditingCandidato({...editingCandidato, nota: e.target.value})}
                           className="w-full bg-transparent outline-none font-black text-xl text-emerald-600 tabular-nums"
                         />
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">Ampla</label>
                         <input 
                           type="number" required value={editingCandidato.posicaoAmpla || ''}
                           onChange={e => setEditingCandidato({...editingCandidato, posicaoAmpla: e.target.value})}
                           className="w-full bg-transparent outline-none font-black text-xl text-slate-900 tabular-nums"
                         />
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">Negro</label>
                         <input 
                           type="number" value={editingCandidato.posicaoNegro || ''}
                           onChange={e => setEditingCandidato({...editingCandidato, posicaoNegro: e.target.value})}
                           className="w-full bg-transparent outline-none font-black text-xl text-amber-600 tabular-nums"
                         />
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">PCD</label>
                         <input 
                           type="number" value={editingCandidato.posicaoPCD || ''}
                           onChange={e => setEditingCandidato({...editingCandidato, posicaoPCD: e.target.value})}
                           className="w-full bg-transparent outline-none font-black text-xl text-sky-600 tabular-nums"
                         />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Carreira</label>
                    <select 
                      value={editingCandidato.carreiraId || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, carreiraId: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-slate-800 appearance-none shadow-sm transition-all"
                    >
                      <option value="">Selecione...</option>
                      {carreiras.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Nível</label>
                    <select 
                      value={editingCandidato.nivelId || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, nivelId: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-slate-800 appearance-none shadow-sm transition-all"
                    >
                      <option value="">Selecione...</option>
                      {niveis.map(n => <option key={n.id} value={n.id}>{n.nome}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Cargo</label>
                    <select 
                      value={editingCandidato.cargoId || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, cargoId: e.target.value, areaAtuacaoId: ''})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-slate-800 appearance-none shadow-sm transition-all"
                    >
                      <option value="">Selecione...</option>
                      {cargos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Área de Atuação</label>
                    <select 
                      value={editingCandidato.areaAtuacaoId || ''}
                      onChange={e => setEditingCandidato({...editingCandidato, areaAtuacaoId: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-slate-800 appearance-none shadow-sm transition-all"
                      disabled={!editingCandidato.cargoId}
                    >
                      <option value="">Geral</option>
                      {cargos.find(c => c.id === editingCandidato.cargoId)?.areas?.map((a: any) => (
                        <option key={a.id} value={a.id}>{a.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[40px] space-y-8 shadow-2xl">
                   <h3 className="text-sm font-black text-emerald-400 uppercase tracking-[.3em] pl-1">Logística e Contato</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest pl-1">E-mail Corporativo/Pessoal</label>
                        <input 
                          type="email" value={editingCandidato.emailCandidato || ''}
                          onChange={e => setEditingCandidato({...editingCandidato, emailCandidato: e.target.value})}
                          className="w-full px-6 py-4 bg-white/5 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 text-white font-bold text-sm shadow-inner"
                          placeholder="candidato@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest pl-1">Celular / WhatsApp</label>
                        <input 
                          type="text" value={editingCandidato.celularCandidato || ''}
                          onChange={e => setEditingCandidato({...editingCandidato, celularCandidato: e.target.value})}
                          className="w-full px-6 py-4 bg-white/5 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 text-white font-bold text-sm shadow-inner"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest pl-1">Endereço Residencial</label>
                        <input 
                          type="text" value={editingCandidato.enderecoCandidato || ''}
                          onChange={e => setEditingCandidato({...editingCandidato, enderecoCandidato: e.target.value})}
                          className="w-full px-6 py-4 bg-white/5 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 text-white font-bold text-sm shadow-inner"
                          placeholder="Logradouro, Bairro, CEP, Cidade-UF"
                        />
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 justify-end pt-8 border-t border-slate-50">
                  <button 
                    type="button" onClick={() => setEditingCandidato(null)}
                    className="px-10 py-5 text-slate-400 font-black uppercase text-sm tracking-widest hover:text-slate-900 transition-all"
                  >
                    Descartar Alterações
                  </button>
                  <button 
                    type="submit"
                    className="px-14 py-5 bg-emerald-600 text-white font-black uppercase text-sm tracking-[.3em] rounded-[24px] hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200/50 active:scale-95"
                  >
                    Salvar Candidato
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
