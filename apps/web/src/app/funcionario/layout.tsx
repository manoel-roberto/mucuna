'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function FuncionarioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (pathname === '/funcionario/login') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col">
        <div className="h-24 flex items-center px-8 bg-slate-950/50 backdrop-blur-xl border-b border-white/5">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white tracking-tighter leading-none">
              Mucunã
            </span>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-1">
              SISTEMA DE CONVOCAÇÃO
            </span>
          </div>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <Link href="/funcionario/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/funcionario/dashboard' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-900/20 shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
            <svg className="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span className="font-bold text-sm">Dashboard</span>
          </Link>
          <Link href="/funcionario/editais" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/funcionario/editais' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-900/20 shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
            <svg className="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
            <span className="font-bold text-sm">Gerenciar Editais</span>
          </Link>
          <Link href="/funcionario/formularios" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors text-slate-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            Modelos de Questionários
          </Link>
          

          
          <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Administração</div>
          


          <Link href="/funcionario/carreiras" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <span className="font-semibold text-sm">Carreiras</span>
          </Link>

          <Link href="/funcionario/niveis" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            <span className="font-semibold text-sm">Níveis</span>
          </Link>

          <Link href="/funcionario/cargos" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <span className="font-semibold text-sm">Cargos e Funções</span>
          </Link>

          <Link href="/funcionario/areas-atuacao" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            Áreas de Atuação
          </Link>
          
          <Link href="/funcionario/candidatos" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            Base de Candidatos
          </Link>
          
          <Link href="/funcionario/usuarios" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Gestão de Equipe
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">A</div>
            <div className="text-sm">
              <p className="font-semibold text-white">Administrador</p>
              <p 
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-white cursor-pointer transition-colors"
              >
                Sair
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 lg:px-10 justify-between flex-shrink-0">
        </header>
        <div className="flex-1 overflow-auto p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
