'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import Link from 'next/link';
import PermissionGuard from '@/components/PermissionGuard';

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
  percentualNegros?: number;
  percentualPCD?: number;
  baseLegal?: string;
}

export default function EditaisPage() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [tipos, setTipos] = useState<TipoEdital[]>([]);
  const [certames, setCertames] = useState<any[]>([]);
  const [regimes, setRegimes] = useState<any[]>([]);
  const [globalConfig, setGlobalConfig] = useState<any>(null);
  
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
    percentualNegros: 20,
    percentualPCD: 5,
    baseLegal: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [resE, resT, resC, resR, resConfig] = await Promise.all([
        fetch(`${API_URL}/editais`, { headers }),
        fetch(`${API_URL}/modalidades-concorrencia`, { headers }),
        fetch(`${API_URL}/certames`, { headers }),
        fetch(`${API_URL}/regimes`, { headers }),
        fetch(`${API_URL}/configuracao`, { headers })
      ]);

      if (resE.ok) setEditais(await resE.json());
      
      if (resT.ok) {
        const tiposData = await resT.json();
        setTipos(tiposData);
      }

      if (resC.ok) setCertames(await resC.json());
      if (resR.ok) setRegimes(await resR.json());
      if (resConfig.ok) setGlobalConfig(await resConfig.json());
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
      percentualNegros: globalConfig?.percentualNegrosPadrao ?? 20,
      percentualPCD: globalConfig?.percentualPCDPadrao ?? 5,
      baseLegal: globalConfig?.baseLegalTexto ?? '',
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
      percentualNegros: (edital as any).percentualNegros || 20,
      percentualPCD: (edital as any).percentualPCD || 5,
      baseLegal: (edital as any).baseLegal || '',
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
    <PermissionGuard requiredPermission="EDITAIS_LISTAR">
      <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-mucuna/5 border border-primary-mucuna/10 rounded-full">
            <div className="w-1.5 h-1.5 bg-primary-mucuna rounded-full" />
            <span className="text-sm font-black text-primary-mucuna uppercase tracking-[0.2em]">Fluxo de Admissão</span>
          </div>
          <h1 className="text-4xl font-black text-primary-mucuna font-display uppercase tracking-tighter italic leading-none">Gestão de <span className="text-accent-mucuna not-italic">Editais.</span></h1>
          <p className="text-sm text-slate-400 font-bold max-w-md">Orquestração de processos seletivos e controle de validade do ecossistema.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={openCreateModal}
            className="group relative bg-primary-mucuna hover:bg-secondary-mucuna text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-primary-mucuna/20 hover:-translate-y-1 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
            <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
            <span className="relative z-10">Novo Edital</span>
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
              <div key={edital.id} className="bg-white/70 backdrop-blur-xl rounded-[48px] p-8 shadow-2xl shadow-primary-mucuna/5 border border-white hover:shadow-primary-mucuna/10 transition-all relative group flex flex-col justify-between overflow-hidden hover:-translate-y-1">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-surface-mucuna rounded-full group-hover:bg-accent-mucuna/10 transition-colors duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${
                      edital.status === 'RASCUNHO' ? 'bg-slate-50 text-slate-400 border-slate-100' :
                      edital.status === 'ATIVO' ? 'bg-primary-mucuna/5 text-primary-mucuna border-primary-mucuna/10' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {edital.status}
                      {isExpired && edital.status === 'ATIVO' && ' • Expirado'}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(edital)} className="p-2 text-primary-mucuna/20 hover:text-primary-mucuna transition-colors" title="Editar Edital">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => deleteEdital(edital.id)} className="p-2 text-primary-mucuna/20 hover:text-rose-600 transition-colors" title="Excluir Permanentemente">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-primary-mucuna mb-2 leading-none uppercase tracking-tighter italic group-hover:text-accent-mucuna transition-colors">{edital.titulo}</h3>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-block px-2.5 py-1 bg-surface-mucuna rounded-lg text-sm font-black text-accent-mucuna uppercase tracking-widest">Ciclo {edital.ano}</div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-mucuna/5 rounded-lg border border-primary-mucuna/5">
                      <svg className="w-3 h-3 text-primary-mucuna/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                      <span className="text-sm font-black text-primary-mucuna uppercase tabular-nums">{edital._count?.classificacoes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-100">
                      <svg className="w-3 h-3 text-amber-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      <span className="text-sm font-black text-amber-600 uppercase tabular-nums">{edital._count?.formularios || 0}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-400 line-clamp-2 mb-8 h-10 leading-relaxed font-bold italic">"{edital.descricao}"</p>
                </div>
                
                <div className="relative z-10 border-t border-primary-mucuna/5 pt-6 mt-4">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <span className="block text-[9px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em] mb-1">Inscrições</span>
                        <span className={`block text-sm font-black uppercase ${isExpired ? 'text-rose-500' : 'text-primary-mucuna'}`}>
                          {edital.fimInscricoes ? new Date(edital.fimInscricoes).toLocaleDateString('pt-BR') : 'PENDENTE'}
                        </span>
                      </div>
                      {edital.dataValidadeOriginal && (
                        <div className="flex-1 border-l border-primary-mucuna/10 pl-4">
                          <span className="block text-[9px] font-black text-accent-mucuna uppercase tracking-[0.2em] mb-1">Validade</span>
                          <span className="block text-sm font-black text-primary-mucuna uppercase">
                            {new Date(edital.dataValidadeProrrogada || edital.dataValidadeOriginal).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link 
                        href={`/funcionario/editais/${edital.id}/convocacoes`}
                        className="flex items-center justify-center gap-2 bg-surface-mucuna text-primary-mucuna px-4 py-3.5 rounded-2xl border border-primary-mucuna/5 hover:bg-primary-mucuna hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-primary-mucuna/10"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <span className="text-sm font-black uppercase tracking-widest">Convocação</span>
                      </Link>
                      <Link 
                        href={`/funcionario/editais/${edital.id}/classificacao`}
                        className="flex items-center justify-center gap-2 bg-accent-mucuna/10 text-accent-mucuna px-4 py-3.5 rounded-2xl border border-accent-mucuna/10 hover:bg-accent-mucuna hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-accent-mucuna/10"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        <span className="text-sm font-black uppercase tracking-widest">Habilitados</span>
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
        <div className="fixed inset-0 bg-primary-mucuna/40 backdrop-blur-xl flex items-center justify-center p-4 z-[120] animate-in fade-in duration-500">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[56px] shadow-2xl shadow-primary-mucuna/20 max-w-md w-full p-10 space-y-8 animate-in zoom-in-95 duration-500 border border-white">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="w-12 h-1 bg-accent-mucuna rounded-full opacity-50 mb-4" />
                <h2 className="text-2xl font-black text-primary-mucuna uppercase tracking-tighter italic">Gerenciar <span className="text-accent-mucuna not-italic leading-none">{showConfigModal === 'certame' ? 'Certames' : showConfigModal === 'tipo' ? 'Modalidades' : 'Itens'}</span></h2>
                <p className="text-sm text-slate-400 font-black uppercase tracking-[0.3em]">Estrutura do Ecossistema</p>
              </div>
              <button onClick={() => setShowConfigModal(null)} className="p-2 text-primary-mucuna/20 hover:text-primary-mucuna transition-all">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
 
            <div className="flex gap-3">
              <input 
                type="text" placeholder={`Novo ${showConfigModal}...`}
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                className="flex-1 px-6 py-4 bg-surface-mucuna/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-accent-mucuna transition-all font-bold text-sm text-primary-mucuna shadow-inner"
              />
              <button onClick={handleAddItem} className="bg-primary-mucuna text-white p-4 rounded-2xl hover:bg-secondary-mucuna transition-all shadow-lg shadow-primary-mucuna/10">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
 
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {(showConfigModal === 'tipo' ? tipos : 
                showConfigModal === 'certame' ? certames : []
              ).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-surface-mucuna/30 rounded-2xl group hover:bg-white transition-all border border-transparent hover:border-primary-mucuna/5">
                  <span className="font-black text-primary-mucuna text-sm uppercase tracking-tight">{t.nome}</span>
                  <button 
                    onClick={() => handleRemoveItem(t.id)}
                    className="p-1 text-primary-mucuna/10 hover:text-rose-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              ))}
              {(showConfigModal === 'tipo' ? tipos : 
                showConfigModal === 'certame' ? certames : []
              ).length === 0 && (
                <div className="p-12 text-center text-sm text-slate-300 font-black uppercase tracking-widest italic">Nenhum registro orgânico.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-primary-mucuna/40 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-500">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[56px] shadow-2xl shadow-primary-mucuna/20 max-w-4xl w-full p-12 space-y-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500 border border-white custom-scrollbar-thick">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="w-20 h-1.5 bg-accent-mucuna rounded-full opacity-50 mb-4" />
                <h2 className="text-4xl font-black text-primary-mucuna font-display uppercase tracking-tighter italic leading-none">{editMode ? 'Editar' : 'Novo'} <span className="text-accent-mucuna not-italic">Edital.</span></h2>
                <p className="text-sm text-slate-400 font-black uppercase tracking-[0.3em]">Configuração Estratégica de Processo</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-primary-mucuna/20 hover:text-primary-mucuna transition-all">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="col-span-full space-y-2 group">
                <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna transition-colors">Título Identificador</label>
                <input 
                  type="text" required 
                  value={formData.titulo}
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                  className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner uppercase tracking-tight italic"
                  placeholder="Ex: Monitoria Geral / Reda / Concurso"
                />
              </div>
              <div className="col-span-full space-y-2 group">
                <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna transition-colors">Descrição Síntese</label>
                <textarea 
                  required rows={2}
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                  className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-bold text-primary-mucuna shadow-inner resize-none italic"
                  placeholder="Resumo das normas e diretrizes administrativas..."
                />
              </div>

              {/* Seção 1: Classificação */}
              <div className="col-span-full border-t border-primary-mucuna/5 pt-10">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-sm font-black text-accent-mucuna uppercase tracking-[0.3em]">01. Classificação Certame</span>
                  <div className="h-px flex-1 bg-primary-mucuna/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 group">
                    <div className="flex justify-between items-center pr-2">
                       <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna">Certame / Evento</label>
                       <button type="button" onClick={() => setShowConfigModal('certame')} className="text-accent-mucuna hover:scale-110 transition-transform">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
                       </button>
                    </div>
                    <div className="relative">
                      <select 
                        value={formData.certameId}
                        onChange={e => setFormData({...formData, certameId: e.target.value})}
                        className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner appearance-none cursor-pointer"
                      >
                        <option value="">Selecione...</option>
                        {certames.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-accent-mucuna">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <div className="flex justify-between items-center pr-2">
                       <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna">Regime de Trabalho</label>
                       <button type="button" onClick={() => setShowConfigModal('regime')} className="text-accent-mucuna hover:scale-110 transition-transform">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
                       </button>
                    </div>
                    <div className="relative">
                      <select 
                        value={formData.regimeId}
                        onChange={e => setFormData({...formData, regimeId: e.target.value})}
                        className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner appearance-none cursor-pointer"
                      >
                        <option value="">Selecione...</option>
                        {regimes.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-accent-mucuna">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Administrativos */}
              <div className="col-span-full border-t border-primary-mucuna/5 pt-10">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-sm font-black text-accent-mucuna uppercase tracking-[0.3em]">02. Atos e Processos</span>
                  <div className="h-px flex-1 bg-primary-mucuna/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-2 group">
                    <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna">Nº Processo SEI</label>
                    <input 
                      type="text" value={formData.numProcessoSEI}
                      onChange={e => setFormData({...formData, numProcessoSEI: e.target.value})}
                      className="w-full px-8 py-4 bg-surface-mucuna/50 border border-transparent rounded-[20px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-bold text-primary-mucuna shadow-inner"
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna">Nº COPE</label>
                    <input 
                      type="text" value={formData.numCOPE}
                      onChange={e => setFormData({...formData, numCOPE: e.target.value})}
                      className="w-full px-8 py-4 bg-surface-mucuna/50 border border-transparent rounded-[20px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-bold text-primary-mucuna shadow-inner"
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna">Ano Ciclo</label>
                    <input 
                      type="number" required 
                      value={formData.ano}
                      onChange={e => setFormData({...formData, ano: e.target.value})}
                      className="w-full px-8 py-4 bg-surface-mucuna/50 border border-transparent rounded-[20px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 col-span-full bg-surface-mucuna/20 p-8 rounded-[32px] border border-primary-mucuna/5">
                <div className="space-y-2 group">
                  <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna">Portaria Homologação</label>
                  <input 
                    type="text" value={formData.portariaHomologacao}
                    onChange={e => setFormData({...formData, portariaHomologacao: e.target.value})}
                    className="w-full px-8 py-4 bg-white border border-transparent rounded-[20px] outline-none focus:border-accent-mucuna transition-all font-bold text-primary-mucuna"
                  />
                </div>
                <div className="space-y-2 group">
                  <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna">D.O.E. Homologação</label>
                  <input 
                    type="date" value={formData.dataDOEHomologacao}
                    onChange={e => setFormData({...formData, dataDOEHomologacao: e.target.value})}
                    className="w-full px-8 py-4 bg-white border border-transparent rounded-[20px] outline-none focus:border-accent-mucuna transition-all font-black text-primary-mucuna"
                  />
                </div>
              </div>

              {/* Seção 3: Ciclo Temporal */}
              <div className="col-span-full border-t border-primary-mucuna/5 pt-10">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-sm font-black text-accent-mucuna uppercase tracking-[0.3em]">03. Janelas Temporais</span>
                  <div className="h-px flex-1 bg-primary-mucuna/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   <div className="space-y-2 group">
                     <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna">Abertura Inscrições</label>
                     <input 
                       type="date" 
                       value={formData.inicioInscricoes}
                       onChange={e => setFormData({...formData, inicioInscricoes: e.target.value})}
                       className="w-full px-8 py-4 bg-surface-mucuna/50 border border-transparent rounded-[20px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner"
                     />
                   </div>
                   <div className="space-y-2 group">
                     <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna">Encerramento</label>
                     <input 
                       type="date" 
                       value={formData.fimInscricoes}
                       onChange={e => setFormData({...formData, fimInscricoes: e.target.value})}
                       className="w-full px-8 py-4 bg-surface-mucuna/50 border border-transparent rounded-[20px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner"
                     />
                   </div>
                   <div className="space-y-2 group">
                      <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna">Envio de Documentos</label>
                      <input 
                        type="date" 
                        value={formData.prazoEnvioDocumentos}
                        onChange={e => setFormData({...formData, prazoEnvioDocumentos: e.target.value})}
                        className="w-full px-8 py-4 bg-surface-mucuna/50 border border-transparent rounded-[20px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner"
                      />
                    </div>
                </div>
              </div>

              {/* Seção 4: Parâmetros de Cotas */}
              <div className="col-span-full border-t border-primary-mucuna/5 pt-10">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-sm font-black text-accent-mucuna uppercase tracking-[0.3em]">04. Parâmetros de Cotas e Base Legal</span>
                  <div className="h-px flex-1 bg-primary-mucuna/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 group">
                        <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna">Negros (%)</label>
                        <input 
                          type="number" min="0" max="100"
                          value={formData.percentualNegros}
                          onChange={e => setFormData({...formData, percentualNegros: parseInt(e.target.value) || 0})}
                          className="w-full px-6 py-4 bg-surface-mucuna/50 border border-transparent rounded-[20px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna"
                        />
                      </div>
                      <div className="space-y-2 group">
                        <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna">PCD (%)</label>
                        <input 
                          type="number" min="0" max="100"
                          value={formData.percentualPCD}
                          onChange={e => setFormData({...formData, percentualPCD: parseInt(e.target.value) || 0})}
                          className="w-full px-6 py-4 bg-surface-mucuna/50 border border-transparent rounded-[20px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                       <p className="text-[9px] text-amber-700 font-bold leading-relaxed">
                         <span className="block mb-1 font-black uppercase tracking-tighter">Nota:</span>
                         Estes valores sobrescrevem a configuração global para este edital específico. Alterar aqui afetará o cálculo de vagas na tela de classificação.
                       </p>
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna">Texto Base Legal</label>
                    <textarea 
                      rows={5}
                      value={formData.baseLegal}
                      onChange={e => setFormData({...formData, baseLegal: e.target.value})}
                      className="w-full px-6 py-4 bg-surface-mucuna/50 border border-transparent rounded-[20px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-bold text-sm text-primary-mucuna shadow-inner resize-none italic"
                      placeholder="Transcrição da base legal para este edital..."
                    />
                  </div>
                </div>
              </div>

              {/* Seção 5: Status e Publicação */}
              <div className="col-span-full border-t border-primary-mucuna/10 pt-10 flex flex-col md:flex-row gap-8 items-center">
                 <div className="flex-1 w-full space-y-2">
                    <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest pl-4">Estágio de Publicação</label>
                    <div className="flex bg-surface-mucuna p-1.5 rounded-[24px] shadow-inner">
                      {['RASCUNHO', 'ATIVO', 'ENCERRADO'].map(s => (
                        <button
                          key={s} type="button"
                          onClick={() => setFormData({...formData, status: s as any})}
                          className={`flex-1 py-3 text-sm font-black rounded-[18px] transition-all tracking-widest ${
                            formData.status === s ? 'bg-white text-primary-mucuna shadow-xl shadow-primary-mucuna/5 scale-100' : 'text-primary-mucuna/30 hover:text-primary-mucuna/60 scale-95'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                 </div>
                 <div className="flex flex-row gap-4 w-full md:w-auto self-end">
                    <button type="button" onClick={() => setShowModal(false)} className="px-8 py-5 text-primary-mucuna/40 font-black uppercase text-sm tracking-widest hover:text-primary-mucuna transition-all">Cancelar</button>
                    <button type="submit" className="group relative px-12 py-5 bg-primary-mucuna text-white font-black uppercase text-[11px] tracking-[.3em] rounded-[24px] hover:bg-secondary-mucuna transition-all shadow-2xl shadow-primary-mucuna/30 hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
                      <span className="relative z-10">{editMode ? 'Salvar Configurações' : 'Orquestrar Edital'}</span>
                    </button>
                 </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFormulariosModal && activeEditalForForms && (
        <div className="fixed inset-0 bg-primary-mucuna/40 backdrop-blur-xl flex items-center justify-center p-4 z-[110] animate-in fade-in duration-500">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[56px] shadow-2xl shadow-primary-mucuna/20 max-w-2xl w-full p-12 space-y-10 animate-in zoom-in-95 duration-500 border border-white">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="w-16 h-1.5 bg-accent-mucuna rounded-full opacity-50 mb-4" />
                <h2 className="text-2xl font-black text-primary-mucuna font-display uppercase tracking-tighter italic">Vincular <span className="text-accent-mucuna not-italic">Formulários.</span></h2>
                <p className="text-sm text-slate-400 font-black uppercase tracking-[0.3em]">
                  Edital: {activeEditalForForms.titulo}
                </p>
              </div>
              <button onClick={() => setShowFormulariosModal(false)} className="p-2 text-primary-mucuna/20 hover:text-primary-mucuna transition-all">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar-thick">
              {availableModelos.map(modelo => {
                const isSelected = editalFormularios.includes(modelo.id);
                return (
                  <button 
                    key={modelo.id}
                    onClick={() => toggleFormulario(modelo.id)}
                    className={`flex items-center gap-6 p-6 rounded-[32px] border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-accent-mucuna bg-accent-mucuna/5 shadow-inner' 
                        : 'border-surface-mucuna bg-surface-mucuna/30 hover:border-primary-mucuna/10'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-primary-mucuna text-white rotate-12' : 'bg-white text-primary-mucuna/20'}`}>
                      {isSelected ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                      )}
                    </div>
                    <div>
                      <p className={`font-black uppercase tracking-tight text-sm italic ${isSelected ? 'text-primary-mucuna' : 'text-slate-400'}`}>{modelo.nome}</p>
                      <p className="text-[9px] font-black text-accent-mucuna/40 uppercase tracking-widest mt-1">Biblioteca Orgânica</p>
                    </div>
                  </button>
                );
              })}
              {availableModelos.length === 0 && (
                <div className="col-span-full py-16 text-center">
                  <p className="text-slate-300 font-black text-sm uppercase tracking-widest italic animate-pulse">Nenhum modelo detectado no ecossistema.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setShowFormulariosModal(false)}
                className="group relative px-10 py-5 bg-primary-mucuna text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-secondary-mucuna transition-all shadow-2xl shadow-primary-mucuna/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="relative z-10">Concluir Vínculo</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .custom-scrollbar-thick::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-thick::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-thick::-webkit-scrollbar-thumb { background: rgba(26, 67, 47, 0.1); border-radius: 10px; }
        .custom-scrollbar-thick::-webkit-scrollbar-thumb:hover { background: rgba(26, 67, 47, 0.2); }
      `}</style>
    </div>
    </PermissionGuard>
  );
}
