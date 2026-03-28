'use client';

export default function FuncionarioDashboard() {
  const stats = [
    { label: 'Editais Ativos', value: '4', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'bg-blue-500 shadow-blue-100' },
    { label: 'Convocados', value: '128', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'bg-emerald-500 shadow-emerald-100' },
    { label: 'Documentos Pendentes', value: '12', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'bg-amber-500 shadow-amber-100' },
    { label: 'Efetivados', value: '42', icon: 'M5 13l4 4L19 7', color: 'bg-indigo-500 shadow-indigo-100' },
  ];

  const alerts = [
    { type: 'URGENTE', message: 'Fim do prazo para envio de documentos do Edital 001/2026 amanhã.', date: 'Há 2 horas' },
    { type: 'SISTEMA', message: 'Manutenção programada para o bando de dados no próximo domingo às 22h.', date: 'Há 5 horas' },
    { type: 'INFO', message: 'Nova funcionalidade: Agora é possível vincular formulários específicos no controle de convocação.', date: 'Ontem' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col gap-3 relative">
        <div className="w-16 h-1 bg-accent-mucuna rounded-full opacity-30 mb-2" />
        <h1 className="text-5xl font-black text-primary-mucuna tracking-tighter uppercase italic leading-none">Visão <span className="text-accent-mucuna not-italic leading-none">Operacional.</span></h1>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] italic pl-1">Ecossistema Mucunã // Node-Live Dashboard</p>
      </div>

      {/* STATS GRID - ORGANIC STYLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Editais Ativos', value: '04', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'text-accent-mucuna bg-accent-mucuna/10 border-accent-mucuna/20' },
          { label: 'Convocados', value: '128', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-support-mucuna bg-support-mucuna/10 border-support-mucuna/20' },
          { label: 'Pendentes', value: '12', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
          { label: 'Efetivados', value: '42', icon: 'M5 13l4 4L19 7', color: 'text-primary-mucuna bg-primary-mucuna/5 border-primary-mucuna/10' },
        ].map((s, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-2xl p-10 rounded-[48px] border border-white shadow-2xl shadow-primary-mucuna/5 hover:shadow-accent-mucuna/10 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
            <div className={`w-16 h-16 ${s.color} border rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:rotate-6 transition-transform duration-500`}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={s.icon}/></svg>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{s.label}</p>
            <div className="flex items-baseline gap-2">
               <p className="text-5xl font-black text-primary-mucuna tracking-tighter italic">{s.value}</p>
               <span className="w-2 h-2 bg-support-mucuna rounded-full animate-pulse"></span>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] grayscale pointer-events-none group-hover:opacity-10 transition-opacity">
               <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d={s.icon}/></svg>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ALERTS SECTION - REFINED */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between pl-4">
            <div className="space-y-1">
               <h2 className="text-2xl font-black text-primary-mucuna tracking-tighter uppercase italic flex items-center gap-4">
                 <span className="w-1.5 h-8 bg-accent-mucuna rounded-full opacity-40"></span>
                 Log de Eventos <span className="text-accent-mucuna not-italic">Críticos.</span>
               </h2>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest pl-5">Transmissão em Tempo Real</p>
            </div>
            <button className="px-6 py-2 bg-surface-mucuna text-[9px] font-black text-primary-mucuna uppercase tracking-widest rounded-full border border-primary-mucuna/5 hover:bg-primary-mucuna hover:text-white transition-all">Filtrar Log</button>
          </div>
          <div className="space-y-4">
            {[
              { type: 'URGENTE', message: 'Fim do prazo para envio de documentos do Edital 001/2026 amanhã.', date: 'Há 2 horas', status: 'critical' },
              { type: 'SISTEMA', message: 'Manutenção programada para o bando de dados no próximo domingo às 22h.', date: 'Há 5 horas', status: 'info' },
              { type: 'AVISO', message: 'Nova funcionalidade: Agora é possível vincular formulários específicos no controle de convocação.', date: 'Ontem', status: 'success' },
            ].map((a, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-xl border border-white p-8 rounded-[40px] hover:bg-white hover:shadow-3xl transition-all flex items-center gap-8 group cursor-pointer relative overflow-hidden">
                 <div className={`w-3 h-3 rounded-full shrink-0 group-hover:scale-150 transition-transform ${a.status === 'critical' ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]' : a.status === 'info' ? 'bg-accent-mucuna shadow-[0_0_12px_rgba(176,125,78,0.6)]' : 'bg-support-mucuna shadow-[0_0_12px_rgba(34,197,94,0.6)]'}`}></div>
                 <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${a.status === 'critical' ? 'text-rose-500' : a.status === 'info' ? 'text-accent-mucuna' : 'text-support-mucuna'}`}>{a.type}</span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">{a.date}</span>
                    </div>
                    <p className="text-lg font-bold text-primary-mucuna leading-tight tracking-tight group-hover:italic transition-all">{a.message}</p>
                 </div>
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR DASHBOARD - INSTITUTIONAL MODE */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-10">
          <div className="bg-primary-mucuna rounded-[56px] p-12 text-white shadow-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent-mucuna rounded-full blur-[80px] opacity-10 -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="relative space-y-10">
               <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none italic">Próximos <span className="text-accent-mucuna not-italic">Marcos.</span></h3>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Cronograma Institucional</p>
               </div>

               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-inner group-hover:rotate-12 transition-transform">
                    <svg className="w-8 h-8 text-accent-mucuna" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-accent-mucuna uppercase tracking-[0.3em] mb-1">Homologação Crítica</p>
                    <p className="text-2xl font-black tracking-tighter italic">15 ABR <span className="text-white/30 not-italic uppercase text-xs tracking-widest pl-2">2026</span></p>
                  </div>
               </div>

               <div className="space-y-4 pt-10 border-t border-white/5">
                 {[
                   { id: '001/2026', phase: 'Fase 3', status: 'bg-support-mucuna' },
                   { id: '002/2026', phase: 'Fase 1', status: 'bg-accent-mucuna' }
                 ].map(item => (
                   <div key={item.id} className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group/item">
                      <span className="text-[10px] font-black uppercase tracking-widest italic group-hover/item:text-accent-mucuna transition-colors">Edital {item.id}</span>
                      <span className={`text-[8px] font-black uppercase ${item.status} text-primary-mucuna px-3 py-2 rounded-xl shadow-2xl`}>{item.phase}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[48px] border border-slate-100 p-10 space-y-6 shadow-2xl shadow-primary-mucuna/5">
             <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-primary-mucuna uppercase tracking-[0.3em] italic">Node Load</p>
                <span className="text-[10px] font-black text-support-mucuna uppercase">Status: Optimal</span>
             </div>
             <div className="w-full h-4 bg-surface-mucuna rounded-full overflow-hidden border border-slate-50 relative p-1 shadow-inner">
               <div className="w-[65%] h-full bg-gradient-to-r from-accent-mucuna to-support-mucuna rounded-full shadow-lg" />
             </div>
             <div className="flex justify-between items-end">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Recursos em Atividade</p>
                <p className="text-xl font-black text-primary-mucuna italic tracking-tighter">65%</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
