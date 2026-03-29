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
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Header com Glassmorphism */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/40 backdrop-blur-md p-10 rounded-[48px] border border-white/20 shadow-sm relative overflow-hidden group">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-accent-mucuna/5 rounded-full blur-3xl group-hover:bg-accent-mucuna/10 transition-colors duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-1.5 h-6 bg-accent-mucuna rounded-full" />
            <h1 className="text-4xl font-black text-primary-mucuna tracking-tighter italic uppercase">Parâmetros do Sistema</h1>
          </div>
          <p className="text-primary-mucuna/60 font-bold uppercase text-[10px] tracking-[0.2em] ml-5">Diretrizes Globais e Base Jurídica Organizada</p>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="group relative px-10 py-6 bg-primary-mucuna text-white font-black uppercase text-xs tracking-[.3em] rounded-[24px] hover:bg-secondary-mucuna transition-all shadow-2xl shadow-primary-mucuna/20 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed italic"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
          <span className="relative z-10 flex items-center gap-3">
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
            )}
            {saving ? 'Sincronizando...' : 'Confirmar Parâmetros'}
          </span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Painel de Percentuais Translúcido */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white/70 backdrop-blur-xl p-10 rounded-[56px] border border-white shadow-2xl shadow-primary-mucuna/5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-surface-mucuna rounded-full opacity-50" />
            
            <h2 className="relative z-10 flex items-center gap-3 text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.3em] mb-12 italic">
              <svg className="w-4 h-4 text-accent-mucuna" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              Cotas Institucionais
            </h2>

            <div className="space-y-12">
              {/* Negros */}
              <div className="group relative z-10">
                <label className="text-[9px] font-black text-primary-mucuna/40 uppercase tracking-[0.2em] block mb-4 ml-2 group-focus-within:text-accent-mucuna transition-all italic">Percentual para Negros</label>
                <div className="relative flex items-center">
                  <input 
                    type="number" 
                    value={config.percentualNegrosPadrao}
                    onChange={e => setConfig({...config, percentualNegrosPadrao: parseFloat(e.target.value) || 0})}
                    className="w-full bg-surface-mucuna/50 border border-transparent focus:bg-white focus:border-accent-mucuna rounded-[32px] py-6 px-10 text-4xl font-black text-primary-mucuna outline-none transition-all pr-20 italic shadow-inner tabular-nums"
                  />
                  <span className="absolute right-8 text-2xl font-black text-primary-mucuna/20 tracking-tighter">%</span>
                </div>
                <p className="text-[10px] text-primary-mucuna/20 mt-4 pl-4 font-black uppercase tracking-widest italic">Lei Estadual 13.182/14</p>
              </div>

              {/* PCD */}
              <div className="group relative z-10 pt-10 border-t border-primary-mucuna/5">
                <label className="text-[9px] font-black text-primary-mucuna/40 uppercase tracking-[0.2em] block mb-4 ml-2 group-focus-within:text-accent-mucuna transition-all italic">Percentual para PCD</label>
                <div className="relative flex items-center">
                  <input 
                    type="number"
                    value={config.percentualPCDPadrao}
                    onChange={e => setConfig({...config, percentualPCDPadrao: parseFloat(e.target.value) || 0})}
                    className="w-full bg-surface-mucuna/50 border border-transparent focus:bg-white focus:border-accent-mucuna rounded-[32px] py-6 px-10 text-4xl font-black text-primary-mucuna outline-none transition-all pr-20 italic shadow-inner tabular-nums"
                  />
                  <span className="absolute right-8 text-2xl font-black text-primary-mucuna/20 tracking-tighter">%</span>
                </div>
                <p className="text-[10px] text-primary-mucuna/20 mt-4 pl-4 font-black uppercase tracking-widest italic">Decreto 15.353/14</p>
              </div>
            </div>
          </section>

          {/* Banner de Aviso Organizado */}
          <div className="bg-primary-mucuna/5 p-8 rounded-[40px] border border-primary-mucuna/10 flex gap-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-full bg-accent-mucuna opacity-20 group-hover:opacity-100 transition-opacity" />
            <div className="mt-1 flex-shrink-0 text-accent-mucuna">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-[10px] font-black text-primary-mucuna uppercase tracking-widest leading-loose italic">
              Alterações neste núcleo afetam exclusivamente <span className="text-accent-mucuna">novos protocolos</span>. Processos em curso preservam sua integridade jurídica original.
            </p>
          </div>
        </div>

        {/* Editor de Base Legal de Alta Densidade */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-primary-mucuna p-12 rounded-[56px] shadow-2xl shadow-primary-mucuna/20 min-h-[600px] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-mucuna/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-accent-mucuna/20 transition-colors duration-1000" />
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-accent-mucuna animate-pulse" />
                <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic">
                  Corpus Jurídico (Base Legal Global)
                </h2>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 3 ? 'bg-accent-mucuna' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>

            <textarea 
              value={config.baseLegalTexto}
              onChange={e => setConfig({...config, baseLegalTexto: e.target.value})}
              placeholder="Inicie o embasamento jurídico institucional..."
              className="flex-grow w-full bg-white/5 rounded-[40px] p-10 text-white/80 font-bold leading-loose outline-none focus:bg-white/10 transition-all resize-none scrollbar-hide italic relative z-10 text-lg border border-white/5 focus:border-accent-mucuna/30 placeholder:text-white/10 shadow-inner"
            />
            
            <div className="mt-8 flex justify-between items-center relative z-10">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] italic">Mucunã Intelligence OS</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-white/10 rounded-full" />
                <div className="w-12 h-1 bg-accent-mucuna rounded-full" />
              </div>
            </div>
          </section>

          {/* Notações de Sincronismo */}
          <div className="flex gap-4 min-h-[56px]">
            {success && (
              <div className="flex-grow bg-accent-mucuna/10 text-accent-mucuna border border-accent-mucuna/20 px-10 py-6 rounded-[32px] flex items-center gap-4 animate-in zoom-in duration-500 shadow-xl shadow-accent-mucuna/5">
                <div className="w-2 h-2 bg-accent-mucuna rounded-full animate-ping" />
                <span className="font-black text-[10px] uppercase tracking-[0.3em] italic">Parâmetros Sincronizados com a Infraestrutura Global</span>
              </div>
            )}
            {error && (
              <div className="flex-grow bg-rose-50 text-rose-600 border border-rose-100 px-10 py-6 rounded-[32px] flex items-center gap-4 animate-in shake duration-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span className="font-black text-[10px] uppercase tracking-[0.3em] italic tracking-tight">{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
