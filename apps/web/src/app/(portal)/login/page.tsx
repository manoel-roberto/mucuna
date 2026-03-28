'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        // Simulação de salvamento de token (em prod usaríamos cookies ou um contexto)
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirecionamento baseado no perfil real retornado pela API
        const role = data.user.roleName;
        if (role === 'Administrador' || role === 'Operador') {
          router.push('/funcionario/dashboard');
        } else {
          router.push('/candidato/dashboard');
        }
      } else {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor. Verifique se a API está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-mucuna flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent-mucuna rounded-full blur-[120px] opacity-10 -ml-64 -mt-64 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-support-mucuna rounded-full blur-[100px] opacity-5 -mr-48 -mb-48"></div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-3xl rounded-[56px] shadow-3xl shadow-black/20 border border-white p-12 space-y-12 animate-in zoom-in-95 duration-700 relative z-10">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-surface-mucuna text-primary-mucuna rounded-[32px] mb-4 border border-accent-mucuna/10 shadow-inner group hover:scale-110 transition-transform duration-500">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-primary-mucuna tracking-tighter uppercase italic leading-none">Acesso <span className="text-accent-mucuna not-italic leading-none">Seguro.</span></h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Portal de Identidade Mucunã</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          {error && (
            <div className="p-5 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-2xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                 <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                 {error}
              </div>
            </div>
          )}

          <div className="space-y-2 group">
            <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna transition-colors" htmlFor="email">Identificador E-mail</label>
            <input 
              id="email"
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent text-primary-mucuna rounded-[24px] focus:bg-white focus:border-accent-mucuna transition-all outline-none font-bold shadow-inner"
              placeholder="seu@servidor.com"
            />
          </div>

          <div className="space-y-2 group">
            <div className="flex justify-between items-center pr-2">
               <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna transition-colors" htmlFor="password">Chave de Acesso</label>
               <a href="#" className="text-[9px] font-black text-accent-mucuna uppercase tracking-widest hover:underline">Esqueci</a>
            </div>
            <input 
              id="password"
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent text-primary-mucuna rounded-[24px] focus:bg-white focus:border-accent-mucuna transition-all outline-none font-bold shadow-inner"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="group relative w-full py-6 bg-primary-mucuna text-white font-black uppercase text-xs tracking-[0.3em] rounded-[24px] shadow-2xl shadow-primary-mucuna/30 transition-all hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
            <span className="relative z-10">{loading ? 'Autenticando...' : 'Entrar no Ecossistema'}</span>
          </button>
        </form>

        <div className="text-center space-y-6 pt-4">
           <div className="h-px bg-slate-100 w-24 mx-auto" />
           <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-loose">
              <p>
                Novo Candidato? <Link href="/cadastro" className="text-accent-mucuna hover:underline">Solicitar Registro Orgânico</Link>
              </p>
              <p className="opacity-40 mt-4 leading-relaxed">
                Segurança institucional UEFS // <br/> Protocolo Mucunã v2.5
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
