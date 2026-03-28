'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import Link from 'next/link';

interface TipoEdital {
  id: string;
  nome: string;
}

interface Edital {
  id: string;
  titulo: string;
  descricao: string;
  ano: number;
  status: 'RASCUNHO' | 'ATIVO' | 'ENCERRADO';
  inicioInscricoes: string | null;
  fimInscricoes: string | null;
  prazoEnvioDocumentos: string | null;
  criadoEm: string;
  _count?: {
    classificacoes: number;
    formularios: number;
  };
  certame?: { id: string, nome: string };
  carreira?: { id: string, nome: string };
  nivel?: { id: string, nome: string };
  regime?: { id: string, nome: string };
  certameId?: string;
  regimeId?: string;
  numProcessoSEI?: string;
  numCOPE?: string;
  autorizacaoDOE?: string;
  portariaHomologacao?: string;
  dataDOEHomologacao?: string;
  dataValidadeOriginal?: string;
  dataLimiteProrrogacao?: string;
  portariaProrrogacao?: string;
  dataDOEProrrogacao?: string;
  dataValidadeProrrogada?: string;
  observacaoValidade?: string;
}

export default function EditaisPage() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [tipos, setTipos] = useState<TipoEdital[]>([]);
  const [certames, setCertames] = useState<any[]>([]);
  const [regimes, setRegimes] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState<'certame' | 'carreira' | 'nivel' | 'regime' | 'tipo' | null>(null);
  const [showFormulariosModal, setShowFormulariosModal] = useState(false);
  const [activeEditalForForms, setActiveEditalForForms] = useState<Edital | null>(null);
  const [availableModelos, setAvailableModelos] = useState<any[]>([]);
  const [editalFormularios, setEditalFormularios] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    ano: new Date().getFullYear().toString(),
    status: 'RASCUNHO',
    inicioInscricoes: '',
    fimInscricoes: '',
    prazoEnvioDocumentos: '',
    certameId: '',
    regimeId: '',
    numProcessoSEI: '',
    numCOPE: '',
    autorizacaoDOE: '',
    portariaHomologacao: '',
    dataDOEHomologacao: '',
    dataValidadeOriginal: '',
    dataLimiteProrrogacao: '',
    portariaProrrogacao: '',
    dataDOEProrrogacao: '',
    dataValidadeProrrogada: '',
    observacaoValidade: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [resE, resT, resC, resR] = await Promise.all([
        fetch(`${API_URL}/editais`, { headers }),
        fetch(`${API_URL}/modalidades-concorrencia`, { headers }),
        fetch(`${API_URL}/certames`, { headers }),
        fetch(`${API_URL}/regimes`, { headers })
      ]);

      if (resE.ok) setEditais(await resE.json());
      
      if (resT.ok) {
        const tiposData = await resT.json();
        setTipos(tiposData);
      }

      if (resC.ok) setCertames(await resC.json());
      if (resR.ok) setRegimes(await resR.json());
    } catch (err) {
      console.error('Erro ao buscar dados', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditMode(false);
    setCurrentId(null);
    setFormData({
      titulo: '',
      descricao: '',
      ano: new Date().getFullYear().toString(),
      status: 'RASCUNHO',
      inicioInscricoes: '',
      fimInscricoes: '',
      prazoEnvioDocumentos: '',
      certameId: '',
      regimeId: '',
      numProcessoSEI: '',
      numCOPE: '',
      autorizacaoDOE: '',
      portariaHomologacao: '',
      dataDOEHomologacao: '',
      dataValidadeOriginal: '',
      dataLimiteProrrogacao: '',
      portariaProrrogacao: '',
      dataDOEProrrogacao: '',
      dataValidadeProrrogada: '',
      observacaoValidade: '',
    });
    setShowModal(true);
  };

  const openEditModal = (edital: Edital) => {
    setEditMode(true);
    setCurrentId(edital.id);
    setFormData({
      titulo: edital.titulo,
      descricao: edital.descricao,
      ano: edital.ano.toString(),
      status: edital.status,
      inicioInscricoes: edital.inicioInscricoes ? new Date(edital.inicioInscricoes).toISOString().split('T')[0] : '',
      fimInscricoes: edital.fimInscricoes ? new Date(edital.fimInscricoes).toISOString().split('T')[0] : '',
      prazoEnvioDocumentos: edital.prazoEnvioDocumentos ? new Date(edital.prazoEnvioDocumentos).toISOString().split('T')[0] : '',
      certameId: edital.certameId || '',
      regimeId: edital.regimeId || '',
      numProcessoSEI: edital.numProcessoSEI || '',
      numCOPE: edital.numCOPE || '',
      autorizacaoDOE: edital.autorizacaoDOE || '',
      portariaHomologacao: edital.portariaHomologacao || '',
      dataDOEHomologacao: edital.dataDOEHomologacao ? new Date(edital.dataDOEHomologacao).toISOString().split('T')[0] : '',
      dataValidadeOriginal: edital.dataValidadeOriginal ? new Date(edital.dataValidadeOriginal).toISOString().split('T')[0] : '',
      dataLimiteProrrogacao: edital.dataLimiteProrrogacao ? new Date(edital.dataLimiteProrrogacao).toISOString().split('T')[0] : '',
      portariaProrrogacao: edital.portariaProrrogacao || '',
      dataDOEProrrogacao: edital.dataDOEProrrogacao ? new Date(edital.dataDOEProrrogacao).toISOString().split('T')[0] : '',
      dataValidadeProrrogada: edital.dataValidadeProrrogada ? new Date(edital.dataValidadeProrrogada).toISOString().split('T')[0] : '',
      observacaoValidade: edital.observacaoValidade || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editMode ? `${API_URL}/editais/${currentId}` : `${API_URL}/editais`;
      const method = editMode ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchData();
        alert(editMode ? 'Edital atualizado!' : 'Edital criado!');
      } else {
        alert('Erro ao processar edital.');
      }
    } catch (err) {
      alert('Falha na comunicação.');
    }
  };

  const handleAddItem = async () => {
    if (!newItemName || !showConfigModal) return;
    const token = localStorage.getItem('token');
    const endpoint = showConfigModal === 'tipo' ? 'modalidades-concorrencia' : 
                    showConfigModal === 'certame' ? 'certames' :
                    showConfigModal === 'carreira' ? 'carreiras' :
                    showConfigModal === 'nivel' ? 'niveis' : 'regimes';
    
    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nome: newItemName })
      });
      if (res.ok) {
        setNewItemName('');
        fetchData();
      }
    } catch (error) {
       console.error(`Erro ao adicionar ${showConfigModal}:`, error);
    }
  };

  const handleRemoveItem = async (id: string) => {
    if (!showConfigModal) return;
    if (!confirm(`Remover este item de ${showConfigModal}?`)) return;
    
    const token = localStorage.getItem('token');
    const endpoint = showConfigModal === 'tipo' ? 'modalidades-concorrencia' : 
                    showConfigModal === 'certame' ? 'certames' :
                    showConfigModal === 'carreira' ? 'carreiras' :
                    showConfigModal === 'nivel' ? 'niveis' : 'regimes';
    
    try {
      const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (error) {
       console.error(`Erro ao remover ${showConfigModal}:`, error);
    }
  };

  const deleteEdital = async (id: string) => {
    if (!confirm('Excluir este edital permanentemente?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/editais/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        alert('Edital excluído com sucesso!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Erro ao excluir: ${errorData.message || 'Verifique se existem dependências vinculadas.'}`);
      }
    } catch (err) {
      alert('Erro de conexão ao tentar excluir.');
    }
  };

  const openFormulariosModal = async (edital: Edital) => {
    setActiveEditalForForms(edital);
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    try {
      const [resM, resEF] = await Promise.all([
        fetch(`${API_URL}/formularios`, { headers }),
        fetch(`${API_URL}/editais/${edital.id}/formularios`, { headers })
      ]);
      
      if (resM.ok) setAvailableModelos(await resM.json());
      if (resEF.ok) {
        const ef = await resEF.json();
        setEditalFormularios(ef.map((item: any) => item.modeloFormularioId));
      }
      setShowFormulariosModal(true);
    } catch (err) {
      console.error('Erro ao carregar formulários');
    }
  };

  const toggleFormulario = async (modeloId: string) => {
    if (!activeEditalForForms) return;
    const token = localStorage.getItem('token');
    const isLinked = editalFormularios.includes(modeloId);
    
    try {
      const res = await fetch(`${API_URL}/editais/${activeEditalForForms.id}/formularios/${modeloId}`, {
        method: isLinked ? 'DELETE' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setEditalFormularios(prev => 
          isLinked ? prev.filter(id => id !== modeloId) : [...prev, modeloId]
        );
        fetchData(); // Update counts
      }
    } catch (err) {
      console.error('Erro ao alternar formulário');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Gestão de Processos Seletivos</h1>
          <p className="text-sm text-slate-500">Crie, edite e acompanhe o status de validade dos editais.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={openCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Novo Edital
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium">Sincronizando editais...</div>
        ) : (
          editais.map((edital) => {
            const isExpired = edital.fimInscricoes && new Date(edital.fimInscricoes) < new Date();
            return (
              <div key={edital.id} className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all relative group flex flex-col justify-between overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:bg-emerald-50/50 transition-colors" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      edital.status === 'RASCUNHO' ? 'bg-slate-100 text-slate-600' :
                      edital.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {edital.status}
                      {isExpired && edital.status === 'ATIVO' && ' (Expirado)'}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => openEditModal(edital)} className="p-2 text-slate-300 hover:text-emerald-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => deleteEdital(edital.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2 leading-tight group-hover:text-emerald-900 transition-colors">{edital.titulo}</h3>
                  <p className="text-xs font-bold text-slate-400 mb-5 uppercase tracking-wide">{edital.ano}</p>
                  
                  <p className="text-sm text-slate-600 line-clamp-2 mb-8 h-10 leading-relaxed font-medium">{edital.descricao}</p>
                </div>
                
                <div className="relative z-10 border-t border-slate-50 pt-5 mt-4">
                  <div className="flex flex-col gap-5">
                    {/* Linha de Datas */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inscrições Até</span>
                        <span className={`block text-xs font-bold ${isExpired ? 'text-rose-500' : 'text-slate-900'}`}>
                          {edital.fimInscricoes ? new Date(edital.fimInscricoes).toLocaleDateString('pt-BR') : 'Não definido'}
                        </span>
                      </div>
                      {edital.dataValidadeOriginal && (
                        <div className="flex-1 border-l border-slate-100 pl-4">
                          <span className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Validade</span>
                          <span className="block text-xs font-bold text-slate-900">
                            {new Date(edital.dataValidadeProrrogada || edital.dataValidadeOriginal).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Linha de Botões */}
                    <div className="flex grid grid-cols-2 gap-3">
                      <Link 
                        href={`/funcionario/editais/${edital.id}/convocacoes`}
                        className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-3 rounded-2xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all group-actions"
                      >
                        <div className="bg-white rounded-lg p-1.5 transition-colors group-hover:bg-indigo-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Convocação</span>
                      </Link>
                      <Link 
                        href={`/funcionario/editais/${edital.id}/classificacao`}
                        className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-3 rounded-2xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all group-actions"
                      >
                        <div className="bg-white rounded-lg p-1.5 transition-colors group-hover:bg-emerald-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Habilitados</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110] animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-md w-full p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase">Gerenciar {showConfigModal}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure as opções disponíveis</p>
              </div>
              <button onClick={() => setShowConfigModal(null)} className="text-slate-200 hover:text-slate-900 transition-all">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
 
            <div className="flex gap-4">
              <input 
                type="text" placeholder={`Nome do ${showConfigModal}...`}
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                className="flex-1 px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-sm text-slate-800"
              />
              <button onClick={handleAddItem} className="bg-emerald-600 text-white p-4 rounded-[20px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
 
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {(showConfigModal === 'tipo' ? tipos : 
                showConfigModal === 'certame' ? certames : []
              ).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-emerald-50 transition-colors">
                  <span className="font-bold text-slate-700 text-sm">{t.nome}</span>
                  <button 
                    onClick={() => handleRemoveItem(t.id)}
                    className="p-1 text-slate-200 hover:text-rose-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              ))}
              {(showConfigModal === 'tipo' ? tipos : 
                showConfigModal === 'certame' ? certames : []
              ).length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 font-bold italic">Nenhum item cadastrado.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-10 space-y-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{editMode ? 'Editar' : 'Novo'} Edital</h2>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Configuração de Processo Seletivo</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-200 hover:text-slate-900 transition-all">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Título do Edital</label>
                <input 
                  type="text" required 
                  value={formData.titulo}
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  placeholder="Ex: Monitoria Geral"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Descrição resumida</label>
                <textarea 
                  required rows={2}
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800 placeholder:text-slate-300 resize-none"
                  placeholder="Resumo das normas e regras..."
                />
              </div>

              {/* Seção 1: Classificação do Certame */}
              <div className="col-span-2 border-t border-slate-50 pt-6">
                <h4 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-tighter">Classificação do Certame 🏷️</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center pr-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Certame</label>
                      <button type="button" onClick={() => setShowConfigModal('certame')} className="text-emerald-600 hover:text-emerald-700">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
                      </button>
                    </div>
                    <select 
                      value={formData.certameId}
                      onChange={e => setFormData({...formData, certameId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800 appearance-none"
                    >
                      <option value="">Selecione...</option>
                      {certames.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center pr-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Regime</label>
                      <button type="button" onClick={() => setShowConfigModal('regime')} className="text-emerald-600 hover:text-emerald-700">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
                      </button>
                    </div>
                    <select 
                      value={formData.regimeId}
                      onChange={e => setFormData({...formData, regimeId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800 appearance-none"
                    >
                      <option value="">Selecione...</option>
                      {regimes.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 2: Metadados Administrativos */}
              <div className="col-span-2 border-t border-slate-50 pt-6">
                <h4 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-tighter">Processos e Atos 📄</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nº Processo SEI</label>
                    <input 
                      type="text" value={formData.numProcessoSEI}
                      onChange={e => setFormData({...formData, numProcessoSEI: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nº COPE</label>
                    <input 
                      type="text" value={formData.numCOPE}
                      onChange={e => setFormData({...formData, numCOPE: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Autorização DOE</label>
                    <input 
                      type="text" value={formData.autorizacaoDOE}
                      onChange={e => setFormData({...formData, autorizacaoDOE: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Portaria Homologação</label>
                    <input 
                      type="text" value={formData.portariaHomologacao}
                      onChange={e => setFormData({...formData, portariaHomologacao: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">D.O.E. (Homologação)</label>
                    <input 
                      type="date" value={formData.dataDOEHomologacao}
                      onChange={e => setFormData({...formData, dataDOEHomologacao: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Controle de Validade */}
              <div className="col-span-2 border-t border-slate-50 pt-6">
                <h4 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-tighter">Ciclo de Validade ⌛</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Validade do Edital (Original)</label>
                    <input 
                      type="date" value={formData.dataValidadeOriginal}
                      onChange={e => setFormData({...formData, dataValidadeOriginal: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Limite p/ Pedir Prorrogação</label>
                    <input 
                      type="date" value={formData.dataLimiteProrrogacao}
                      onChange={e => setFormData({...formData, dataLimiteProrrogacao: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Portaria de Prorrogação</label>
                    <input 
                      type="text" value={formData.portariaProrrogacao}
                      onChange={e => setFormData({...formData, portariaProrrogacao: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">D.O.E. (Prorrogação)</label>
                    <input 
                      type="date" value={formData.dataDOEProrrogacao}
                      onChange={e => setFormData({...formData, dataDOEProrrogacao: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Validade do Edital (Prorrogada)</label>
                    <input 
                      type="date" value={formData.dataValidadeProrrogada}
                      onChange={e => setFormData({...formData, dataValidadeProrrogada: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Observações de Validade</label>
                    <textarea 
                      rows={2} value={formData.observacaoValidade}
                      onChange={e => setFormData({...formData, observacaoValidade: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800 resize-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ano Base</label>
                <input 
                  type="number" required 
                  value={formData.ano}
                  onChange={e => setFormData({...formData, ano: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                />
              </div>

              <div className="col-span-2 border-t border-slate-50 pt-6">
                 <h4 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-tighter">Janela de Prazos 🕒</h4>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Abetura de Inscrições</label>
                      <input 
                        type="date" 
                        value={formData.inicioInscricoes}
                        onChange={e => setFormData({...formData, inicioInscricoes: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Encerramento Inscrições</label>
                      <input 
                        type="date" 
                        value={formData.fimInscricoes}
                        onChange={e => setFormData({...formData, fimInscricoes: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Prazo Final para Envio de Documentos (Pós-Classificação)</label>
                       <input 
                         type="date" 
                         value={formData.prazoEnvioDocumentos}
                         onChange={e => setFormData({...formData, prazoEnvioDocumentos: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                       />
                     </div>
                 </div>
              </div>

              <div className="col-span-2 flex flex-col md:flex-row gap-6 items-center pt-8">
                 <div className="flex-1 w-full space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status Atual</label>
                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                      {['RASCUNHO', 'ATIVO', 'ENCERRADO'].map(s => (
                        <button
                          key={s} type="button"
                          onClick={() => setFormData({...formData, status: s as any})}
                          className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${
                            formData.status === s ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                 </div>
                 <div className="flex flex-row gap-3 w-full md:w-auto self-end">
                    <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all">Cancelar</button>
                    <button type="submit" className="px-10 py-4 bg-emerald-600 text-white font-black uppercase text-xs tracking-[.2em] rounded-[20px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 hover:-translate-y-1 active:translate-y-0">
                      {editMode ? 'Salvar Mudanças' : 'Publicar Edital'}
                    </button>
                 </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFormulariosModal && activeEditalForForms && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110] animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-10 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase">Vincular Formulários</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Edital: {activeEditalForForms.titulo}
                </p>
              </div>
              <button onClick={() => setShowFormulariosModal(false)} className="text-slate-200 hover:text-slate-900 transition-all">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
              {availableModelos.map(modelo => {
                const isSelected = editalFormularios.includes(modelo.id);
                return (
                  <button 
                    key={modelo.id}
                    onClick={() => toggleFormulario(modelo.id)}
                    className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-50/50' 
                        : 'border-slate-50 bg-slate-50/30 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-emerald-600 text-white' : 'bg-white text-slate-300'}`}>
                      {isSelected ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                      )}
                    </div>
                    <div>
                      <p className={`font-black uppercase tracking-tight text-xs ${isSelected ? 'text-emerald-900' : 'text-slate-600'}`}>{modelo.nome}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Biblioteca de Modelos</p>
                    </div>
                  </button>
                );
              })}
              {availableModelos.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p className="text-slate-400 font-bold text-sm italic">Nenhum modelo de formulário encontrado.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setShowFormulariosModal(false)}
                className="px-10 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-lg"
              >
                Concluir Configuração
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
