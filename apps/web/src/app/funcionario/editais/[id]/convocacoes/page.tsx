'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import Link from 'next/link';
import AvaliacaoFormulario from '@/components/AvaliacaoFormulario';

interface RegistroConvocacao {
  id: string;
  dataConvocacao: string;
  meioUtilizado: string;
  prazoDocumentacao: string;
  status: string;
  observacoes?: string;
}

interface CandidatoConvocacao {
  id: string;
  numeroInscricao: string;
  nomeCandidato: string;
  cpfCandidato: string;
  nota?: number;
  posicaoAmpla?: number;
  posicaoNegro?: number;
  posicaoPCD?: number;
  posicaoConvocacao?: number;
  emailCandidato?: string | null;
  telefoneCandidato?: string | null;
  celularCandidato?: string | null;
  enderecoCandidato?: string | null;
  statusConvocacao: string;
  prazoEnvio?: string | null;
  cargo: { nome: string };
  areaAtuacao?: { nome: string } | null;
  carreira?: { nome: string } | null;
  nivel?: { nome: string } | null;
  modalidade?: { nome: string } | null;
  concorrenciaAmpla: boolean;
  concorrenciaNegro: boolean;
  concorrenciaPCD: boolean;
  modeloFormularioId?: string;
  modeloFormulario?: { nome: string; esquemaJSON: any };
  envios: any[];
  registrosConvocacao: RegistroConvocacao[];
  tipoVaga?: 'IMEDIATA' | 'RESERVA';
}

const KANBAN_COLUMNS = [
  { id: 'AGUARDANDO_CONVOCACAO', title: 'Aguardando conv.', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 'CONVOCACAO_ENVIADA', title: 'Convocação enviada', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { id: 'AGUARDANDO_DOCUMENTACAO', title: 'Aguardando docs', color: 'bg-sky-50 text-sky-600 border-sky-200' },
  { id: 'DOCUMENTOS_ENVIADOS', title: 'Análise de docs', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'DOCUMENTACAO_PENDENTE', title: 'Pendência (reenvio)', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'AGENDAMENTO_APRESENTACAO', title: 'Agendamento / Apres.', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'EFETIVADO', title: 'Concluído', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', collapsible: true },
  { id: 'DESCLASSIFICADOS', title: 'Desistência / reprov.', color: 'bg-rose-50 text-rose-600 border-rose-200', collapsible: true }
];

export default function ControleConvocacaoPage() {
  const params = useParams();
  const editalId = params.id as string;
  
  const [candidatos, setCandidatos] = useState<CandidatoConvocacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [edital, setEdital] = useState<any>(null);
  
  // Collapse states
  const [collapsedCols, setCollapsedCols] = useState<Record<string, boolean>>({
    'EFETIVADO': true,
    'DESCLASSIFICADOS': true
  });

  const [editalFormularios, setEditalFormularios] = useState<any[]>([]);
  const [updatingForm, setUpdatingForm] = useState(false);

  // Modal states
  const [selectedCandidato, setSelectedCandidato] = useState<CandidatoConvocacao | null>(null);
  const [showNovoRegistro, setShowNovoRegistro] = useState(false);
  const [novoRegistro, setNovoRegistro] = useState({
    meioUtilizado: 'Diário Oficial',
    prazoDocumentacao: '',
    observacoes: '',
    avancarParaDocumentacao: false
  });
  const [savingRecord, setSavingRecord] = useState(false);
  const [viewAvaliacao, setViewAvaliacao] = useState(false);

  useEffect(() => {
    fetchData();
  }, [editalId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const [resC, resE, resF] = await Promise.all([
        fetch(`${API_URL}/editais/${editalId}/convocacoes`, { headers }),
        fetch(`${API_URL}/editais/${editalId}`, { headers }),
        fetch(`${API_URL}/formularios`, { headers })
      ]);
      
      if (resE.ok) setEdital(await resE.json());
      if (resC.ok) setCandidatos(await resC.json());
      if (resF.ok) setEditalFormularios(await resF.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, candidatoId: string) => {
    e.dataTransfer.setData('candidatoId', candidatoId);
  };

  const handleDrop = async (e: React.DragEvent | null, targetColId: string, candidatoIdManual?: string) => {
    if (e) e.preventDefault();
    const candidatoId = candidatoIdManual || e?.dataTransfer.getData('candidatoId');
    if (!candidatoId) return;

    const candidato = candidatos.find(c => c.id === candidatoId);
    if (!candidato || candidato.statusConvocacao === targetColId) return;

    let finalStatus = targetColId;
    let observacao = 'Movimentação no Kanban';
    let prazo: string | null = null;

    if (targetColId === 'DESCLASSIFICADOS') {
      const motivo = prompt('Motivo da desclassificação?\n1 - Desistente\n2 - Prazo Expirado\n3 - Sem Resposta', '1');
      if (motivo === '1') finalStatus = 'DESISTENTE';
      else if (motivo === '2') finalStatus = 'PRAZO_EXPIRADO';
      else if (motivo === '3') finalStatus = 'SEM_RESPOSTA';
      else return; // user cancelled
    }

    if (targetColId === 'AGUARDANDO_DOCUMENTACAO' || targetColId === 'DOCUMENTOS_ENVIADOS' || targetColId === 'DOCUMENTACAO_PENDENTE' || targetColId === 'AGENDAMENTO_APRESENTACAO' || targetColId === 'EFETIVADO') {
      if (!candidato.modeloFormularioId) {
        alert('Este candidato não possui um formulário vinculado. Vincule um formulário no modal de histórico antes de avançar para esta fase.');
        return;
      }
    }

    if (targetColId === 'AGUARDANDO_DOCUMENTACAO' || targetColId === 'DOCUMENTACAO_PENDENTE' || targetColId === 'AGENDAMENTO_APRESENTACAO') {
      const msgPrompt = targetColId === 'AGENDAMENTO_APRESENTACAO' 
        ? 'Defina a data e hora para a APRESENTAÇÃO do candidato:' 
        : 'Defina o prazo final para entrega da documentação:';

      prazo = prompt(msgPrompt, candidato.prazoEnvio?.slice(0, 16).replace('T', ' ') || '');
      if (prazo === null) return; 
      
      if (targetColId === 'DOCUMENTACAO_PENDENTE') {
        const pendencia = prompt('Resumo das pendências para o histórico:', '');
        if (pendencia) observacao = `PENDÊNCIA: ${pendencia}`;
      } else if (targetColId === 'AGENDAMENTO_APRESENTACAO') {
        observacao = `AGENDAMENTO: Candidato aprovado na fase de documentos e movido para apresentação.`;
      }
    }

    // Optimistic UI update
    const previous = [...candidatos];
    const parsedPrazo = (prazo && !isNaN(Date.parse(prazo))) ? new Date(prazo).toISOString() : (candidato.prazoEnvio || undefined);
    setCandidatos(prev => prev.map(c => c.id === candidatoId ? { ...c, statusConvocacao: finalStatus, prazoEnvio: parsedPrazo } : c));

    try {
      const res = await fetch(`${API_URL}/editais/${editalId}/convocacoes/${candidatoId}/mover`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: finalStatus, observacao, prazo })
      });
      if (!res.ok) throw new Error();
      await fetchData(); 
    } catch {
      alert('Erro ao mover candidato.');
      setCandidatos(previous);
    }
  };

  const handleSalvarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidato) return;
    setSavingRecord(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/editais/${editalId}/convocacoes/${selectedCandidato.id}/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          meioUtilizado: novoRegistro.meioUtilizado,
          prazoDocumentacao: novoRegistro.prazoDocumentacao,
          observacoes: novoRegistro.observacoes,
          avancarParaDocumentacao: novoRegistro.avancarParaDocumentacao
        })
      });
      if (!res.ok) throw new Error('Falha ao registrar convocação');
      
      setNovoRegistro({ meioUtilizado: 'Diário Oficial', prazoDocumentacao: '', observacoes: '', avancarParaDocumentacao: false });
      setShowNovoRegistro(false);
      setViewAvaliacao(false);
      setSelectedCandidato(null);
      await fetchData();
    } catch (err) {
      alert('Erro ao salvar registro: ' + err);
    } finally {
      setSavingRecord(false);
    }
  };

  const handleReverterConvocacao = async (candidatoId: string) => {
    if (!confirm('Deseja realmente remover este candidato do controle de convocação? Todo o histórico será apagado e ele voltará para a listagem de habilitados.')) return;
    
    try {
      const res = await fetch(`${API_URL}/editais/${editalId}/convocacoes/${candidatoId}/remover`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Falha ao remover candidato');
      
      setSelectedCandidato(null);
      await fetchData();
    } catch (err) {
      alert('Erro ao reverter: ' + err);
    }
  };

  const handleVincularFormulario = async (candidatoId: string, modeloFormularioId: string) => {
    // Permitir passar string vazia para desvincular
    setUpdatingForm(true);
    try {
      const res = await fetch(`${API_URL}/editais/${editalId}/convocacoes/${candidatoId}/formulario`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ modeloFormularioId: modeloFormularioId || null })
      });
      if (!res.ok) throw new Error();
      await fetchData();
      if (selectedCandidato?.id === candidatoId) {
        const updated = candidatos.find(c => c.id === candidatoId);
        if (updated) setSelectedCandidato({ ...updated, modeloFormularioId });
      }
    } catch {
      alert('Erro ao vincular formulário.');
    } finally {
      setUpdatingForm(false);
    }
  };

  const formatStatus = (s: string) => s?.replace(/_/g, ' ') || '';

  const getCandidatosByCol = (colId: string) => {
    let filtered = [];
    if (colId === 'DESCLASSIFICADOS') {
      filtered = candidatos.filter(c => ['DESISTENTE', 'PRAZO_EXPIRADO', 'SEM_RESPOSTA', 'REPROVADO'].includes(c.statusConvocacao));
    } else if (colId === 'AGUARDANDO_DOCUMENTACAO') {
      filtered = candidatos.filter(c => c.statusConvocacao === 'AGUARDANDO_DOCUMENTACAO' || c.statusConvocacao === 'CONVOCADO');
    } else if (colId === 'AGENDAMENTO_APRESENTACAO') {
      filtered = candidatos.filter(c => c.statusConvocacao === 'AGENDAMENTO_APRESENTACAO' || c.statusConvocacao === 'APROVADO');
    } else {
      filtered = candidatos.filter(c => c.statusConvocacao === colId);
    }

    return filtered.sort((a, b) => {
      // Prioridade: IMEDIATA > RESERVA
      if (a.tipoVaga === 'IMEDIATA' && b.tipoVaga === 'RESERVA') return -1;
      if (a.tipoVaga === 'RESERVA' && b.tipoVaga === 'IMEDIATA') return 1;
      // Se igual, mantém ordem original (ou por posição se preferir)
      return (a.posicaoConvocacao || 999) - (b.posicaoConvocacao || 999);
    });
  };

  if (loading && candidatos.length === 0) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col pb-4">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <Link href={`/funcionario/editais/${editalId}/classificacao`} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">Painel de Controle de Convocação</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
            {edital?.titulo || 'Carregando...'} • <span className="text-emerald-600">{candidatos.length} Candidatos em curso</span>
          </p>
        </div>
      </div>

      {/* KANBAN BOARD SCROLL CONTAINER */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 select-none">
        <div className="flex pl-2 gap-4 h-full items-start w-max min-w-full">
          {KANBAN_COLUMNS.map((col) => {
            const isCollapsed = col.collapsible && collapsedCols[col.id];
            const colCandidatos = getCandidatosByCol(col.id);

            return (
              <div 
                key={col.id}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col h-full shrink-0 border border-slate-200/60 rounded-[32px] bg-slate-50/50 transition-all duration-500 ease-in-out ${isCollapsed ? 'w-24' : 'w-[320px]'}`}
              >
                {/* Column Header */}
                <div className={`p-5 flex items-center justify-between border-b border-slate-200/60 rounded-t-[32px] ${col.color}`}>
                  {!isCollapsed ? (
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-black uppercase tracking-[0.15em]">{col.title}</span>
                      <span className="bg-white/60 px-2 py-0.5 rounded-full text-sm font-black shadow-sm ring-1 ring-black/5">{colCandidatos.length}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center w-full gap-4 mt-6">
                      <span className="bg-white/60 flex items-center justify-center w-10 h-10 rounded-full text-sm font-black shadow-inner ring-1 ring-black/5">{colCandidatos.length}</span>
                      <div className="writing-vertical-rl text-sm font-black uppercase tracking-[0.2em] rotate-180 mb-2 whitespace-nowrap">{col.title}</div>
                    </div>
                  )}

                  {col.collapsible && (
                    <button 
                      onClick={() => setCollapsedCols(prev => ({...prev, [col.id]: !prev[col.id]}))}
                      className="p-1.5 hover:bg-white/60 rounded-xl transition-all aspect-square shrink-0 text-slate-400 hover:text-slate-900"
                    >
                      <svg className={`w-4 h-4 transition-transform duration-500 ${isCollapsed ? '-rotate-90' : 'rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
                    </button>
                  )}
                </div>

                {/* Column Body */}
                {!isCollapsed && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 kanban-scroll scroll-smooth">
                    {colCandidatos.map(c => {
                      let alertNode = null;
                      let isExpired = false;

                      if (c.prazoEnvio && (c.statusConvocacao === 'CONVOCADO' || col.id === 'AGUARDANDO_DOCUMENTACAO' || col.id === 'DOCUMENTACAO_PENDENTE')) {
                        const dataPrazo = new Date(c.prazoEnvio);
                        const hoje = new Date();
                        const diasRestantes = Math.ceil((dataPrazo.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
                        
                        if (diasRestantes < 0) {
                          isExpired = true;
                          alertNode = <div className="text-[9px] font-black text-white bg-rose-500 px-2 py-1 rounded-lg animate-pulse shadow-sm shadow-rose-200">PRAZO EXPIRADO</div>;
                        } else if (diasRestantes <= 2) {
                          alertNode = <div className="text-[9px] font-black text-amber-700 bg-amber-100 px-2 py-1 rounded-lg border border-amber-200">VENCE EM {diasRestantes} DIAS</div>;
                        } else {
                          alertNode = <div className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">RESTAM {diasRestantes} DIAS</div>;
                        }
                      }

                      const hasPendency = c.registrosConvocacao.some(r => r.observacoes?.includes('PENDÊNCIA:'));

                      return (
                        <div 
                          key={c.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, c.id)}
                          onClick={() => setSelectedCandidato(c)}
                          className={`bg-white p-5 rounded-[24px] shadow-sm border-2 transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-xl hover:scale-[1.02] group relative ${
                            isExpired ? 'border-rose-100 shadow-rose-50' : 
                            c.tipoVaga === 'RESERVA' ? 'border-amber-200/60 shadow-amber-50/50' :
                            'border-transparent hover:border-emerald-200 shadow-slate-200/50'
                          }`}
                        >
                          {c.tipoVaga && (
                            <div className={`absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shadow-sm ${
                              c.tipoVaga === 'IMEDIATA' ? 'bg-emerald-900 border-emerald-800 text-white' : 'bg-amber-100 border-amber-200 text-amber-700'
                            }`}>
                              {c.tipoVaga}
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-3">
                             <div className="flex flex-wrap items-center gap-1.5">
                               <div className="flex flex-col">
                                 <span className="bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">A: {c.posicaoAmpla}º</span>
                                 {c.posicaoNegro && <span className="bg-amber-600 text-white text-[7px] font-black px-1 py-0.5 rounded-md uppercase tracking-tighter mt-0.5">N: {c.posicaoNegro}º</span>}
                                 {c.posicaoPCD && <span className="bg-sky-600 text-white text-[7px] font-black px-1 py-0.5 rounded-md uppercase tracking-tighter mt-0.5">P: {c.posicaoPCD}º</span>}
                               </div>
                               {c.posicaoConvocacao && (
                                 <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter self-start">C-{c.posicaoConvocacao}</span>
                               )}
                             </div>
                             {c.registrosConvocacao.length > 0 && (
                               <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100" title="Contatos Realizados">
                                 <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                 {c.registrosConvocacao.length}
                               </div>
                             )}
                          </div>

                          <h4 className="text-[13px] font-black text-slate-800 leading-tight group-hover:text-emerald-800 transition-colors uppercase break-words">{c.nomeCandidato}</h4>
                          <div className="text-sm font-bold text-slate-400 mt-2 uppercase truncate opacity-80">{c.cargo.nome} {c.areaAtuacao && `• ${c.areaAtuacao.nome}`}</div>
                          
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg border flex items-center gap-1 ${c.modeloFormularioId ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-rose-50 text-rose-500 border-rose-100 animate-pulse'}`}>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                              {c.modeloFormulario?.nome || 'SEM FORMULÁRIO'}
                            </span>
                          </div>

                          {(alertNode || hasPendency || col.id === 'DESCLASSIFICADOS') && (
                            <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                {alertNode}
                                {col.id === 'DESCLASSIFICADOS' && (
                                  <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 uppercase">{formatStatus(c.statusConvocacao)}</span>
                                )}
                              </div>
                              {hasPendency && (
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-1.5 rounded-lg border border-orange-100">
                                  <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                  TEM PENDÊNCIAS ATIVAS
                                </div>
                              )}
                              {col.id === 'AGENDAMENTO_APRESENTACAO' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Deseja marcar este candidato como EFETIVADO (Concluído)?')) {
                                      handleDrop(null as any, 'EFETIVADO', c.id);
                                    }
                                  }}
                                  className="w-full mt-2 py-2.5 bg-emerald-600 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                                  Concluir Processo
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {colCandidatos.length === 0 && (
                      <div className="h-full min-h-[140px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[28px] bg-white/30 p-6 gap-2">
                        <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                        <span className="text-sm font-black text-slate-300 text-center uppercase tracking-widest leading-relaxed">Arraste cards para esta coluna</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* MODAL DE HISTÓRICO */}
      {selectedCandidato && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in-95 duration-500">
           <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-10 space-y-8 max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                <div className="flex-1 pr-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedCandidato.nomeCandidato}</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 mt-6">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">CPF / INSCRIÇÃO</span>
                      <span className="text-sm font-bold text-slate-700">{selectedCandidato.cpfCandidato} • {selectedCandidato.numeroInscricao}</span>
                    </div>
                    {selectedCandidato.emailCandidato && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">E-MAIL COMPLETO</span>
                        <span className="text-sm font-bold text-slate-700">{selectedCandidato.emailCandidato}</span>
                      </div>
                    )}
                    {(selectedCandidato.telefoneCandidato || selectedCandidato.celularCandidato) && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">TEL / CELULAR</span>
                        <span className="text-sm font-bold text-slate-700">{selectedCandidato.telefoneCandidato || '-'} / {selectedCandidato.celularCandidato || '-'}</span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">OCUPAÇÃO VINCULADA</span>
                      <span className="text-sm font-bold text-slate-700">{selectedCandidato.cargo?.nome} {selectedCandidato.areaAtuacao && `• ${selectedCandidato.areaAtuacao.nome}`}</span>
                    </div>
                    {(selectedCandidato.carreira || selectedCandidato.nivel) && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">CARREIRA / NÍVEL</span>
                        <span className="text-sm font-bold text-slate-700">{selectedCandidato.carreira?.nome || '-'} • {selectedCandidato.nivel?.nome || '-'}</span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">NOTA FINAL</span>
                      <span className="text-sm font-black text-emerald-600">{selectedCandidato.nota?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  
                  {selectedCandidato.enderecoCandidato && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">ENDEREÇO DE CONTATO</span>
                      <span className="text-sm font-medium text-slate-600 italic">"{selectedCandidato.enderecoCandidato}"</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-6">
                    <span className="px-3 py-1 rounded-xl text-sm font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100">Posição: {selectedCandidato.posicaoConvocacao || selectedCandidato.posicaoAmpla}º</span>
                    <span className="px-3 py-1 rounded-xl text-sm font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {selectedCandidato.modalidade?.nome || (
                        selectedCandidato.concorrenciaPCD ? 'PCD' : 
                        selectedCandidato.concorrenciaNegro ? 'Negro' : 'Ampla Concorrência'
                      )}
                    </span>
                  </div>
                </div>
                <button onClick={() => { setSelectedCandidato(null); setViewAvaliacao(false); }} className="text-slate-300 hover:text-slate-900 transition-all p-2 bg-slate-50 rounded-2xl">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              {viewAvaliacao && selectedCandidato.envios?.[0] ? (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="mb-8">
                    <button 
                      onClick={() => setViewAvaliacao(false)}
                      className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-2 transition-all hover:-translate-x-1"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                      Voltar ao Histórico
                    </button>
                  </div>
                  <AvaliacaoFormulario 
                    envio={selectedCandidato.envios[0]} 
                    esquema={selectedCandidato.modeloFormulario?.esquemaJSON}
                    editalId={editalId}
                    candidatoId={selectedCandidato.id}
                    onSave={fetchData}
                    onClose={() => setViewAvaliacao(false)}
                  />
                </div>
              ) : !showNovoRegistro ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-slate-50 p-6 rounded-[32px] border border-slate-200/60 shadow-inner">
                      <div className="space-y-4 flex-1 mr-4">
                        <div className="space-y-1">
                          <span className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            Status Atual
                          </span>
                          <span className={`text-base font-black uppercase block text-slate-800`}>
                            {formatStatus(selectedCandidato.statusConvocacao)}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <span className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            Modelo de Formulário
                          </span>
                          <div className="flex items-center gap-3">
                            <select 
                              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all flex-1"
                              value={selectedCandidato.modeloFormularioId || ''}
                              disabled={updatingForm}
                              onChange={(e) => handleVincularFormulario(selectedCandidato.id, e.target.value)}
                            >
                               <option value="">Selecione um formulário...</option>
                               {editalFormularios.map((f: any) => (
                                 <option key={f.id} value={f.id}>
                                   {f.nome}
                                 </option>
                               ))}
                            </select>
                            {updatingForm && <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>}
                          </div>
                          {!selectedCandidato.modeloFormularioId && (
                            <p className="text-[9px] font-black text-rose-500 uppercase animate-pulse mt-1">⚠️ Obrigatório para Convocar</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 shrink-0">
                        <button 
                          onClick={() => handleReverterConvocacao(selectedCandidato.id)}
                          className="px-5 py-3 text-rose-600 hover:bg-rose-50 text-sm font-black uppercase tracking-widest rounded-2xl transition-all border border-rose-200 shadow-sm"
                        >
                          Desfazer
                        </button>
                        <button 
                          onClick={() => setShowNovoRegistro(true)}
                          className="px-8 py-4 bg-slate-100 text-slate-600 font-black rounded-[20px] hover:bg-slate-200 transition-all flex items-center gap-2.5 text-[11px] uppercase tracking-widest group"
                        >
                          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
                          Novo Registro
                        </button>
                        {selectedCandidato.envios?.length > 0 && (
                          <button 
                            onClick={() => setViewAvaliacao(true)}
                            className="px-8 py-4 bg-slate-900 text-white font-black rounded-[20px] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-2.5 text-[11px] uppercase tracking-widest group"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                            Avaliar Documentos
                          </button>
                        )}
                        {selectedCandidato.statusConvocacao === 'AGENDAMENTO_APRESENTACAO' && (
                          <button 
                            onClick={() => {
                              if (confirm('Deseja marcar este candidato como EFETIVADO (Concluído)?')) {
                                handleDrop(null, 'EFETIVADO', selectedCandidato.id);
                                setSelectedCandidato(null);
                              }
                            }}
                            className="px-8 py-4 bg-emerald-600 text-white font-black rounded-[20px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center gap-2.5 text-[11px] uppercase tracking-widest group"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                            Concluir Processo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pl-6 border-l-4 border-slate-100 space-y-10 py-4 relative">
                    {selectedCandidato.registrosConvocacao.length === 0 ? (
                      <div className="text-sm font-bold text-slate-400 italic bg-slate-50 p-6 rounded-[28px] border border-dashed border-slate-200 text-center uppercase tracking-widest">Nenhum evento registrado ainda.</div>
                    ) : (
                      selectedCandidato.registrosConvocacao.map((reg, index) => (
                        <div key={reg.id} className="relative">
                          <div className="absolute -left-[30px] w-4 h-4 bg-white border-4 border-emerald-500 rounded-full mt-2 ring-8 ring-emerald-50 shadow-sm"></div>
                          <div className="bg-white border border-slate-100 rounded-[28px] p-7 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest block mb-1">Meio / Fase</span>
                                <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">{reg.meioUtilizado}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest block mb-1">Data/Hora</span>
                                <span className="text-sm font-black text-slate-700">{new Date(reg.dataConvocacao).toLocaleString('pt-BR')}</span>
                              </div>
                            </div>
                            <div className="space-y-4">
                              {reg.prazoDocumentacao && (
                                <div className="flex items-center gap-2 bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
                                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                  <p className="text-[11px] font-black text-indigo-700 uppercase"><strong className="opacity-60">Prazo Final:</strong> {new Date(reg.prazoDocumentacao).toLocaleDateString('pt-BR')}</p>
                                </div>
                              )}
                              {reg.observacoes && (
                                <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-[20px] border border-slate-100 leading-relaxed font-bold italic">
                                  "{reg.observacoes}"
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="animate-in slide-in-from-right-8 duration-500">
                  <div className="mb-8">
                    <button 
                      onClick={() => setShowNovoRegistro(false)}
                      className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-2 transition-all hover:-translate-x-1"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                      Voltar ao Histórico
                    </button>
                  </div>
                  <form onSubmit={handleSalvarRegistro} className="space-y-6 bg-slate-50 p-8 rounded-[36px] border border-slate-200/60 shadow-inner">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </div>
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Novo Evento de Convocação</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] pl-1">Meio ou Fase</label>
                        <select 
                          required
                          value={novoRegistro.meioUtilizado}
                          onChange={(e) => setNovoRegistro({...novoRegistro, meioUtilizado: e.target.value})}
                          className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-[20px] outline-none focus:border-emerald-500 font-bold text-sm text-slate-700 appearance-none shadow-sm transition-all"
                        >
                          <option>Diário Oficial</option>
                          <option>E-mail</option>
                          <option>Ligação Telefônica</option>
                          <option>WhatsApp / SMS</option>
                          <option>Carta / Correios</option>
                          <option>Devolução c/ Pendência</option>
                          <option>Agendamento Confirmado</option>
                          <option>Outro</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] pl-1">Prazo para Ação</label>
                        <input 
                          type="datetime-local" 
                          required
                          value={novoRegistro.prazoDocumentacao}
                          onChange={(e) => setNovoRegistro({...novoRegistro, prazoDocumentacao: e.target.value})}
                          className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-[20px] outline-none focus:border-emerald-500 font-bold text-sm text-slate-700 shadow-sm transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] pl-1">Observações ou Pendências</label>
                      <textarea 
                        value={novoRegistro.observacoes}
                        onChange={(e) => setNovoRegistro({...novoRegistro, observacoes: e.target.value})}
                        placeholder="Ex: Faltou comprovante de residência. Detalhes do agendamento..."
                        className="w-full h-32 px-5 py-4 bg-white border-2 border-slate-100 rounded-[24px] outline-none focus:border-emerald-500 font-bold text-sm text-slate-700 resize-none shadow-sm transition-all"
                      />
                    </div>
                    
                    {/* Opções de Automação */}
                    <div className="bg-white/60 p-5 rounded-[24px] border border-slate-200/60 flex items-center justify-between">
                       <div className="space-y-1">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Automação de Fluxo</label>
                          <span className="text-[13px] font-bold text-slate-600 block">Avançar para Aguardando Documentação</span>
                          {!selectedCandidato.modeloFormularioId && (
                            <span className="text-[9px] font-black text-rose-500 uppercase block">⚠️ Requer formulário vinculado</span>
                          )}
                       </div>
                       <div className="relative inline-flex items-center cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            disabled={!selectedCandidato.modeloFormularioId}
                            checked={novoRegistro.avancarParaDocumentacao}
                            onChange={(e) => setNovoRegistro({...novoRegistro, avancarParaDocumentacao: e.target.checked})}
                          />
                          <div className={`w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 ${!selectedCandidato.modeloFormularioId ? 'opacity-30 cursor-not-allowed' : ''}`}></div>
                       </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        type="submit" 
                        disabled={savingRecord}
                        className="px-10 py-5 bg-emerald-600 text-white font-black uppercase text-[12px] tracking-[0.25em] rounded-[24px] hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 flex items-center gap-3 disabled:opacity-50"
                      >
                        {savingRecord ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Salvar Registro'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
           </div>
        </div>
      )}

      <style jsx global>{`
        .kanban-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .kanban-scroll::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.02);
          border-radius: 10px;
        }
        .kanban-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .kanban-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0,0,0,0.2);
        }
        .writing-vertical-rl {
          writing-mode: vertical-rl;
        }
      `}</style>
    </div>
  );
}
