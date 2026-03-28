'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CandidatoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center px-6 lg:px-20 justify-between flex-shrink-0 z-50 sticky top-0 backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-slate-200">
            DF
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">Portal do Candidato</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLogout}
            className="px-6 py-2.5 bg-slate-100 text-slate-500 font-black rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all text-xs uppercase tracking-widest border border-transparent hover:border-rose-100"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-12 lg:px-20 space-y-12">
        {children}
      </main>
    </div>
  );
}
