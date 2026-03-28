'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

interface Edital {
  id: string;
  titulo: string;
  ano: number;
  status: string;
}

export default function Home() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/editais/ativos-convocacao`)
      .then(res => res.json())
      .then(data => {
        setEditais(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HERO SECTION */}
      <section className="bg-emerald-700 text-white relative overflow-hidden pt-20 pb-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.3),transparent)] pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/30 backdrop-blur-md rounded-full border border-emerald-500/30 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">Portal Oficial de Convocação</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-75">
            Mucunã <span className="text-emerald-300">UEFS</span>
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100/80 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            Acompanhe editais, envie documentos e gerencie sua jornada acadêmica de forma simplificada e transparente.
          </p>
        </div>
      </section>

      {/* DASHBOARD INTEGRADO */}
      <div className="container mx-auto px-6 -mt-24 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LISTA DE EDITAIS EM DESTAQUE */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[40px] shadow-2xl shadow-emerald-900/5 p-10 border border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Editais e Seleções</h2>
                  <p className="text-sm text-slate-400 font-bold mt-1">Sincronizado com a base oficial da UEFS</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"/></svg>
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Buscando editais ativos...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {editais.map(edital => (
                    <div key={edital.id} className="group p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-emerald-100 hover:bg-white hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Edital {edital.ano}</span>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{edital.titulo}</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full uppercase tracking-widest">
                          {edital.status}
                        </span>
                        <Link href={`/login`} className="p-3 bg-white text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {editais.length === 0 && (
                    <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                      <p className="text-slate-400 font-black uppercase tracking-widest">Nenhum edital ativo no momento</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AVISOS GERAIS */}
            <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 rounded-full -mr-32 -mt-32 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative z-10 space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest">Orientações Gerais</h3>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex-shrink-0 flex items-center justify-center font-black">!</div>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">Mantenha seus documentos digitalizados em PDF para agilizar o processo de envio quando convocado.</p>
                  </div>
                  <div className="flex gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex-shrink-0 flex items-center justify-center font-black">?</div>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">Dúvidas sobre o processo? Acesse nossa Central de Ajuda ou entre em contato com a Secretaria Acadêmica.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR DE ACESSO */}
          <div className="space-y-6">
            {/* SOU CANDIDATO */}
            <div className="bg-white rounded-[40px] shadow-xl p-10 border border-slate-100 group">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-8 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 leading-none mb-4 uppercase tracking-tighter">Sou Candidato</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">Fui convocado e preciso realizar a entrega de documentos.</p>
              <Link href="/login" className="flex items-center justify-center w-full py-5 bg-emerald-600 text-white font-black uppercase text-xs tracking-widest rounded-3xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100">
                Entrar no Portal
              </Link>
            </div>

            {/* ÁREA ADMINISTRATIVA */}
            <div className="bg-white rounded-[40px] shadow-xl p-10 border border-slate-100 group">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-8 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 leading-none mb-4 uppercase tracking-tighter">Área Restrita</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">Gerenciamento interno para funcionários e comissão acadêmica.</p>
              <Link href="/funcionario/login" className="flex items-center justify-center w-full py-5 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-3xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                Acessar Sistema
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-auto py-12 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">© 2026 Mucunã UEFS - Universidade Estadual de Feira de Santana</p>
        </div>
      </footer>
    </div>
  );
}
