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
    <div className="min-h-screen bg-[#FDFDFC] flex flex-col selection:bg-accent-mucuna/30">
      {/* HERO SECTION - CANDIDATE FOCUS */}
      <section className="bg-primary-mucuna text-white relative overflow-hidden pt-36 pb-48">
        <div className="absolute inset-0 bg-[#0A1A12] opacity-30 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-br from-accent-mucuna/30 to-transparent rounded-full blur-[140px] -mr-96 -mt-96 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-support-mucuna/10 to-transparent rounded-full blur-[110px] -ml-72 -mb-72"></div>
        
        <div className="container mx-auto px-6 lg:px-24 relative z-10 text-center lg:text-left">
          <div className="max-w-4xl space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <span className="w-2 h-2 bg-support-mucuna rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]"></span>
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/50">Fluxo de Convocação Ativo</span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none uppercase italic animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Fui convocado,<br /> 
              <span className="text-accent-mucuna not-italic">e agora?</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/50 max-w-2xl font-bold leading-relaxed italic animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
              Se o seu nome apareceu no Diário Oficial ou na nossa lista, o próximo passo é realizar o cadastro para enviar sua documentação de forma segura.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
               <Link href="/cadastro" className="group relative px-14 py-6 bg-accent-mucuna text-primary-mucuna font-black uppercase text-xs tracking-[0.3em] rounded-[24px] hover:scale-105 transition-all shadow-[0_20px_50px_rgba(176,125,78,0.3)] overflow-hidden">
                 <span className="relative z-10 italic">Criar Minha Conta</span>
                 <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
               </Link>
               <Link href="/login" className="px-14 py-6 bg-white/5 backdrop-blur-3xl text-white font-black uppercase text-xs tracking-[0.3em] rounded-[24px] border border-white/10 hover:bg-white/10 transition-all">
                 Já tenho acesso
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STEP BY STEP JOURNEY */}
      <section className="container mx-auto px-6 lg:px-24 -mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { 
               step: '01', 
               title: 'Registro', 
               desc: 'Crie sua conta institucional para vincular sua convocação ao seu perfil digital.',
               icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
             },
             { 
               step: '02', 
               title: 'Perfil', 
               desc: 'Preencha seus dados pessoais e fiscais no painel exclusivo do candidato.',
               icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>
             },
             { 
               step: '03', 
               title: 'Documentos', 
               desc: 'Envie PDFs do diploma, RG e certidões solicitadas pelo sistema.',
               icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
             }
           ].map((item, idx) => (
             <div key={idx} className="bg-white/80 backdrop-blur-3xl p-10 rounded-[48px] border border-white shadow-2xl shadow-primary-mucuna/5 hover:bg-white hover:-translate-y-2 transition-all duration-500 group">
                <div className="flex items-center justify-between mb-8">
                   <div className="text-[56px] font-black text-primary-mucuna/5 italic leading-none group-hover:text-accent-mucuna/10 transition-colors uppercase tracking-tighter">{item.step}</div>
                   <div className="w-16 h-16 bg-surface-mucuna rounded-[20px] flex items-center justify-center text-primary-mucuna group-hover:bg-accent-mucuna group-hover:text-white transition-all duration-500 shadow-inner">
                      {item.icon}
                   </div>
                </div>
                <h3 className="text-2xl font-black text-primary-mucuna uppercase italic tracking-tighter mb-4">{item.title}</h3>
                <p className="text-slate-400 font-bold leading-relaxed text-sm italic">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* ACTIVE PROCESSES SECTION */}
      <section className="container mx-auto px-6 lg:px-24 py-32 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-3">
              <div className="w-12 h-1 bg-accent-mucuna rounded-full opacity-30" />
              <h2 className="text-4xl font-black text-primary-mucuna tracking-tighter uppercase italic leading-none">Editais em <span className="text-accent-mucuna not-italic">Vigência.</span></h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Auditoria de Processos Externos</p>
           </div>
           
           <div className="flex items-center gap-4 bg-surface-mucuna/50 px-6 py-3 rounded-2xl border border-primary-mucuna/5">
              <div className="w-2 h-2 bg-support-mucuna rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-widest italic">{editais.length} certames disponíveis</span>
           </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-accent-mucuna/20 border-t-accent-mucuna rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizando editais...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {editais.map((edital) => (
              <div key={edital.id} className="group bg-white p-8 rounded-[40px] border border-slate-50 hover:border-accent-mucuna/20 hover:shadow-2xl transition-all duration-500 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-surface-mucuna rounded-2xl flex flex-col items-center justify-center border border-primary-mucuna/5 shadow-inner group-hover:scale-105 transition-transform">
                    <span className="text-[9px] font-black text-accent-mucuna uppercase">{edital.ano}</span>
                    <span className="text-lg font-black text-primary-mucuna tracking-tighter">#{edital.id.slice(0,2)}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-primary-mucuna uppercase tracking-tight italic group-hover:text-accent-mucuna transition-colors">{edital.titulo}</h4>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inscrições abertas</span>
                  </div>
                </div>
                <Link href="/login" className="p-4 bg-primary-mucuna text-white rounded-xl hover:bg-accent-mucuna transition-all shadow-lg active:scale-90">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
              </div>
            ))}

            {editais.length === 0 && (
               <div className="md:col-span-2 py-24 text-center bg-surface-mucuna/30 rounded-[56px] border-2 border-dashed border-primary-mucuna/5">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] italic leading-loose">Aguardando renovação do ciclo de editais.<br />Verifique o Diário Oficial UEFS regularmente.</p>
               </div>
            )}
          </div>
        )}
      </section>

      {/* FOOTER - CLEAN STYLE */}
      <footer className="mt-auto py-24 bg-primary-mucuna text-white/30 border-t border-white/5 relative overflow-hidden text-center lg:text-left">
        <div className="container mx-auto px-6 lg:px-24">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-16">
            <div className="space-y-6">
               <div className="flex items-center justify-center lg:justify-start gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 italic font-black text-accent-mucuna">M.</div>
                  <h4 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Mucunã <span className="text-accent-mucuna not-italic leading-none">UEFS.</span></h4>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed max-w-sm mx-auto lg:mx-0">
                  Transparência institucional e automação de processos acadêmicos integrados.
               </p>
            </div>

            <div className="text-[10px] font-black uppercase tracking-[0.5em] space-y-2 opacity-50">
               <p>© 2026 MUCUNÃ UEFS</p>
               <div className="h-px w-12 bg-accent-mucuna/30 mx-auto" />
               <p>Todos os direitos reservados</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
