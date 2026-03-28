'use client';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  requiredPermission: string;
  children: ReactNode;
}

export default function PermissionGuard({ requiredPermission, children }: PermissionGuardProps) {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="p-12 text-center text-slate-300 font-bold italic animate-pulse">Verificando permissões...</div>;
  }

  const hasPermission = user?.permissions?.includes(requiredPermission) || user?.permissions?.includes('ADMIN') || user?.roleName === 'Administrador';

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-red-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center border-2 border-red-100 shadow-xl shadow-red-50/50">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <div className="max-w-md space-y-3">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Acesso Negado</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Você não possui permissão para acessar esta funcionalidade. 
            Entre em contato com o administrador se acredita que isso é um erro.
          </p>
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest pt-2">
            Requerido: {requiredPermission}
          </p>
        </div>

        <Link 
          href="/funcionario"
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar ao Início
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
