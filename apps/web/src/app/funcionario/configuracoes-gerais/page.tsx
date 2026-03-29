'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { API_URL } from '@/lib/api';

export default function ConfiguracoesGeraisPage() {
  const { user } = useUser();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/configuracao`);
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      setError('Falha ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/configuracao`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      if (!res.ok) throw new Error('Falha ao salvar');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Erro ao salvar as configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Estilizado */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-900 rounded-xl text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Parâmetros do <span className="text-emerald-500 italic">Sistema</span></h1>
          </div>
          <p className="text-slate-500 font-medium font-bold italic">Configuração de diretrizes globais, reserva de vagas e base jurídica institucional.</p>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="group relative flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 overflow-hidden"
        >
          {saving ? 'Salvando...' : (
            <>
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
              Salvar Alterações
              <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Painel de Percentuais */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
            <h2 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              Cotas e Reservas %
            </h2>

            <div className="space-y-8">
              {/* Negros */}
              <div className="group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3 pl-1 transition-colors group-focus-within:text-emerald-600">Percentual para Negros</label>
                <div className="relative flex items-center">
                  <input 
                    type="number" 
                    value={config.percentualNegrosPadrao}
                    onChange={e => setConfig({...config, percentualNegrosPadrao: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-[24px] py-4 px-6 text-2xl font-black text-slate-900 outline-none transition-all pr-12 italic"
                  />
                  <span className="absolute right-6 text-xl font-black text-slate-400 tracking-tighter">%</span>
                </div>
                <p className="text-sm text-slate-300 mt-3 pl-4 leading-relaxed font-black uppercase tracking-tight">Referência: Lei Estadual 13.182/14.</p>
              </div>

              {/* PCD */}
              <div className="group pt-6 border-t border-slate-50">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3 pl-1 transition-colors group-focus-within:text-blue-600">Percentual para PCD</label>
                <div className="relative flex items-center">
                  <input 
                    type="number"
                    value={config.percentualPCDPadrao}
                    onChange={e => setConfig({...config, percentualPCDPadrao: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-[24px] py-4 px-6 text-2xl font-black text-slate-900 outline-none transition-all pr-12 italic"
                  />
                  <span className="absolute right-6 text-xl font-black text-slate-400 tracking-tighter">%</span>
                </div>
                <p className="text-sm text-slate-300 mt-3 pl-4 leading-relaxed font-black uppercase tracking-tight">Referência: Decreto 15.353/14.</p>
              </div>
            </div>
          </section>

          {/* Dica Informativa */}
          <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 text-emerald-800 flex gap-4">
             <div className="mt-1 flex-shrink-0">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             </div>
            <p className="text-[11px] font-black uppercase tracking-wide leading-relaxed">
              Alterar esses valores afetará apenas os <span className="text-emerald-600">novos processos</span>. Dados históricos permanecerão imutáveis conforme ato de criação.
            </p>
          </div>
        </div>

        {/* Editor de Base Legal */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-slate-900 p-8 rounded-[40px] shadow-2xl shadow-slate-400/20 min-h-[500px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="flex items-center gap-2 text-sm font-black text-slate-500 uppercase tracking-[0.3em]">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
                Base Legal (Node Global)
              </h2>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              </div>
            </div>

            <textarea 
              value={config.baseLegalTexto}
              onChange={e => setConfig({...config, baseLegalTexto: e.target.value})}
              placeholder="Descreva aqui o embasamento jurídico..."
              className="flex-grow w-full bg-slate-800/40 rounded-[32px] p-8 text-slate-300 font-bold leading-loose outline-none focus:ring-2 ring-emerald-500/20 transition-all resize-none scrollbar-hide italic relative z-10"
            />
          </section>

          {/* Mensagens de Feedback */}
          <div className="flex gap-4 min-h-[48px]">
            {success && (
              <div className="flex-grow bg-emerald-600 text-white px-8 py-5 rounded-[24px] flex items-center gap-3 animate-in zoom-in duration-300 shadow-xl shadow-emerald-500/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                <span className="font-black text-sm uppercase tracking-[0.2em]">Configurações Sincronizadas com o Ecossistema</span>
              </div>
            )}
            {error && (
              <div className="flex-grow bg-rose-600 text-white px-8 py-5 rounded-[24px] flex items-center gap-3 animate-in shake duration-300 shadow-xl shadow-rose-500/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span className="font-black text-sm uppercase tracking-[0.2em]">{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
