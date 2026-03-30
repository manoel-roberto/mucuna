'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, UserProvider } from '@/contexts/UserContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function FuncionarioLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <FuncionarioLayoutContent>{children}</FuncionarioLayoutContent>
    </UserProvider>
  );
}

function FuncionarioLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasPermission, isMounted } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const effectiveCollapsed = isCollapsed && !isHovered;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (pathname === '/funcionario/login') {
    return (
      <div className="min-h-screen bg-primary-mucuna">
        {children}
      </div>
    );
  }

  // Evita erro de hidratação e discrepância de permissões na primeira carga
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#FDFDFC] flex items-center justify-center">
         <div className="w-10 h-10 border-4 border-accent-mucuna border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-primary-mucuna flex flex-col md:flex-row selection:bg-accent-mucuna/30">
      {/* SIDEBAR - ORGANIC SECURITY STYLE */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col flex-shrink-0 bg-primary-mucuna text-white relative overflow-hidden transition-all duration-500 ease-in-out z-[100] ${effectiveCollapsed ? 'w-18' : 'w-64'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent-mucuna/10 rounded-full blur-[80px] -ml-32 -mt-32"></div>
        
        {/* TOGGLE BUTTON */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-0 top-1/2 -translate-y-1/2 w-8 h-12 bg-accent-mucuna text-primary-mucuna rounded-l-full flex items-center justify-center shadow-2xl z-[110] hover:scale-110 active:scale-90 transition-all opacity-20 hover:opacity-100"
        >
          <svg className={`w-4 h-4 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={`h-20 flex items-center relative z-10 transition-all duration-500 ${effectiveCollapsed ? 'px-4 justify-center' : 'px-8'}`}>
          <Link href="/funcionario/dashboard" className="flex flex-col group overflow-hidden">
            <span className={`text-2xl font-black text-white tracking-tighter leading-none uppercase italic group-hover:text-accent-mucuna transition-all duration-500 ${effectiveCollapsed ? 'scale-[0.6] origin-center' : ''}`}>
              M{effectiveCollapsed ? '' : 'ucunã'}<span className="text-accent-mucuna not-italic leading-none">.</span>
            </span>
            {!effectiveCollapsed && (
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2 group-hover:text-white/50 transition-all duration-500 animate-in fade-in slide-in-from-left-2">
                Institutional Node
              </span>
            )}
          </Link>
        </div>

        <nav className={`flex-1 overflow-y-auto custom-scrollbar relative z-10 transition-all duration-500 py-8 ${effectiveCollapsed ? 'px-2' : 'px-4'} space-y-1`}>
          {!effectiveCollapsed && (
            <div className="pb-4 px-4 text-xs font-black text-white/45 uppercase tracking-[0.2em] animate-in fade-in slide-in-from-left-2">Operações Base</div>
          )}
          
          <Link href="/funcionario/dashboard" className={`flex items-center gap-4 py-3 rounded-[16px] transition-all group ${effectiveCollapsed ? 'px-2 justify-center' : 'px-5'} ${pathname === '/funcionario/dashboard' ? 'bg-white/10 text-white border border-white/10' : 'text-white/65 hover:text-white hover:bg-white/5'}`}>
             <div className={`p-2 rounded-lg transition-all duration-500 ${pathname === '/funcionario/dashboard' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]' : 'bg-white/5'}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
             </div>
             {!effectiveCollapsed && <span className="font-black uppercase text-xs tracking-widest animate-in fade-in slide-in-from-left-2">Dashboard</span>}
          </Link>

          {hasPermission('EDITAIS_LISTAR') && (
            <Link href="/funcionario/editais" className={`flex items-center gap-3 py-3 rounded-[16px] transition-all group ${effectiveCollapsed ? 'px-2 justify-center' : 'px-4'} ${pathname === '/funcionario/editais' ? 'bg-white/10 text-white border border-white/10' : 'text-white/65 hover:text-white hover:bg-white/5'}`}>
               <div className={`p-2 rounded-lg transition-all duration-500 ${pathname === '/funcionario/editais' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]' : 'bg-white/5'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
               </div>
               {!effectiveCollapsed && <span className="font-black uppercase text-xs tracking-widest animate-in fade-in slide-in-from-left-2">Editais</span>}
            </Link>
          )}

          {hasPermission('FORMULARIOS_LISTAR') && (
            <Link href="/funcionario/formularios" className={`flex items-center gap-4 py-3 rounded-[16px] transition-all group ${effectiveCollapsed ? 'px-2 justify-center' : 'px-5'} ${pathname === '/funcionario/formularios' ? 'bg-white/10 text-white border border-white/10' : 'text-white/65 hover:text-white hover:bg-white/5'}`}>
               <div className={`p-2 rounded-lg transition-all duration-500 ${pathname === '/funcionario/formularios' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]' : 'bg-white/5'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
               </div>
               {!effectiveCollapsed && <span className="font-black uppercase text-xs tracking-widest animate-in fade-in slide-in-from-left-2">Questionários</span>}
            </Link>
          )}

          {hasPermission('CANDIDATOS_LISTAR') && (
            <Link href="/funcionario/candidatos" className={`flex items-center gap-4 py-3 rounded-[16px] transition-all group ${effectiveCollapsed ? 'px-2 justify-center' : 'px-5'} ${pathname === '/funcionario/candidatos' ? 'bg-white/10 text-white border border-white/10' : 'text-white/65 hover:text-white hover:bg-white/5'}`}>
               <div className={`p-2 rounded-lg transition-all duration-500 ${pathname === '/funcionario/candidatos' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]' : 'bg-white/5'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
               </div>
               {!effectiveCollapsed && <span className="font-black uppercase text-xs tracking-widest animate-in fade-in slide-in-from-left-2">Candidatos</span>}
            </Link>
          )}
          
          {!effectiveCollapsed && (
            <div className="pt-8 pb-4 px-4 text-xs font-black text-white/45 uppercase tracking-[0.2em] animate-in fade-in slide-in-from-left-2">Célula Administrativa</div>
          )}
          
          {hasPermission('CERTAMES_LISTAR') && (
            <Link href="/funcionario/certames" className={`flex items-center gap-3 py-2.5 rounded-[12px] group transition-all ${effectiveCollapsed ? 'px-2 justify-center' : 'px-4'} ${pathname === '/funcionario/certames' ? 'text-accent-mucuna' : 'text-white/60 hover:text-white'}`}>
              <div className={`transition-all duration-500 p-1.5 rounded-lg ${pathname === '/funcionario/certames' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-white/5'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.638.319a4 4 0 01-1.833.46h-3.3a4 4 0 01-1.833-.46l-.638-.319a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547V18a2 2 0 002 2h12a2 2 0 002-2v-2.572zM12 11V3m0 0l-3 3m3-3l3 3" /></svg>
              </div>
              {!effectiveCollapsed && <span className="font-black uppercase text-[12px] tracking-[0.1em] animate-in fade-in slide-in-from-left-2">Certames</span>}
            </Link>
          )}

          {hasPermission('AREAS_LISTAR') && (
            <Link href="/funcionario/areas-atuacao" className={`flex items-center gap-4 py-2.5 rounded-[12px] group transition-all ${effectiveCollapsed ? 'px-2 justify-center' : 'px-5'} ${pathname === '/funcionario/areas-atuacao' ? 'text-accent-mucuna' : 'text-white/60 hover:text-white'}`}>
              <div className={`transition-all duration-500 p-1.5 rounded-lg ${pathname === '/funcionario/areas-atuacao' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-white/5'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              {!effectiveCollapsed && <span className="font-black uppercase text-[12px] tracking-[0.1em] animate-in fade-in slide-in-from-left-2">Áreas de Atuação</span>}
            </Link>
          )}

          {hasPermission('CARREIRAS_LISTAR') && (
            <Link href="/funcionario/carreiras" className={`flex items-center gap-4 py-2.5 rounded-[12px] group transition-all ${effectiveCollapsed ? 'px-2 justify-center' : 'px-5'} ${pathname === '/funcionario/carreiras' ? 'text-accent-mucuna' : 'text-white/60 hover:text-white'}`}>
              <div className={`transition-all duration-500 p-1.5 rounded-lg ${pathname === '/funcionario/carreiras' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-white/5'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              {!effectiveCollapsed && <span className="font-black uppercase text-[12px] tracking-[0.1em] animate-in fade-in slide-in-from-left-2">Carreiras</span>}
            </Link>
          )}

          {hasPermission('NIVEIS_LISTAR') && (
            <Link href="/funcionario/niveis" className={`flex items-center gap-4 py-2.5 rounded-[12px] group transition-all ${effectiveCollapsed ? 'px-2 justify-center' : 'px-5'} ${pathname === '/funcionario/niveis' ? 'text-accent-mucuna' : 'text-white/60 hover:text-white'}`}>
              <div className={`transition-all duration-500 p-1.5 rounded-lg ${pathname === '/funcionario/niveis' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-white/5'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              {!effectiveCollapsed && <span className="font-black uppercase text-[12px] tracking-[0.1em] animate-in fade-in slide-in-from-left-2">Níveis</span>}
            </Link>
          )}

          {hasPermission('CARGOS_LISTAR') && (
            <Link href="/funcionario/cargos" className={`flex items-center gap-4 py-2.5 rounded-[12px] group transition-all ${effectiveCollapsed ? 'px-2 justify-center' : 'px-5'} ${pathname === '/funcionario/cargos' ? 'text-accent-mucuna' : 'text-white/60 hover:text-white'}`}>
              <div className={`transition-all duration-500 p-1.5 rounded-lg ${pathname === '/funcionario/cargos' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-white/5'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              {!effectiveCollapsed && <span className="font-black uppercase text-[12px] tracking-[0.1em] animate-in fade-in slide-in-from-left-2">Cargos</span>}
            </Link>
          )}

          {hasPermission('MODALIDADES_LISTAR') && (
            <Link href="/funcionario/modalidades" className={`flex items-center gap-4 py-2.5 rounded-[12px] group transition-all ${effectiveCollapsed ? 'px-2 justify-center' : 'px-5'} ${pathname === '/funcionario/modalidades' ? 'text-accent-mucuna' : 'text-white/60 hover:text-white'}`}>
              <div className={`transition-all duration-500 p-1.5 rounded-lg ${pathname === '/funcionario/modalidades' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-white/5'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 5a1 1 0 01.3-.7l7-7a1 1 0 011.4 0l7 7a1 1 0 01.3.7v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2v20m-5-5h10" /></svg>
              </div>
              {!effectiveCollapsed && <span className="font-black uppercase text-[12px] tracking-[0.1em] animate-in fade-in slide-in-from-left-2">Modalidades</span>}
            </Link>
          )}

          {hasPermission('REGIMES_LISTAR') && (
            <Link href="/funcionario/regimes" className={`flex items-center gap-4 py-2.5 rounded-[12px] group transition-all ${effectiveCollapsed ? 'px-2 justify-center' : 'px-5'} ${pathname === '/funcionario/regimes' ? 'text-accent-mucuna' : 'text-white/60 hover:text-white'}`}>
              <div className={`transition-all duration-500 p-1.5 rounded-lg ${pathname === '/funcionario/regimes' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-white/5'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              {!effectiveCollapsed && <span className="font-black uppercase text-[12px] tracking-[0.1em] animate-in fade-in slide-in-from-left-2">Regimes</span>}
            </Link>
          )}

          {hasPermission('TIPOS_EDITAL_LISTAR') && (
            <Link href="/funcionario/tipos-edital" className={`flex items-center gap-4 py-2.5 rounded-[12px] group transition-all ${effectiveCollapsed ? 'px-2 justify-center' : 'px-5'} ${pathname === '/funcionario/tipos-edital' ? 'text-accent-mucuna' : 'text-white/60 hover:text-white'}`}>
              <div className={`transition-all duration-500 p-1.5 rounded-lg ${pathname === '/funcionario/tipos-edital' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-white/5'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 11h.01M7 15h.01M13 7h.01M13 11h.01M13 15h.01M17 7h.01M17 11h.01M17 15h.01M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              {!effectiveCollapsed && <span className="font-black uppercase text-[12px] tracking-[0.1em] animate-in fade-in slide-in-from-left-2">Tipos de Edital</span>}
            </Link>
          )}

          {!effectiveCollapsed && (
            <div className="pt-8 pb-4 px-4 text-xs font-black text-white/45 uppercase tracking-[0.3em] animate-in fade-in slide-in-from-left-2">Controle de Sistema</div>
          )}

          {hasPermission('USUARIOS_LISTAR') && (
            <Link href="/funcionario/usuarios" className={`flex items-center gap-4 py-2.5 rounded-[12px] group transition-all ${effectiveCollapsed ? 'px-2 justify-center' : 'px-5'} ${pathname === '/funcionario/usuarios' ? 'text-accent-mucuna' : 'text-white/60 hover:text-white'}`}>
              <div className={`transition-all duration-500 p-1.5 rounded-lg ${pathname === '/funcionario/usuarios' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-white/5'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              {!effectiveCollapsed && <span className="font-black uppercase text-[12px] tracking-[0.1em] animate-in fade-in slide-in-from-left-2">Equipe</span>}
            </Link>
          )}

          {hasPermission('PERFIS_LISTAR') && (
            <Link href="/funcionario/perfis" className={`flex items-center gap-4 py-2.5 rounded-[12px] group transition-all ${effectiveCollapsed ? 'px-2 justify-center' : 'px-5'} ${pathname === '/funcionario/perfis' ? 'text-accent-mucuna' : 'text-white/60 hover:text-white'}`}>
              <div className={`transition-all duration-500 p-1.5 rounded-lg ${pathname === '/funcionario/perfis' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-white/5'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              {!effectiveCollapsed && <span className="font-black uppercase text-[12px] tracking-[0.1em] animate-in fade-in slide-in-from-left-2">Perfis (RBAC)</span>}
            </Link>
          )}

          <Link href="/funcionario/configuracoes-gerais" className={`flex items-center gap-4 py-2.5 rounded-[12px] group transition-all ${effectiveCollapsed ? 'px-2 justify-center' : 'px-5'} ${pathname === '/funcionario/configuracoes-gerais' ? 'text-accent-mucuna' : 'text-white/60 hover:text-white'}`}>
            <div className={`transition-all duration-500 p-1.5 rounded-lg ${pathname === '/funcionario/configuracoes-gerais' ? 'bg-accent-mucuna text-primary-mucuna shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-white/5'}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            {!effectiveCollapsed && <span className="font-black uppercase text-[12px] tracking-[0.1em] animate-in fade-in slide-in-from-left-2">Parâmetros do Sistema</span>}
          </Link>
        </nav>

        <div className={`transition-all duration-500 ${effectiveCollapsed ? 'p-2' : 'p-4'} relative z-10`}>
          <div className={`bg-white/5 backdrop-blur-3xl rounded-[24px] border border-white/10 group transition-all hover:bg-white/10 ${effectiveCollapsed ? 'p-2' : 'p-4'}`}>
            <Link href="/funcionario/perfil" className={`flex items-center gap-3 transition-all ${effectiveCollapsed ? 'justify-center mb-0' : 'mb-6 hover:opacity-80'}`}>
              <div className={`rounded-xl bg-gradient-to-br from-accent-mucuna to-support-mucuna flex items-center justify-center text-primary-mucuna font-black shadow-lg group-hover:rotate-12 transition-all duration-500 ${effectiveCollapsed ? 'w-10 h-10 text-lg' : 'w-10 h-10 text-lg'}`}>
                {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
              </div>
              {!effectiveCollapsed && (
                <div className="min-w-0 animate-in fade-in slide-in-from-left-2">
                  <p className="font-black text-[12px] text-white uppercase tracking-wider truncate mb-1">{user?.nome || 'Operador'}</p>
                  <div className="flex items-center gap-2">
                     <div className="w-1 h-1 bg-support-mucuna rounded-full animate-pulse" />
                     <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">{user?.roleName || 'Staff'}</p>
                  </div>
                </div>
              )}
            </Link>
            {!effectiveCollapsed && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                className="w-full py-2.5 bg-white/5 hover:bg-rose-500 hover:text-white text-white/40 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] transition-all border border-white/5 active:scale-95 animate-in fade-in zoom-in-95"
              >
                Encerrar Sessão
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-primary-mucuna/5 flex items-center px-12 justify-between flex-shrink-0">
           <div className="flex items-center gap-6">
              <div className="h-8 w-1 bg-accent-mucuna rounded-full opacity-20" />
              <div className="space-y-1">
                 <h2 className="text-xl font-black text-primary-mucuna tracking-tighter uppercase italic leading-none">
                    {pathname?.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
                 </h2>
              </div>
           </div>
           
           <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-4 bg-surface-mucuna/50 px-5 py-2.5 rounded-2xl border border-primary-mucuna/5">
                 <div className="w-1.5 h-1.5 bg-support-mucuna rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                 <span className="text-xs font-black text-primary-mucuna/40 uppercase tracking-widest">Servidores Operacionais</span>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-12 custom-scrollbar relative bg-gradient-to-br from-white to-[#FDFDFC]">
          {children}
        </div>
      </main>
    </div>
  );
}
