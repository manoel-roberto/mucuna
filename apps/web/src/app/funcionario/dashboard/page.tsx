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
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Visão Geral</h1>
        <p className="text-slate-500 font-medium italic">Bem-vindo de volta! Aqui está um resumo das atividades do Mucunã.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl group-hover:scale-110 transition-transform`}>
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={s.icon}/></svg>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ALERTS SECTION */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pl-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
              Alertas e Avisos
            </h2>
            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors">Ver tudo</button>
          </div>
          <div className="space-y-4">
            {alerts.map((a, i) => (
              <div key={i} className="bg-white border border-slate-100 p-7 rounded-[32px] hover:border-emerald-200 hover:shadow-lg transition-all flex items-start gap-6 group cursor-default">
                 <div className={`w-2 h-12 rounded-full shrink-0 ${a.type === 'URGENTE' ? 'bg-rose-500' : a.type === 'SISTEMA' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                 <div className="flex-1">
                   <div className="flex justify-between items-start mb-1">
                     <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${a.type === 'URGENTE' ? 'text-rose-600' : a.type === 'SISTEMA' ? 'text-amber-600' : 'text-blue-600'}`}>{a.type}</span>
                     <span className="text-[9px] font-bold text-slate-400">{a.date}</span>
                   </div>
                   <p className="text-[15px] font-bold text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">{a.message}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* CALENDAR MINI */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3 pl-2">
             <span className="w-2 h-6 bg-slate-900 rounded-full"></span>
             Prazos Próximos
          </h2>
          <div className="bg-slate-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 blur-[60px] rounded-full translate-x-10 -translate-y-10"></div>
            <div className="relative space-y-10">
               <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10 shadow-inner">
                    <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Próxima Homologação</p>
                    <p className="text-lg font-black tracking-tight">15 de Abril, 2026</p>
                  </div>
               </div>

               <div className="space-y-4 pt-6 border-t border-white/5">
                 <div className="flex justify-between items-center bg-white/5 p-5 rounded-[24px] border border-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-xs font-bold text-slate-300">Edital 001/2026</span>
                    <span className="text-[9px] font-black uppercase bg-emerald-500 text-white px-2.5 py-1.5 rounded-xl shadow-lg shadow-emerald-500/20">Fase 3</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-5 rounded-[24px] border border-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-xs font-bold text-slate-300">Edital 002/2026</span>
                    <span className="text-[9px] font-black uppercase bg-blue-500 text-white px-2.5 py-1.5 rounded-xl shadow-lg shadow-blue-500/20">Fase 1</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-100 p-8 rounded-[40px] text-center space-y-3">
             <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-relaxed">Ocupação do Sistema</p>
             <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-emerald-100">
               <div className="w-[65%] h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"></div>
             </div>
             <p className="text-[9px] font-bold text-emerald-600">65% dos recursos em uso</p>
          </div>
        </div>
      </div>
    </div>
  );
}
