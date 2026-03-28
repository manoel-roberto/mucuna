'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CandidatoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-primary-mucuna flex flex-col selection:bg-accent-mucuna/30">
      <header className="h-20 bg-white/60 backdrop-blur-[40px] border-b border-primary-mucuna/5 flex items-center px-12 lg:px-24 justify-between flex-shrink-0 sticky top-0">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-primary-mucuna rounded-2xl flex items-center justify-center text-accent-mucuna font-black italic shadow-2xl shadow-primary-mucuna/10 transform -rotate-6">
            M.
          </div>
          <div className="flex flex-col">
             <div className="text-2xl font-black text-primary-mucuna tracking-tighter uppercase italic leading-none">Portal do <span className="text-accent-mucuna not-italic leading-none">Candidato.</span></div>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Institutional Node Access</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex items-center gap-3">
             <div className="w-1.5 h-1.5 bg-support-mucuna rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
             <span className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-widest">Sessão Segura</span>
          </div>
          <button 
            onClick={handleLogout}
            className="px-8 py-3 bg-white border border-primary-mucuna/10 text-primary-mucuna font-black rounded-2xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all text-[10px] uppercase tracking-[0.2em] shadow-sm active:scale-95"
          >
            Encerrar
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-12 lg:p-24 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {children}
      </main>
      
      {/* Subtle Background Decoration */}
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-accent-mucuna/5 rounded-full blur-[120px] -ml-96 -mb-96 pointer-events-none" />
    </div>
  );
}
