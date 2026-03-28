export function Footer() {
  return (
    <footer className="bg-primary-mucuna text-white/20 py-16 px-12 lg:px-24 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent-mucuna/10 to-transparent" />
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 font-black italic text-xs">M.</div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Universidade Estadual de Feira de Santana</span>
        </div>
        <div className="flex items-center gap-6">
           <div className="w-1.5 h-1.5 rounded-full bg-support-mucuna animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 italic">Segurança Biossocial &copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
