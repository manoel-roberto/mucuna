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
    <div className="min-h-screen bg-white flex flex-col selection:bg-accent-mucuna/30">
      {/* HERO SECTION - ORGANIC SECURITY STYLE */}
      <section className="bg-primary-mucuna text-white relative overflow-hidden pt-28 pb-48">
        <div className="absolute inset-0 bg-[#0A1A12] opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-accent-mucuna/20 to-transparent rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-support-mucuna/10 to-transparent rounded-full blur-[100px] -ml-72 -mb-72"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 uppercase italic leading-none">
              Mucunã <span className="text-accent-mucuna not-italic leading-none">UEFS.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-surface-mucuna/40 max-w-2xl mx-auto leading-relaxed font-bold italic animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
              A transparência técnica encontra a segurança institucional em um ecossistema digital integrado.
            </p>

            <div className="flex flex-wrap justify-center gap-6 pt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
               <Link href="/cadastro" className="group relative px-12 py-5 bg-accent-mucuna text-primary-mucuna font-black uppercase text-xs tracking-[0.3em] rounded-[24px] hover:scale-105 transition-all shadow-2xl shadow-accent-mucuna/20">
                 <span className="relative z-10">Solicitar Registro</span>
               </Link>
               <Link href="/login" className="px-12 py-5 bg-white/5 backdrop-blur-xl text-white font-black uppercase text-xs tracking-[0.3em] rounded-[24px] border border-white/10 hover:bg-white/10 transition-all">
                 Acessar Portal
               </Link>
            </div>
          </div>
        </div>
        
        {/* WAVE DECORATION */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent opacity-20"></div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div className="container mx-auto px-6 -mt-32 relative z-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: ACTIVE PROCESSES */}
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white/80 backdrop-blur-3xl rounded-[56px] shadow-2xl shadow-primary-mucuna/5 p-12 border border-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                 <svg className="w-64 h-64 text-primary-mucuna" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z"/></svg>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
                <div className="space-y-2">
                  <div className="w-12 h-1 bg-accent-mucuna rounded-full opacity-50 mb-4" />
                  <h2 className="text-4xl font-black text-primary-mucuna tracking-tighter uppercase italic leading-none">Processos <span className="text-accent-mucuna not-italic leading-none">Ativos.</span></h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Monitoramento em Tempo Real do Ecossistema</p>
                </div>
                <div className="flex items-center gap-4 bg-surface-mucuna/50 px-6 py-3 rounded-2xl border border-primary-mucuna/5">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-primary-mucuna border-2 border-white flex items-center justify-center text-[8px] font-black text-white">U</div>)}
                   </div>
                   <span className="text-[9px] font-black text-primary-mucuna/40 uppercase tracking-widest">320 Cand. Online</span>
                </div>
              </div>

              {loading ? (
                <div className="py-24 text-center space-y-6">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-accent-mucuna/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-accent-mucuna border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Sincronizando com Servidores UEFS...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {editais.map((edital, idx) => (
                    <div key={edital.id} 
                      className="group p-8 bg-surface-mucuna/40 rounded-[32px] border border-transparent hover:border-accent-mucuna/20 hover:bg-white hover:shadow-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-right-8 duration-700"
                      style={{ transitionDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-inner flex flex-col items-center justify-center border border-primary-mucuna/5 group-hover:scale-110 transition-transform">
                          <span className="text-[10px] font-black text-accent-mucuna uppercase">{edital.ano}</span>
                          <span className="text-2xl font-black text-primary-mucuna">#{idx + 1}</span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-primary-mucuna group-hover:text-accent-mucuna transition-colors uppercase tracking-tight italic">{edital.titulo}</h3>
                          <div className="flex items-center gap-3">
                             <span className="w-1.5 h-1.5 bg-support-mucuna rounded-full animate-pulse"></span>
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inscrições Abertas p/ Envio</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Link href={`/login`} className="flex items-center gap-4 px-8 py-4 bg-primary-mucuna text-white rounded-2xl hover:bg-secondary-mucuna hover:-translate-y-1 transition-all shadow-xl shadow-primary-mucuna/10 group/btn">
                          <span className="text-[10px] font-black uppercase tracking-widest">Participar</span>
                          <svg className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {editais.length === 0 && (
                    <div className="py-24 text-center bg-surface-mucuna/30 rounded-[40px] border-2 border-dashed border-primary-mucuna/5">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      </div>
                      <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] italic underline decoration-accent-mucuna decoration-2 underline-offset-8">Aguardando Publicação de Novos Atos</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* INTEGRITY INFO */}
            <div className="bg-primary-mucuna rounded-[56px] p-16 text-white shadow-3xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-mucuna rounded-full blur-[100px] opacity-10 -mr-48 -mt-48 group-hover:opacity-20 transition-opacity duration-1000"></div>
               <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8">
                     <div className="w-16 h-1.5 bg-accent-mucuna rounded-full" />
                     <h3 className="text-4xl font-black uppercase tracking-tighter leading-none italic">Escudo de <span className="text-accent-mucuna not-italic">Integridade.</span></h3>
                     <p className="text-surface-mucuna/50 font-bold leading-relaxed text-lg">
                       O sistema Mucunã utiliza protocolos de criptografia institucional para garantir que cada registro e documento enviado seja auditável e imutável.
                     </p>
                     <div className="flex gap-4">
                        <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                           <svg className="w-6 h-6 text-accent-mucuna" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                        </div>
                        <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                           <svg className="w-6 h-6 text-support-mucuna" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        </div>
                     </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] p-10 border border-white/10 space-y-6">
                     <div className="space-y-2">
                        <p className="text-xs font-black text-accent-mucuna uppercase tracking-widest">Snapshot Institucional</p>
                        <div className="h-px bg-white/10" />
                     </div>
                     <div className="space-y-4">
                        {[
                          { label: 'Candidatos Habilitados', val: '2.4k' },
                          { label: 'Documentos Auditados', val: '18.2k' },
                          { label: 'Editais Concluídos', val: '42' }
                        ].map(stat => (
                          <div key={stat.label} className="flex justify-between items-end">
                             <span className="text-[10px] font-black uppercase tracking-widest text-surface-mucuna/40">{stat.label}</span>
                             <span className="text-2xl font-black text-surface-mucuna tracking-tighter">{stat.val}</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACCESS NODES */}
          <div className="lg:col-span-4 space-y-8">
            {/* NODE: CANDIDATE Portal */}
            <div className="bg-white rounded-[56px] shadow-2xl p-12 border border-slate-50 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-mucuna/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="w-20 h-20 bg-surface-mucuna text-primary-mucuna rounded-[28px] flex items-center justify-center mb-10 border border-accent-mucuna/10 group-hover:bg-primary-mucuna group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              
              <h3 className="text-3xl font-black text-primary-mucuna leading-none mb-6 uppercase tracking-tighter italic">Candidato<span className="text-accent-mucuna not-italic leading-none">.</span></h3>
              <p className="text-sm text-slate-400 font-bold leading-relaxed mb-10 italic">Acesse sua área restrita para envio de documentos e acompanhamento de status.</p>
              
              <Link href="/login" className="flex items-center justify-between w-full p-6 bg-primary-mucuna text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-[24px] hover:bg-accent-mucuna transition-all shadow-2xl shadow-primary-mucuna/20 overflow-hidden relative">
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative z-10">Iniciar Acesso</span>
                <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </Link>
            </div>

            {/* NODE: STAFF Portal */}
            <div className="bg-surface-mucuna/50 backdrop-blur-xl rounded-[56px] shadow-xl p-12 border border-primary-mucuna/5 group hover:-translate-y-2 transition-all duration-500">
              <div className="w-20 h-20 bg-white text-secondary-mucuna rounded-[28px] flex items-center justify-center mb-10 border border-secondary-mucuna/10 group-hover:bg-secondary-mucuna group-hover:text-white group-hover:-rotate-6 transition-all duration-500 shadow-md">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              
              <h3 className="text-3xl font-black text-primary-mucuna leading-none mb-6 uppercase tracking-tighter italic">Funcional<span className="text-secondary-mucuna not-italic leading-none">.</span></h3>
              <p className="text-sm text-slate-400 font-bold leading-relaxed mb-10 italic">Nódulo de controle administrativo para auditoria e gestão de certames.</p>
              
              <Link href="/funcionario/login" className="flex items-center justify-center w-full py-6 bg-secondary-mucuna/10 text-secondary-mucuna border-2 border-secondary-mucuna/20 font-black uppercase text-[10px] tracking-[0.3em] rounded-[24px] hover:bg-secondary-mucuna hover:text-white transition-all">
                Autenticação Staff
              </Link>
            </div>

            {/* ECOSYSTEM STATUS */}
            <div className="p-10 bg-white rounded-[40px] border border-slate-100 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-support-mucuna rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <span className="text-[10px] font-black text-primary-mucuna uppercase tracking-widest">Operacionalidade: 100%</span>
               </div>
               <div className="h-1.5 w-full bg-surface-mucuna rounded-full overflow-hidden">
                  <div className="h-full w-[100%] bg-support-mucuna" />
               </div>
               <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest italic">Node Status UEFS: Connected</p>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER - MINIMALIST ORGANIC */}
      <footer className="mt-auto py-20 bg-primary-mucuna text-white/40 border-t border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <span className="text-xl font-black text-accent-mucuna">M</span>
               </div>
               <div>
                  <h4 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">Mucunã <span className="text-accent-mucuna not-italic leading-none">UEFS.</span></h4>
                  <p className="text-[9px] font-black uppercase tracking-widest mt-1">Ecosystem v2.5.0</p>
               </div>
            </div>
            
            <div className="hidden md:flex gap-16">
               {[
                 { label: 'Estrutura', links: ['Editais', 'Resultados', 'Cronograma'] },
                 { label: 'Suporte', links: ['FAQ', 'Contato', 'Privacidade'] }
               ].map(group => (
                 <div key={group.label} className="space-y-4">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-6">{group.label}</p>
                    <ul className="space-y-3">
                       {group.links.map(l => <li key={l} className="text-[10px] font-black uppercase tracking-widest hover:text-accent-mucuna transition-colors cursor-pointer">{l}</li>)}
                    </ul>
                 </div>
               ))}
            </div>

            <div className="text-center md:text-right space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">Universidade Estadual de <br/> Feira de Santana</p>
              <div className="h-px w-24 bg-accent-mucuna/20 inline-block md:ml-auto" />
            </div>
          </div>
          
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 group hover:opacity-100 transition-opacity">
            <p className="text-[9px] font-black uppercase tracking-[0.5em]">© 2026 Mucunã UEFS. Todos os direitos orgânicos reservados.</p>
            <div className="flex gap-8">
               <span className="text-[9px] font-black uppercase tracking-widest cursor-pointer hover:text-accent-mucuna transition-colors">Twitter // X</span>
               <span className="text-[9px] font-black uppercase tracking-widest cursor-pointer hover:text-accent-mucuna transition-colors">Linked-In</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
