'use client';
import { useState } from 'react';
import { API_URL } from '@/lib/api';

interface AvaliacaoFormularioProps {
  envio: any;
  esquema: any;
  onSave?: () => void;
  onClose?: () => void;
}

export default function AvaliacaoFormulario({ envio, esquema, onSave, onClose }: AvaliacaoFormularioProps) {
  const [avaliacoesItens, setAvaliacoesItens] = useState<any>(envio.itensAvaliacaoJSON || {});
  const [mensagemGeral, setMensagemGeral] = useState(envio.mensagemAvaliacao || '');
  const [statusGeral, setStatusGeral] = useState(envio.statusAvaliacao || 'PENDENTE');
  const [dataAgendamento, setDataAgendamento] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdateItem = (fieldId: string, status: 'APROVADO' | 'REJEITADO', feedback?: string) => {
    setAvaliacoesItens((prev: any) => ({
      ...prev,
      [fieldId]: { status, feedback: feedback || prev[fieldId]?.feedback || '' }
    }));
  };

  const handleSave = async (finalizar: boolean) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/envios/${envio.id}/avaliar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: finalizar ? statusGeral : 'PENDENTE',
          mensagem: mensagemGeral,
          itensAvaliacao: avaliacoesItens,
          dataAgendamento: dataAgendamento || undefined // Enviar data se houver
        })
      });
      if (res.status === 403) {
        throw new Error('Você não tem permissão para realizar esta ação. Seu perfil atual é de CANDIDATO. Por favor, saia do sistema e entre novamente como FUNCIONÁRIO.');
      }
      
      if (!res.ok) throw new Error('Erro ao salvar avaliação');
      if (onSave) onSave();
      if (finalizar && onClose) onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar avaliação');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6">
        {esquema?.fields?.map((field: any, index: number) => {
          const responseKey = field.id || `field-${index}`;
          const valor = envio.respostasJSON?.[responseKey];
          const arquivo = envio.arquivos?.find((a: any) => a.campoChave === responseKey);
          const avaliacao = avaliacoesItens[responseKey] || { status: 'PENDENTE', feedback: '' };

          return (
            <div key={responseKey} className={`p-6 rounded-[28px] border-2 transition-all ${
              avaliacao.status === 'APROVADO' ? 'bg-emerald-50/50 border-emerald-100' :
              avaliacao.status === 'REJEITADO' ? 'bg-rose-50/50 border-rose-100' :
              'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1 space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{field.label}</span>
                  
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    {field.type === 'FILE' ? (
                      arquivo ? (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-800 truncate">{arquivo.nomeOriginal}</p>
                              <p className="text-[9px] font-black text-slate-400 font-mono">{(arquivo.tamanhoBytes / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <a 
                            href={`${API_URL}/uploads/${arquivo.caminhoArmazenamento.split('/').pop()}`}
                            target="_blank"
                            className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all flex items-center gap-2"
                          >
                            Visualizar
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-rose-500 italic uppercase tracking-widest">Nenhum arquivo enviado</p>
                      )
                    ) : (
                      <p className="text-sm font-bold text-slate-700">{valor || <span className="text-slate-300 italic">Vazio</span>}</p>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-64 space-y-4 pt-6 md:pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleUpdateItem(field.id, 'APROVADO')}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                        avaliacao.status === 'APROVADO' 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:text-emerald-500'
                      }`}
                    >
                      Aprovar
                    </button>
                    <button 
                      onClick={() => handleUpdateItem(field.id, 'REJEITADO')}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                        avaliacao.status === 'REJEITADO' 
                        ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-rose-200 hover:text-rose-500'
                      }`}
                    >
                      Rejeitar
                    </button>
                  </div>

                  {avaliacao.status === 'REJEITADO' && (
                    <textarea 
                      placeholder="Explique a inconsistência..."
                      value={avaliacao.feedback || ''}
                      onChange={(e) => handleUpdateItem(field.id, 'REJEITADO', e.target.value)}
                      className="w-full h-24 p-4 bg-white border-2 border-rose-100 rounded-2xl outline-none focus:border-rose-500 font-bold text-xs text-slate-700 resize-none animate-in fade-in slide-in-from-top-2 duration-300"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 rounded-[36px] p-8 space-y-6 text-white shadow-2xl shadow-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-widest">Conclusão da Avaliação</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Defina o veredito final para este formulário</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Veredito Final</label>
            <select 
              value={statusGeral} 
              onChange={(e) => setStatusGeral(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold text-sm text-white transition-all appearance-none"
            >
              <option value="PENDENTE" className="bg-slate-900">Em Análise (Rascunho)</option>
              <option value="APROVADO" className="bg-slate-900">Aprovar Tudo</option>
              <option value="REJEITADO" className="bg-slate-900">Reprovar / Pedir Reenvio</option>
            </select>
          </div>

          {statusGeral === 'APROVADO' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest pl-2">Data da Apresentação</label>
              <input 
                type="datetime-local"
                value={dataAgendamento}
                onChange={(e) => setDataAgendamento(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border-2 border-amber-500/30 rounded-2xl outline-none focus:border-amber-500 font-bold text-sm text-white transition-all"
              />
            </div>
          )}

          <div className={`${statusGeral === 'APROVADO' ? 'col-span-2 md:col-span-1' : 'col-span-1'} space-y-2`}>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Observação Geral</label>
            <input 
              type="text"
              value={mensagemGeral}
              onChange={(e) => setMensagemGeral(e.target.value)}
              placeholder="Mensagem para o candidato..."
              className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold text-sm text-white transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
          <button 
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-8 py-4 bg-white/10 text-white font-black uppercase text-[11px] tracking-widest rounded-[20px] hover:bg-white/20 transition-all"
          >
            {saving ? 'Cuidando...' : 'Salvar Progresso'}
          </button>
          <button 
            onClick={() => {
              if (confirm('Deseja realmente FINALIZAR a avaliação? O candidato será notificado.')) {
                handleSave(true);
              }
            }}
            disabled={saving}
            className="px-10 py-4 bg-emerald-500 text-white font-black uppercase text-[11px] tracking-widest rounded-[20px] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
          >
            {saving ? 'Finalizando...' : 'Finalizar e Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}
