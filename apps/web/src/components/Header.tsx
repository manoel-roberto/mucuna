import Link from 'next/link';

export function Header() {
  return (
    <header className="h-24 bg-white/60 backdrop-blur-xl border-b border-primary-mucuna/5 flex items-center px-12 lg:px-24 justify-between sticky top-0 z-50 transition-all duration-500 hover:bg-white/80">
      <div className="flex items-center gap-5 group">
        <Link href="/" className="w-12 h-12 bg-primary-mucuna rounded-xl flex items-center justify-center text-accent-mucuna font-black italic shadow-xl shadow-primary-mucuna/10 transform -rotate-3 group-hover:rotate-0 transition-transform">
          M.
        </Link>
        <div className="flex flex-col">
          <Link href="/" className="text-xl font-black text-primary-mucuna tracking-tighter uppercase italic leading-none hover:text-accent-mucuna transition-colors">Mucunã <span className="text-accent-mucuna not-italic leading-none">.</span></Link>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">UEFS Network Node</span>
        </div>
      </div>
      
      <nav className="flex items-center gap-10">
        <Link href="/login" className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-[0.2em] hover:text-accent-mucuna transition-all hidden md:block border-b-2 border-transparent hover:border-accent-mucuna/20 pb-1">Portal do Candidato</Link>
        <Link href="/funcionario/login" className="px-7 py-3 bg-primary-mucuna text-accent-mucuna font-black rounded-2xl hover:bg-black transition-all text-[9px] uppercase tracking-[0.3em] shadow-2xl shadow-primary-mucuna/10 active:scale-95 italic">Área Restrita</Link>
      </nav>
    </header>
  );
}
