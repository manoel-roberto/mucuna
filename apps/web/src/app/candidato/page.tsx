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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* SEÇÃO: MEUS DADOS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Meus Dados de Contato</h2>
          {classificacoes.length > 0 && classificacoes[0].dadosConfirmados && (
            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-200">
              ✓ Dados Confirmados
            </span>
          )}
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12">
            {/*Avatar/Info Fixa */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-white shadow-xl shadow-slate-200">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-900 truncate max-w-[150px]">{classificacoes[0]?.nomeCandidato || 'Candidato'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{classificacoes[0]?.cpfCandidato}</p>
              </div>
            </div>

            {/* Form de Edição */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">E-mail Personalizado</label>
                <input 
                  type="email"
                  value={contatoData.email}
                  onChange={e => setContatoData({...contatoData, email: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition-all font-bold text-slate-800"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Telefone/WhatsApp</label>
                <input 
                  type="text"
                  value={contatoData.telefone}
                  onChange={e => setContatoData({...contatoData, telefone: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition-all font-bold text-slate-800"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Endereço Residencial Completo</label>
                <input 
                  type="text"
                  value={contatoData.endereco}
                  onChange={e => setContatoData({...contatoData, endereco: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition-all font-bold text-slate-800"
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                />
              </div>
              
              <div className="md:col-span-2 pt-4 flex justify-end">
                <button 
                  onClick={handleSaveDados}
                  disabled={saving}
                  className="px-10 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200 disabled:bg-slate-300"
                >
                  {saving ? 'Salvando...' : 'Confirmar e Salvar Dados'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO: MEUS EDITAIS */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Editais e Formulários Pendentes</h2>
        
        <div className="grid grid-cols-1 gap-6">
          {classificacoes.length > 0 ? (
            classificacoes.map((clas) => (
              <div key={clas.id} className="space-y-6">
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{clas.edital.titulo}</h3>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">
                      {clas.cargo?.nome || 'Geral'} • {clas.modalidade?.nome || 'Ampla'} • Posição: {clas.posicaoConvocacao || clas.posicaoAmpla}º
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status: {clas.situacao.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="px-8 pt-8">
                  {clas.statusConvocacao === 'EFETIVADO' && (
                    <div className="bg-slate-900 border-2 border-slate-800 rounded-[28px] p-6 flex items-center gap-6 shadow-xl">
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Processo Concluído com Sucesso!</h4>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5 leading-relaxed">Você foi efetivado e o processo está encerrado. Acesso em modo leitura.</p>
                      </div>
                    </div>
                  )}

                  {clas.statusConvocacao === 'DOCUMENTACAO_PENDENTE' && (
                    <div className="bg-rose-50 border-2 border-rose-100 rounded-[28px] p-6 flex items-center gap-6 animate-pulse">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-sm shrink-0 font-black">!</div>
                      <div>
                        <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight">Pendências na Documentação</h4>
                        <p className="text-[11px] font-bold text-rose-600 mt-0.5 leading-relaxed">Revise e reenvie os formulários marcados abaixo.</p>
                      </div>
                    </div>
                  )}

                  {clas.statusConvocacao === 'AGENDAMENTO_APRESENTACAO' && (
                    <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[28px] p-6 flex items-center gap-6 border-dashed">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Agendamento de Apresentação</h4>
                        <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
                          Comparecer em: <span className="bg-white px-2 py-0.5 rounded-lg border border-emerald-100 ml-1">{clas.prazoEnvio ? new Date(clas.prazoEnvio).toLocaleString('pt-BR') : 'A definir'}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-8 space-y-4">
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

                    // Se houver um formulário específico, ele substitui os globais do edital 
                    // (Regra de negócio: Convocação Individual > Edital Geral)
                    const allForms = convocationForm.length > 0 ? convocationForm : generalForms;
                    const uniqueForms = Array.from(new Map(
                      allForms.map((f: any) => [f.modeloFormularioId, f])
                    ).values());

                    const isEfetivado = clas.statusConvocacao === 'EFETIVADO';

                    if (uniqueForms.length > 0) {
                      return (
                        <div className={`space-y-4 ${isEfetivado ? 'opacity-60 grayscale pointer-events-none' : ''}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[.2em]">
                              Fase Atual: {clas.statusConvocacao.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {uniqueForms.map((ef: any) => {
                            const modelo = ef.modeloFormulario;
                            if (!modelo && ef.modeloFormularioId) {
                               // Fallback: This will trigger if the object is missing but ID is present
                               // In a real scenario, we could use a custom component here that fetches it
                               return (
                                 <div key={ef.id || ef.modeloFormularioId} className="p-6 rounded-3xl border-2 border-amber-50 bg-amber-50/20 flex flex-col gap-4">
                                   <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500">
                                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                        </div>
                                        <div>
                                          <p className="font-black text-amber-900 text-xs uppercase tracking-tight">Carregando formulário específico...</p>
                                          <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mt-1">Clique para tentar carregar novamente</p>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => window.location.reload()}
                                        className="px-6 py-3 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-700 transition-all"
                                      >
                                        Recarregar Portal
                                      </button>
                                   </div>
                                 </div>
                               );
                            }
                            return (
                              <div key={ef.id || ef.modeloFormularioId} className="flex items-center justify-between p-6 rounded-3xl border-2 border-slate-50 hover:border-emerald-100 hover:bg-emerald-50/10 transition-all group">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3">
                                      <p className="font-black text-slate-800 tracking-tight">{modelo?.nome || 'Formulário sem nome'}</p>
                                      {clas.envios?.some((e: any) => e.modeloFormularioId === ef.modeloFormularioId && e.statusAvaliacao === 'REJEITADO') && (
                                        <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[8px] font-black uppercase rounded-lg tracking-widest border border-rose-200">
                                          Necessita Correção ⚠️
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      {ef.obrigatorio ? 'Obrigatório' : 'Opcional'} • {ef.source === 'convocacao' ? 'Específico para você' : 'Geral do edital'}
                                    </p>
                                  </div>
                                </div>
                                  <button 
                                    onClick={() => handleStartForm(clas, ef)}
                                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md ${
                                      clas.envios?.some((e: any) => e.modeloFormularioId === ef.modeloFormularioId)
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-600 hover:text-white'
                                        : 'bg-slate-800 text-white hover:bg-emerald-600'
                                    }`}
                                  >
                                    {clas.envios?.some((e: any) => e.modeloFormularioId === ef.modeloFormularioId && e.statusAvaliacao === 'REJEITADO')
                                      ? 'Corrigir e Enviar' 
                                      : clas.envios?.some((e: any) => e.modeloFormularioId === ef.modeloFormularioId && e.finalizado) 
                                        ? 'Consultar Envio' 
                                        : clas.envios?.some((e: any) => e.modeloFormularioId === ef.modeloFormularioId)
                                          ? 'Editar Rascunho'
                                          : 'Preencher agora'
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
                        <div className="p-8 bg-amber-50 rounded-3xl border-2 border-amber-100 border-dashed text-center">
                          <p className="text-amber-800 font-black uppercase text-xs tracking-widest">⚠️ Atenção</p>
                          <p className="text-amber-600 text-[10px] font-bold mt-2 uppercase tracking-tight">
                            Existe um formulário específico vinculado a você, mas ele não pôde ser carregado. 
                            Tente atualizar a página ou contate o administrador.
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="text-center py-8">
                        <p className="text-slate-400 font-bold text-sm italic">Nenhum formulário solicitado para este edital.</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[40px] p-20 border-2 border-dashed border-slate-200 flex flex-col items-center gap-6 justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm text-center">Nenhuma habilitação encontrada no sistema com seu CPF.</p>
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
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedForm.modeloFormulario?.nome}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-bold text-slate-500">{selectedClas.edital.titulo}</p>
                    {isFinalizado && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded-full tracking-widest">
                        ✓ Finalizado
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedForm(null)}
                  className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18"/></svg>
                </button>
              </div>
              <div className="p-12 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {isFinalizado && (
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    </div>
                    <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                      Este formulário foi finalizado e enviado para avaliação. Não é mais possível realizar alterações.
                    </p>
                  </div>
                )}

                {isRejeitado && (
                  <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      </div>
                      <p className="text-xs font-black text-rose-800 uppercase tracking-widest">⚠️ Documentação com Inconsistências</p>
                    </div>
                    {envio.mensagemAvaliacao && (
                      <p className="text-[11px] font-bold text-rose-600 bg-white/50 p-4 rounded-2xl italic leading-relaxed">
                        "{envio.mensagemAvaliacao}"
                      </p>
                    )}
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">
                      Por favor, verifique os campos marcados abaixo, faça as correções e finalize o envio novamente.
                    </p>
                  </div>
                )}

                {selectedForm.modeloFormulario?.descricao && (
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-600 italic">"{selectedForm.modeloFormulario.descricao}"</p>
                  </div>
                )}

                <div className="space-y-6 text-left">
                  {selectedForm.modeloFormulario?.esquemaJSON?.fields?.map((field: any) => {
                    const jaTemArquivo = envio?.arquivos?.find((a: any) => a.campoChave === field.id) && !removedFields[field.id];
                    
                    return (
                      <div key={field.id} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        
                        {envio?.itensAvaliacaoJSON?.[field.id]?.status === 'REJEITADO' && (
                          <div className="mt-1 p-3 bg-rose-50 border border-rose-100 rounded-xl animate-in shake duration-500">
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-relaxed">
                              ⚠️ INCONSISTÊNCIA: {envio.itensAvaliacaoJSON[field.id].feedback || 'Resposta ou documento não aceito.'}
                            </p>
                          </div>
                        )}
                        
                        {field.type === 'FILE' ? (
                          <div className="relative">
                            <input 
                              type="file"
                              accept=".pdf"
                              disabled={isFinalizado}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setFormFiles(prev => ({ ...prev, [field.id]: file }));
                                }
                              }}
                              className="hidden"
                              id={`file-${field.id}`}
                            />
                            <div className="flex gap-2">
                              <label 
                                htmlFor={isFinalizado ? undefined : `file-${field.id}`}
                                className={`flex-1 px-6 py-4 rounded-2xl border-2 border-dashed flex items-center justify-between transition-all ${
                                  isFinalizado ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-default' :
                                  formFiles[field.id] || jaTemArquivo
                                    ? 'border-emerald-500 bg-emerald-50/30 text-emerald-700' 
                                    : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-400 cursor-pointer'
                                }`}
                              >
                                <div className="flex flex-col truncate pr-4">
                                  <span className="text-xs font-bold truncate">
                                    {formFiles[field.id] ? formFiles[field.id].name : jaTemArquivo ? 'Documento já enviado ✓' : 'Selecionar arquivo PDF...'}
                                  </span>
                                  {jaTemArquivo && !formFiles[field.id] && (
                                    <span className="text-[8px] font-bold opacity-60">Nome: {jaTemArquivo.nomeOriginal}</span>
                                  )}
                                  {formFiles[field.id] && (
                                    <span className="text-[8px] font-bold text-emerald-600 uppercase">Novo arquivo selecionado</span>
                                  )}
                                </div>
                                {!isFinalizado && !formFiles[field.id] && !jaTemArquivo && (
                                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                                )}
                              </label>

                              {(formFiles[field.id] || (jaTemArquivo && !isFinalizado)) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (formFiles[field.id]) {
                                      const newFiles = { ...formFiles };
                                      delete newFiles[field.id];
                                      setFormFiles(newFiles);
                                    } else {
                                      setRemovedFields(prev => ({ ...prev, [field.id]: true }));
                                    }
                                  }}
                                  className="px-4 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
                                  title="Remover arquivo"
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <input 
                            type={field.type === 'DATE' ? 'date' : field.type === 'NUMBER' ? 'number' : 'text'}
                            value={formResponses[field.id] || ''}
                            disabled={isFinalizado}
                            onChange={(e) => setFormResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition-all font-bold text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                            placeholder={`Digite ${field.label.toLowerCase()}...`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                <button 
                  onClick={() => setSelectedForm(null)}
                  disabled={submitting}
                  className="flex-1 py-5 bg-white border-2 border-slate-200 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-[10px]"
                >
                  {isFinalizado ? 'Fechar' : 'Cancelar'}
                </button>
                {!isFinalizado && (
                  <>
                    <button 
                      onClick={() => handleSubmitForm(false)}
                      disabled={submitting}
                      className="flex-1 py-5 bg-white border-2 border-emerald-600 text-emerald-600 font-black rounded-2xl hover:bg-emerald-50 transition-all uppercase tracking-widest text-[10px]"
                    >
                      {submitting ? 'Salvando...' : 'Salvar Rascunho'}
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Deseja realmente FINALIZAR o envio? Após finalizar, você NÃO poderá mais editar os documentos.')) {
                          handleSubmitForm(true);
                        }
                      }}
                      disabled={submitting}
                      className="flex-[2] py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 disabled:bg-slate-300"
                    >
                      {submitting ? 'Enviando...' : 'Finalizar Entrega'}
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
