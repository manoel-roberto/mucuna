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
  const { user, hasPermission } = useUser();

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

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-primary-mucuna flex flex-col md:flex-row selection:bg-accent-mucuna/30">
      {/* SIDEBAR - ORGANIC SECURITY STYLE */}
      <aside className="w-full md:w-80 bg-primary-mucuna text-white flex-shrink-0 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent-mucuna/10 rounded-full blur-[80px] -ml-32 -mt-32"></div>
        
        <div className="h-20 flex items-center px-10 relative z-10">
          <Link href="/funcionario/dashboard" className="flex flex-col group">
            <span className="text-3xl font-black text-white tracking-tighter leading-none uppercase italic group-hover:text-accent-mucuna transition-colors">
              Mucunã <span className="text-accent-mucuna not-italic leading-none">.</span>
            </span>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mt-2 group-hover:text-white/50 transition-colors">
              Institutional Node
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-8 px-6 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
          <div className="pb-4 px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Operações Base</div>
          
          <Link href="/funcionario/dashboard" className={`flex items-center gap-4 px-5 py-3 rounded-[16px] transition-all group ${pathname === '/funcionario/dashboard' ? 'bg-white/10 text-white border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
             <div className={`p-2 rounded-lg ${pathname === '/funcionario/dashboard' ? 'bg-accent-mucuna text-primary-mucuna' : 'bg-white/5'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
             </div>
             <span className="font-black uppercase text-[9px] tracking-widest">Dashboard</span>
          </Link>

          {hasPermission('EDITAIS_LISTAR') && (
            <Link href="/funcionario/editais" className={`flex items-center gap-4 px-5 py-3 rounded-[16px] transition-all group ${pathname === '/funcionario/editais' ? 'bg-white/10 text-white border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
               <div className={`p-2 rounded-lg ${pathname === '/funcionario/editais' ? 'bg-accent-mucuna text-primary-mucuna' : 'bg-white/5'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
               </div>
               <span className="font-black uppercase text-[9px] tracking-widest">Editais</span>
            </Link>
          )}

          {hasPermission('FORMULARIOS_LISTAR') && (
            <Link href="/funcionario/formularios" className={`flex items-center gap-4 px-5 py-3 rounded-[16px] transition-all group ${pathname === '/funcionario/formularios' ? 'bg-white/10 text-white border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
               <div className={`p-2 rounded-lg ${pathname === '/funcionario/formularios' ? 'bg-accent-mucuna text-primary-mucuna' : 'bg-white/5'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
               </div>
               <span className="font-black uppercase text-[9px] tracking-widest">Questionários</span>
            </Link>
          )}

          {hasPermission('CANDIDATOS_LISTAR') && (
            <Link href="/funcionario/candidatos" className={`flex items-center gap-4 px-5 py-3 rounded-[16px] transition-all group ${pathname === '/funcionario/candidatos' ? 'bg-white/10 text-white border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
               <div className={`p-2 rounded-lg ${pathname === '/funcionario/candidatos' ? 'bg-accent-mucuna text-primary-mucuna' : 'bg-white/5'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
               </div>
               <span className="font-black uppercase text-[9px] tracking-widest">Candidatos</span>
            </Link>
          )}
          
          <div className="pt-8 pb-4 px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Célula Administrativa</div>
          
          {hasPermission('CERTAMES_LISTAR') && (
            <Link href="/funcionario/certames" className={`flex items-center gap-4 px-5 py-2.5 rounded-[12px] group transition-all ${pathname === '/funcionario/certames' ? 'text-accent-mucuna' : 'text-white/30 hover:text-white'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/funcionario/certames' ? 'bg-accent-mucuna scale-125' : 'bg-white/10'}`} />
              <span className="font-black uppercase text-[8px] tracking-[0.2em]">Certames</span>
            </Link>
          )}

          {hasPermission('AREAS_LISTAR') && (
            <Link href="/funcionario/areas-atuacao" className={`flex items-center gap-4 px-5 py-2.5 rounded-[12px] group transition-all ${pathname === '/funcionario/areas-atuacao' ? 'text-accent-mucuna' : 'text-white/30 hover:text-white'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/funcionario/areas-atuacao' ? 'bg-accent-mucuna scale-125' : 'bg-white/10'}`} />
              <span className="font-black uppercase text-[8px] tracking-[0.2em]">Áreas de Atuação</span>
            </Link>
          )}

          {hasPermission('CARREIRAS_LISTAR') && (
            <Link href="/funcionario/carreiras" className={`flex items-center gap-4 px-5 py-2.5 rounded-[12px] group transition-all ${pathname === '/funcionario/carreiras' ? 'text-accent-mucuna' : 'text-white/30 hover:text-white'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/funcionario/carreiras' ? 'bg-accent-mucuna scale-125' : 'bg-white/10'}`} />
              <span className="font-black uppercase text-[8px] tracking-[0.2em]">Carreiras</span>
            </Link>
          )}

          {hasPermission('NIVEIS_LISTAR') && (
            <Link href="/funcionario/niveis" className={`flex items-center gap-4 px-5 py-2.5 rounded-[12px] group transition-all ${pathname === '/funcionario/niveis' ? 'text-accent-mucuna' : 'text-white/30 hover:text-white'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/funcionario/niveis' ? 'bg-accent-mucuna scale-125' : 'bg-white/10'}`} />
              <span className="font-black uppercase text-[8px] tracking-[0.2em]">Níveis</span>
            </Link>
          )}

          {hasPermission('CARGOS_LISTAR') && (
            <Link href="/funcionario/cargos" className={`flex items-center gap-4 px-5 py-2.5 rounded-[12px] group transition-all ${pathname === '/funcionario/cargos' ? 'text-accent-mucuna' : 'text-white/30 hover:text-white'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/funcionario/cargos' ? 'bg-accent-mucuna scale-125' : 'bg-white/10'}`} />
              <span className="font-black uppercase text-[8px] tracking-[0.2em]">Cargos</span>
            </Link>
          )}

          {hasPermission('MODALIDADES_LISTAR') && (
            <Link href="/funcionario/modalidades" className={`flex items-center gap-4 px-5 py-2.5 rounded-[12px] group transition-all ${pathname === '/funcionario/modalidades' ? 'text-accent-mucuna' : 'text-white/30 hover:text-white'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/funcionario/modalidades' ? 'bg-accent-mucuna scale-125' : 'bg-white/10'}`} />
              <span className="font-black uppercase text-[8px] tracking-[0.2em]">Modalidades</span>
            </Link>
          )}

          {hasPermission('REGIMES_LISTAR') && (
            <Link href="/funcionario/regimes" className={`flex items-center gap-4 px-5 py-2.5 rounded-[12px] group transition-all ${pathname === '/funcionario/regimes' ? 'text-accent-mucuna' : 'text-white/30 hover:text-white'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/funcionario/regimes' ? 'bg-accent-mucuna scale-125' : 'bg-white/10'}`} />
              <span className="font-black uppercase text-[8px] tracking-[0.2em]">Regimes</span>
            </Link>
          )}

          {hasPermission('TIPOS_EDITAL_LISTAR') && (
            <Link href="/funcionario/tipos-edital" className={`flex items-center gap-4 px-5 py-2.5 rounded-[12px] group transition-all ${pathname === '/funcionario/tipos-edital' ? 'text-accent-mucuna' : 'text-white/30 hover:text-white'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/funcionario/tipos-edital' ? 'bg-accent-mucuna scale-125' : 'bg-white/10'}`} />
              <span className="font-black uppercase text-[8px] tracking-[0.2em]">Tipos de Edital</span>
            </Link>
          )}

          <div className="pt-8 pb-4 px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Controle de Sistema</div>

          {hasPermission('USUARIOS_LISTAR') && (
            <Link href="/funcionario/usuarios" className={`flex items-center gap-4 px-5 py-2.5 rounded-[12px] group transition-all ${pathname === '/funcionario/usuarios' ? 'text-accent-mucuna' : 'text-white/30 hover:text-white'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/funcionario/usuarios' ? 'bg-accent-mucuna scale-125' : 'bg-white/10'}`} />
              <span className="font-black uppercase text-[8px] tracking-[0.2em]">Equipe</span>
            </Link>
          )}

          {hasPermission('PERFIS_LISTAR') && (
            <Link href="/funcionario/perfis" className={`flex items-center gap-4 px-5 py-2.5 rounded-[12px] group transition-all ${pathname === '/funcionario/perfis' ? 'text-accent-mucuna' : 'text-white/30 hover:text-white'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/funcionario/perfis' ? 'bg-accent-mucuna scale-125' : 'bg-white/10'}`} />
              <span className="font-black uppercase text-[8px] tracking-[0.2em]">Perfis (RBAC)</span>
            </Link>
          )}
        </nav>

        <div className="p-8 relative z-10">
          <div className="bg-white/5 backdrop-blur-3xl rounded-[32px] p-6 border border-white/10 group transition-all hover:bg-white/10">
            <Link href="/funcionario/perfil" className="flex items-center gap-4 mb-6 hover:opacity-80 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-mucuna to-support-mucuna flex items-center justify-center text-primary-mucuna font-black text-xl shadow-lg group-hover:rotate-12 transition-transform duration-500">
                {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-black text-[10px] text-white uppercase tracking-wider truncate mb-1">{user?.nome || 'Operador'}</p>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-support-mucuna rounded-full animate-pulse" />
                   <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">{user?.roleName || 'Staff'}</p>
                </div>
              </div>
            </Link>
            <button 
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="w-full py-3 bg-white/5 hover:bg-rose-500 hover:text-white text-white/40 rounded-xl font-black uppercase text-[8px] tracking-[0.3em] transition-all border border-white/5 active:scale-95"
            >
              Encerrar Sessão
            </button>
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
                 <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-60">Ambiente Institucional Seguro // Node ID: 00234</p>
              </div>
           </div>
           
           <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-4 bg-surface-mucuna/50 px-5 py-2.5 rounded-2xl border border-primary-mucuna/5">
                 <div className="w-1.5 h-1.5 bg-support-mucuna rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                 <span className="text-[9px] font-black text-primary-mucuna/40 uppercase tracking-widest">Servidores Operacionais</span>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-12 custom-scrollbar relative bg-gradient-to-br from-white to-[#FDFDFC]">
          {children}
        </div>
        
        {/* Subtle Watermark */}
        <div className="absolute bottom-8 right-8 pointer-events-none opacity-[0.03]">
           <span className="text-8xl font-black italic uppercase text-primary-mucuna select-none tracking-tighter">Mucunã.</span>
        </div>
      </main>
    </div>
  );
}
