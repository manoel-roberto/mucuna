'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

export default function CandidatoPage() {
  const [classificacoes, setClassificacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [selectedClas, setSelectedClas] = useState<any>(null);

  // Estado para edição de dados pessoais (unificado)
  const [contatoData, setContatoData] = useState({
    email: '',
    telefone: '',
    endereco: '',
  });

  // Novos estados para preenchimento de formulário
  const [formResponses, setFormResponses] = useState<Record<string, string>>({});
  const [formFiles, setFormFiles] = useState<Record<string, File>>({});
  const [removedFields, setRemovedFields] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClassificacoes();
  }, []);

  const handleSubmitForm = async (finalizar: boolean = false) => {
    if (!selectedForm || !selectedClas) return;
    
    // Validar obrigatoriedade apenas se for FINALIZAR
    if (finalizar) {
      const fields = selectedForm.modeloFormulario?.esquemaJSON?.fields || [];
      const envioExistente = (selectedClas.envios || []).find((e: any) => e.modeloFormularioId === selectedForm.modeloFormularioId);
      
      for (const field of fields) {
        if (field.required) {
          const jaTemArquivo = envioExistente?.arquivos?.some((a: any) => a.campoChave === field.id);
          if (field.type === 'FILE' && !formFiles[field.id] && !jaTemArquivo) {
            alert(`O campo "${field.label}" é obrigatório.`);
            return;
          }
          if (field.type !== 'FILE' && !formResponses[field.id]) {
            alert(`O campo "${field.label}" é obrigatório.`);
            return;
          }
        }
      }
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('classificacaoId', selectedClas.id);
      formData.append('modeloId', selectedForm.modeloFormularioId);
      formData.append('respostas', JSON.stringify(formResponses));
      
      // Adicionar arquivos
      Object.entries(formFiles).forEach(([fieldId, file]) => {
        formData.append('arquivos', file, `${fieldId}.pdf`);
      });

      const res = await fetch(`${API_URL}/portal-candidato/enviar-documentos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        
        if (finalizar) {
          // Chamar endpoint de finalização
          const finalRes = await fetch(`${API_URL}/portal-candidato/finalizar/${result.id}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (finalRes.ok) {
            alert('Documentação finalizada com sucesso! Seus documentos agora estão em avaliação.');
          } else {
            alert('Documentos salvos, mas houve um erro ao finalizar. Tente clicar em Finalizar novamente.');
          }
        } else {
          alert('Rascunho salvo com sucesso!');
        }
        
        setSelectedForm(null);
        setFormResponses({});
        setFormFiles({});
        fetchClassificacoes();
      } else {
        const error = await res.json();
        alert(error.message || 'Erro ao salvar. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao enviar formulário', err);
      alert('Erro de conexão.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchClassificacoes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/minhas-classificacoes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        let data = await res.json();
        
        // Sincronização resiliente: Se houver modeloFormularioId mas não houver o objeto, buscar manualmente
        const updatedData = await Promise.all(data.map(async (clas: any) => {
          if (clas.modeloFormularioId && !clas.modeloFormulario) {
            try {
              const modelRes = await fetch(`${API_URL}/formularios/${clas.modeloFormularioId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (modelRes.ok) {
                const modelo = await modelRes.json();
                return { ...clas, modeloFormulario: modelo };
              }
            } catch (e) {
              console.error('Erro ao buscar modelo de formulário individualmente', e);
            }
          }
          return clas;
        }));

        setClassificacoes(updatedData);
        if (updatedData.length > 0) {
          setContatoData({
            email: updatedData[0].emailCandidato || '',
            telefone: updatedData[0].telefoneCandidato || '',
            endereco: updatedData[0].enderecoCandidato || '',
          });
        }
      }
    } catch (err) {
      console.error('Erro ao buscar classificações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDados = async () => {
    if (!classificacoes[0]) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      // Corrigindo URL: adicionando prefixo /minhas-classificacoes
      const res = await fetch(`${API_URL}/minhas-classificacoes/confirmar-dados/${classificacoes[0].id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // Mapeando para os nomes de campos que o backend espera
        body: JSON.stringify({
          emailCandidato: contatoData.email,
          telefoneCandidato: contatoData.telefone,
          enderecoCandidato: contatoData.endereco
        }),
      });
      if (res.ok) {
        alert('Dados salvos com sucesso!');
        fetchClassificacoes();
      } else {
        alert('Erro ao salvar dados.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartForm = (clas: any, form: any) => {
    if (!clas.dadosConfirmados) {
      alert('Por favor, confirme seus dados de contato no painel superior antes de prosseguir.');
      return;
    }
    
    // Buscar rascunho existente
    const envioExistente = (clas.envios || []).find((e: any) => e.modeloFormularioId === form.modeloFormularioId);
    if (envioExistente) {
      setFormResponses(envioExistente.respostasJSON || {});
    } else {
      setFormResponses({});
    }
    
    setFormFiles({});
    setRemovedFields({});
    setSelectedClas(clas);
    setSelectedForm(form);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-1000">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-accent-mucuna/10 border-t-accent-mucuna rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-primary-mucuna rounded-xl animate-pulse"></div>
          </div>
        </div>
        <p className="mt-8 text-xs font-black text-primary-mucuna/60 uppercase tracking-[0.4em] animate-pulse">Sincronizando Ecossistema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20 max-w-7xl mx-auto">
      {/* SEÇÃO: MEUS DADOS - ORGANIC STYLE */}
      <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center justify-between pl-4">
          <div className="space-y-1">
             <h2 className="text-3xl font-black text-primary-mucuna tracking-tighter uppercase italic flex items-center gap-4">
               <span className="w-1.5 h-8 bg-accent-mucuna rounded-full opacity-40"></span>
               Identidade <span className="text-accent-mucuna not-italic">Digital.</span>
             </h2>
             <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest pl-5">Gerenciamento de Dados de Contato</p>
          </div>
          {classificacoes.length > 0 && classificacoes[0].dadosConfirmados && (
            <div className="flex items-center gap-2 px-6 py-2 bg-support-mucuna/10 border border-support-mucuna/20 rounded-full">
               <div className="w-1.5 h-1.5 bg-support-mucuna rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
               <span className="text-[9px] font-black text-support-mucuna uppercase tracking-widest">Verificado</span>
            </div>
          )}
        </div>

        <div className="bg-white/40 backdrop-blur-3xl rounded-[56px] shadow-3xl shadow-primary-mucuna/5 border border-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-mucuna/5 rounded-full blur-[80px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="p-12 md:p-16 flex flex-col xl:flex-row gap-16 relative">
            {/*Avatar/Info Fixa */}
            <div className="flex flex-col items-center gap-6 shrink-0 md:bg-primary-mucuna/5 md:p-12 md:rounded-[48px] border border-primary-mucuna/5">
              <div className="w-28 h-28 bg-primary-mucuna rounded-[40px] flex items-center justify-center text-accent-mucuna shadow-2xl shadow-primary-mucuna/20 transform hover:-rotate-6 transition-transform cursor-default">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xl font-black text-primary-mucuna tracking-tight italic">{classificacoes[0]?.nomeCandidato || 'Candidato'}</p>
                <div className="flex items-center justify-center gap-2">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento:</span>
                   <span className="text-[10px] font-black text-primary-mucuna/60 uppercase tracking-widest">{classificacoes[0]?.cpfCandidato}</span>
                </div>
              </div>
            </div>

            {/* Form de Edição */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-4">E-mail Operacional</label>
                <input 
                  type="email"
                  value={contatoData.email}
                  disabled={classificacoes[0]?.dadosConfirmados}
                  onChange={e => setContatoData({...contatoData, email: e.target.value})}
                  className="w-full px-8 py-5 bg-white border border-primary-mucuna/5 rounded-3xl outline-none focus:border-accent-mucuna/30 focus:shadow-xl focus:shadow-accent-mucuna/5 transition-all font-bold text-primary-mucuna placeholder:text-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-4">Comunicação Link</label>
                <input 
                  type="text"
                  value={contatoData.telefone}
                  disabled={classificacoes[0]?.dadosConfirmados}
                  onChange={e => setContatoData({...contatoData, telefone: e.target.value})}
                  className="w-full px-8 py-5 bg-white border border-primary-mucuna/5 rounded-3xl outline-none focus:border-accent-mucuna/30 focus:shadow-xl focus:shadow-accent-mucuna/5 transition-all font-bold text-primary-mucuna placeholder:text-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-3 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-4">Localização Residencial</label>
                <input 
                  type="text"
                  value={contatoData.endereco}
                  disabled={classificacoes[0]?.dadosConfirmados}
                  onChange={e => setContatoData({...contatoData, endereco: e.target.value})}
                  className="w-full px-8 py-5 bg-white border border-primary-mucuna/5 rounded-3xl outline-none focus:border-accent-mucuna/30 focus:shadow-xl focus:shadow-accent-mucuna/5 transition-all font-bold text-primary-mucuna placeholder:text-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="Logradouro, Bairro, Cidade - UF"
                />
              </div>
              
              <div className="md:col-span-2 pt-6 flex justify-end">
                {!classificacoes[0]?.dadosConfirmados ? (
                  <button 
                    onClick={handleSaveDados}
                    disabled={saving}
                    className="px-12 py-5 bg-primary-mucuna text-accent-mucuna text-[10px] font-black uppercase tracking-[0.2em] italic rounded-[24px] hover:bg-black hover:-translate-y-1 transition-all shadow-2xl shadow-primary-mucuna/20 disabled:bg-slate-300 active:scale-95"
                  >
                    {saving ? 'Validando...' : 'Autenticar Documentos'}
                  </button>
                ) : (
                  <button 
                    disabled
                    className="px-12 py-5 bg-support-mucuna/10 text-support-mucuna text-[10px] font-black uppercase tracking-[0.2em] rounded-[24px] border border-support-mucuna/20"
                  >
                    Identidade Bloqueada pela Segurança
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO: MEUS EDITAIS */}
      <section className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
        <div className="flex flex-col gap-1 pl-4">
           <h1 className="text-3xl font-black text-primary-mucuna tracking-tighter uppercase italic">Fluxos de <span className="text-accent-mucuna not-italic">Habilitação.</span></h1>
           <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest pl-1">Processos Seletivos Vinculados</p>
        </div>
        
        <div className="grid grid-cols-1 gap-10">
          {classificacoes.length > 0 ? (
            classificacoes.map((clas) => (
              <div key={clas.id} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="bg-white/60 backdrop-blur-3xl rounded-[56px] shadow-3xl shadow-primary-mucuna/5 border border-white overflow-hidden group">
                  <div className="p-10 bg-primary-mucuna/5 border-b border-primary-mucuna/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 bg-accent-mucuna rounded-full animate-pulse" />
                         <h3 className="text-xl font-black text-primary-mucuna uppercase tracking-tighter italic">{clas.edital.titulo}</h3>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 pl-5">
                        {clas.cargo?.nome || 'Geral'} // {clas.modalidade?.nome || 'Ampla'} // Posição {clas.posicaoConvocacao || clas.posicaoAmpla}º
                      </p>
                    </div>
                    <div className="px-6 py-2 bg-white rounded-2xl border border-primary-mucuna/5 text-[9px] font-black text-primary-mucuna/40 uppercase tracking-widest shadow-inner shrink-0">
                      SITUAÇÃO: {clas.situacao.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div className="px-10 pt-10">
                    {clas.statusConvocacao === 'EFETIVADO' && (
                      <div className="bg-primary-mucuna border border-primary-mucuna/20 rounded-[40px] p-8 flex items-center gap-8 shadow-2xl relative overflow-hidden group/alert">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-support-mucuna/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-support-mucuna shrink-0 border border-white/10 shadow-inner group-hover/alert:scale-110 transition-transform">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-white uppercase tracking-tight italic">Fluxo <span className="text-support-mucuna not-italic">Consolidado.</span></h4>
                          <p className="text-[11px] font-bold text-white/50 leading-relaxed max-w-md uppercase tracking-tight">O processo de habilitação foi concluído com sucesso. Acesso concedido em modo de consulta persistente.</p>
                        </div>
                      </div>
                    )}

                    {clas.statusConvocacao === 'DOCUMENTACAO_PENDENTE' && (
                      <div className="bg-rose-500 border border-rose-600 rounded-[40px] p-8 flex items-center gap-8 shadow-2xl shadow-rose-500/10 relative overflow-hidden group/alert">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-rose-500 shadow-xl shrink-0 font-black text-2xl italic">!</div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-white uppercase tracking-tight italic">Atenção Próxima <span className="text-black/30 not-italic">Inconsistência.</span></h4>
                          <p className="text-[11px] font-bold text-white/70 leading-relaxed max-w-md uppercase tracking-tight">Detectamos campos que necessitam de intervenção imediata. Revise as marcações abaixo para prosseguir.</p>
                        </div>
                      </div>
                    )}

                    {clas.statusConvocacao === 'AGENDAMENTO_APRESENTACAO' && (
                      <div className="bg-support-mucuna/5 border-2 border-support-mucuna/20 border-dashed rounded-[40px] p-8 flex items-center gap-8 relative group/alert">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-support-mucuna shadow-xl shadow-support-mucuna/5 shrink-0 border border-support-mucuna/10 group-hover/alert:rotate-6 transition-transform">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-primary-mucuna uppercase tracking-tight italic">Agendamento de <span className="text-support-mucuna not-italic">Apresentação.</span></h4>
                          <p className="text-[11px] font-black text-primary-mucuna/40 uppercase tracking-widest mt-1">
                            Data e Horário Fixados: <span className="bg-primary-mucuna text-white px-4 py-1.5 rounded-full ml-2 shadow-lg shadow-primary-mucuna/10">{clas.prazoEnvio ? new Date(clas.prazoEnvio).toLocaleString('pt-BR') : 'SINCRONIZANDO...'}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-10 space-y-6">
                    {(() => {
                      const generalForms = (clas.edital.formularios || [])
                        .filter((ef: any) => ef.modeloFormulario)
                        .map((ef: any) => ({ ...ef, source: 'edital' }));

                      const convocationForm = (clas.modeloFormularioId && clas.modeloFormulario)
                        ? [{ 
                            id: `convocacao-${clas.id}`, 
                            modeloFormulario: clas.modeloFormulario, 
                            modeloFormularioId: clas.modeloFormularioId, 
                            source: 'convocacao', 
                            obrigatorio: true 
                          }]
                        : [];

                      const allForms = convocationForm.length > 0 ? convocationForm : generalForms;
                      const uniqueForms = Array.from(new Map(
                        allForms.map((f: any) => [f.modeloFormularioId, f])
                      ).values());

                      const isEfetivado = clas.statusConvocacao === 'EFETIVADO';

                      if (uniqueForms.length > 0) {
                        return (
                          <div className={`space-y-5 ${isEfetivado ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                            <div className="flex items-center gap-3 mb-4 pl-2">
                              <span className="w-4 h-1 bg-accent-mucuna rounded-full opacity-40"></span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[.3em] italic">
                                Documentação Requerida para {clas.statusConvocacao.replace(/_/g, ' ')}
                              </span>
                            </div>
                            {uniqueForms.map((ef: any) => {
                              const modelo = ef.modeloFormulario;
                              if (!modelo && ef.modeloFormularioId) {
                                 return (
                                   <div key={ef.id || ef.modeloFormularioId} className="p-8 rounded-[40px] border border-accent-mucuna/20 bg-accent-mucuna/5 flex items-center justify-between">
                                      <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-accent-mucuna shadow-inner">
                                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                        </div>
                                        <div>
                                          <p className="font-black text-primary-mucuna text-sm uppercase tracking-tight italic">Sincronizando Módulos...</p>
                                          <p className="text-[9px] font-black text-accent-mucuna uppercase tracking-widest mt-1">Carregando formulário específico via Node-Live</p>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => window.location.reload()}
                                        className="px-8 py-3 bg-accent-mucuna text-primary-mucuna text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black hover:text-white transition-all shadow-xl shadow-accent-mucuna/10"
                                      >
                                        Atualizar Loop
                                      </button>
                                   </div>
                                 );
                              }
                              return (
                                <div key={ef.id || ef.modeloFormularioId} className="flex flex-col md:flex-row items-center justify-between p-8 rounded-[40px] border border-primary-mucuna/5 hover:border-accent-mucuna/20 hover:bg-white transition-all group/item gap-6">
                                  <div className="flex items-center gap-6 flex-1">
                                    <div className="w-16 h-16 bg-white rounded-3xl shadow-soft flex items-center justify-center text-primary-mucuna/20 group-hover/item:text-accent-mucuna transition-all group-hover/item:rotate-12 group-hover/item:scale-110">
                                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-4">
                                        <p className="text-lg font-black text-primary-mucuna tracking-tighter italic group-hover/item:text-accent-mucuna transition-colors">{modelo?.nome || 'Instância sem Identificador'}</p>
                                        {clas.envios?.some((e: any) => e.modeloFormularioId === ef.modeloFormularioId && e.statusAvaliacao === 'REJEITADO') && (
                                          <span className="px-3 py-1 bg-rose-500 text-white text-[8px] font-black uppercase rounded-lg tracking-widest animate-pulse shadow-lg shadow-rose-500/20">
                                            Ação Necessária ⚠️
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {ef.obrigatorio ? 'Compromisso Obrigatório' : 'Ação Opcional'} • {ef.source === 'convocacao' ? 'Específico ao Perfil' : 'Geral do Processo'}
                                      </p>
                                    </div>
                                  </div>
                                    <button 
                                      onClick={() => handleStartForm(clas, ef)}
                                      className={`px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-95 ${
                                        clas.envios?.some((e: any) => e.modeloFormularioId === ef.modeloFormularioId)
                                          ? 'bg-support-mucuna/10 text-support-mucuna border border-support-mucuna/20 hover:bg-support-mucuna hover:text-white'
                                          : 'bg-primary-mucuna text-accent-mucuna hover:bg-black'
                                      }`}
                                    >
                                      {clas.envios?.some((e: any) => e.modeloFormularioId === ef.modeloFormularioId && e.statusAvaliacao === 'REJEITADO')
                                        ? 'Retificar Envio' 
                                        : clas.envios?.some((e: any) => e.modeloFormularioId === ef.modeloFormularioId && e.finalizado) 
                                          ? 'Ver Protocolo' 
                                          : clas.envios?.some((e: any) => e.modeloFormularioId === ef.modeloFormularioId)
                                            ? 'Retomar Rascunho'
                                            : 'Iniciar Entrega'
                                      }
                                    </button>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }

                      if (clas.modeloFormularioId && !clas.modeloFormulario) {
                        return (
                          <div className="p-10 bg-accent-mucuna/5 rounded-[48px] border border-accent-mucuna/20 border-dashed text-center space-y-3">
                            <p className="text-accent-mucuna font-black uppercase text-xs tracking-[0.3em] italic">⚠️ Protocolo Pendente</p>
                            <p className="text-primary-mucuna/60 text-[11px] font-bold uppercase tracking-tight max-w-sm mx-auto leading-relaxed">
                              Existe um fluxo específico vinculado à sua identidade digital, mas a sincronização falhou. Tente um <span className="text-accent-mucuna">refresh forçado.</span>
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div className="text-center py-12">
                          <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest italic animate-pulse">Nenhum fluxo de formulário detectado para esta instância.</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/40 backdrop-blur-2xl rounded-[64px] p-24 border-2 border-dashed border-primary-mucuna/5 flex flex-col items-center gap-8 justify-center animate-in zoom-in duration-1000">
              <div className="w-24 h-24 bg-primary-mucuna/5 rounded-[40px] flex items-center justify-center text-primary-mucuna/10 transform rotate-12">
                <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div className="text-center space-y-2">
                 <p className="text-primary-mucuna font-black uppercase tracking-[0.4em] text-sm italic">Vácuo Administrativo</p>
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Nenhuma habilitação vinculada a este documento fiscal.</p>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* VISUALIZAÇÃO DO FORMULÁRIO (Simplificada para este exemplo) */}
      {selectedForm && (() => {
        const envio = (selectedClas.envios || []).find((e: any) => e.modeloFormularioId === selectedForm.modeloFormularioId);
        const isFinalizado = envio?.finalizado && envio?.statusAvaliacao !== 'REJEITADO';
        const isRejeitado = envio?.statusAvaliacao === 'REJEITADO';

        return (
          <div className="fixed inset-0 bg-primary-mucuna/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="bg-white/90 backdrop-blur-[40px] rounded-[56px] shadow-3xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-500 border border-white">
              <div className="p-12 border-b border-primary-mucuna/5 flex justify-between items-center bg-white/50">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-primary-mucuna tracking-tighter italic uppercase">{selectedForm.modeloFormulario?.nome}</h2>
                  <div className="flex items-center gap-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{selectedClas.edital.titulo}</p>
                    {isFinalizado && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-support-mucuna/10 border border-support-mucuna/20 rounded-full">
                         <div className="w-1 h-1 bg-support-mucuna rounded-full" />
                         <span className="text-[8px] font-black text-support-mucuna uppercase tracking-widest">Protocolado</span>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedForm(null)}
                  className="w-14 h-14 bg-white border border-primary-mucuna/5 rounded-2xl flex items-center justify-center text-primary-mucuna/20 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-90"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-12 space-y-10 max-h-[65vh] overflow-y-auto custom-scrollbar">
                {isFinalizado && (
                  <div className="bg-support-mucuna/5 p-8 rounded-[40px] border border-support-mucuna/10 flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-support-mucuna shadow-xl shadow-support-mucuna/5 shrink-0 border border-support-mucuna/5">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    </div>
                    <p className="text-[11px] font-bold text-primary-mucuna/60 leading-relaxed uppercase tracking-tight">
                      Este fluxo foi <span className="text-support-mucuna">consolidado no sistema.</span> O acesso agora é restrito à consulta de conformidade.
                    </p>
                  </div>
                )}

                {isRejeitado && (
                  <div className="bg-rose-500 p-8 rounded-[40px] border border-rose-600 shadow-2xl shadow-rose-500/10 space-y-5">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-xl shrink-0 italic font-black text-2xl">!</div>
                      <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Inconsistência Operacional Detectada</p>
                    </div>
                    {envio.mensagemAvaliacao && (
                      <div className="bg-black/10 p-6 rounded-3xl border border-white/10 italic leading-relaxed">
                        <p className="text-xs font-bold text-white/90">"{envio.mensagemAvaliacao}"</p>
                      </div>
                    )}
                    <p className="text-[9px] font-black text-white uppercase tracking-widest pl-2">
                      Verifique os campos marcados, aplique as correções e realize um novo disparo de entrega.
                    </p>
                  </div>
                )}

                {selectedForm.modeloFormulario?.descricao && (
                  <div className="bg-primary-mucuna/5 p-8 rounded-[36px] border border-primary-mucuna/5 italic">
                    <p className="text-xs font-bold text-primary-mucuna/60 leading-relaxed">"{selectedForm.modeloFormulario.descricao}"</p>
                  </div>
                )}

                <div className="space-y-10 text-left">
                  {selectedForm.modeloFormulario?.esquemaJSON?.fields?.map((field: any, index: number) => {
                    const responseKey = field.id || `field-${index}`;
                    const jaTemArquivo = envio?.arquivos?.find((a: any) => a.campoChave === responseKey) && !removedFields[responseKey];
                    
                    return (
                      <div key={responseKey} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                        <label className="text-xs font-black text-primary-mucuna/60 uppercase tracking-[.3em] pl-4">
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        
                        {envio?.itensAvaliacaoJSON?.[responseKey]?.status === 'REJEITADO' && (
                          <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl animate-in shake duration-700">
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-relaxed italic">
                              ⚠️ REVISAR: {envio.itensAvaliacaoJSON[responseKey].feedback || 'Conformidade não validada.'}
                            </p>
                          </div>
                        )}
                        
                        {field.type === 'FILE' ? (
                          <div className="relative group/file">
                            <input 
                              type="file"
                              accept=".pdf"
                              disabled={isFinalizado}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setFormFiles(prev => ({ ...prev, [responseKey]: file }));
                                }
                              }}
                              className="hidden"
                              id={`file-${responseKey}`}
                            />
                            <div className="flex gap-3">
                              <label 
                                htmlFor={isFinalizado ? undefined : `file-${responseKey}`}
                                className={`flex-1 px-8 py-5 rounded-3xl border-2 border-dashed flex items-center justify-between transition-all ${
                                  isFinalizado ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-default' :
                                  formFiles[responseKey] || jaTemArquivo
                                    ? 'border-support-mucuna/40 bg-support-mucuna/5 text-support-mucuna shadow-inner' 
                                    : 'border-primary-mucuna/5 bg-white text-slate-300 hover:border-accent-mucuna/30 cursor-pointer shadow-sm'
                                }`}
                              >
                                <div className="flex flex-col truncate pr-4">
                                  <span className="text-xs font-bold truncate tracking-tight">
                                    {formFiles[responseKey] ? formFiles[responseKey].name : jaTemArquivo ? 'Documento em Custódia ✓' : 'Anexar Comprovante PDF...'}
                                  </span>
                                  {jaTemArquivo && !formFiles[responseKey] && (
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {jaTemArquivo.nomeOriginal}</span>
                                  )}
                                  {formFiles[responseKey] && (
                                    <span className="text-[9px] font-black text-support-mucuna uppercase tracking-widest mt-1">Upload Preparado</span>
                                  )}
                                </div>
                                {!isFinalizado && !formFiles[responseKey] && !jaTemArquivo && (
                                  <svg className="w-6 h-6 flex-shrink-0 opacity-20 group-hover/file:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                                )}
                              </label>

                              {(formFiles[responseKey] || (jaTemArquivo && !isFinalizado)) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (formFiles[responseKey]) {
                                      const newFiles = { ...formFiles };
                                      delete newFiles[responseKey];
                                      setFormFiles(newFiles);
                                    } else {
                                      setRemovedFields(prev => ({ ...prev, [responseKey]: true }));
                                    }
                                  }}
                                  className="w-16 bg-rose-500/10 text-rose-600 rounded-3xl border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center active:scale-90"
                                  title="Expurgar arquivo"
                                >
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <input 
                            type={field.type === 'DATE' ? 'date' : field.type === 'NUMBER' ? 'number' : 'text'}
                            value={formResponses[responseKey] || ''}
                            disabled={isFinalizado}
                            onChange={(e) => setFormResponses(prev => ({ ...prev, [responseKey]: e.target.value }))}
                            className="w-full px-8 py-5 bg-white border border-primary-mucuna/5 rounded-3xl outline-none focus:border-accent-mucuna/30 focus:shadow-xl focus:shadow-accent-mucuna/5 transition-all font-bold text-primary-mucuna placeholder:text-slate-200 disabled:bg-slate-50 disabled:text-slate-400 shadow-sm"
                            placeholder={`Inserir ${field.label.toLowerCase()}...`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-12 bg-primary-mucuna/[0.02] border-t border-primary-mucuna/5 flex flex-col md:flex-row gap-6">
                <button 
                  onClick={() => setSelectedForm(null)}
                  disabled={submitting}
                  className="flex-1 py-5 bg-white border border-primary-mucuna/10 text-primary-mucuna/60 font-black rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-[0.2em] text-xs active:scale-95"
                >
                  {isFinalizado ? 'Fechar Visualização' : 'Abortar'}
                </button>
                {!isFinalizado && (
                  <>
                    <button 
                      onClick={() => handleSubmitForm(false)}
                      disabled={submitting}
                      className="flex-1 py-5 bg-white border-2 border-support-mucuna text-support-mucuna font-black rounded-3xl hover:bg-support-mucuna hover:text-white transition-all uppercase tracking-[0.2em] text-xs shadow-2xl shadow-support-mucuna/5 active:scale-95"
                    >
                      {submitting ? 'Gravando...' : 'Salvar Rascunho'}
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Deseja realmente FINALIZAR a entrega? Após este disparo, a edição será bloqueada pela segurança do sistema.')) {
                          handleSubmitForm(true);
                        }
                      }}
                      disabled={submitting}
                      className="flex-[2] py-5 bg-primary-mucuna text-accent-mucuna font-black rounded-3xl hover:bg-black transition-all uppercase tracking-[0.2em] text-xs shadow-3xl shadow-primary-mucuna/20 disabled:bg-slate-300 active:scale-95 italic"
                    >
                      {submitting ? 'Disparando...' : 'Finalizar Entrega Persistente'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
