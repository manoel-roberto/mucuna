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
        
        // Redirecionamento baseado no perfil real retornado pela API
        if (data.user.role === 'ADMINISTRADOR' || data.user.role === 'OPERADOR') {
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Bem-vindo ao <span className="text-emerald-600">Mucunã</span></h1>
                <p className="text-slate-500 font-medium">Sua plataforma definitiva para entrega de documentos e convocação.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block" htmlFor="email">E-mail</label>
            <input 
              id="email"
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block" htmlFor="password">Senha</label>
            <input 
              id="password"
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5"
          >
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 space-y-2">
          <p>
            Não tem uma conta? <Link href="/cadastro" className="text-green-600 font-bold hover:underline">Cadastre-se aqui</Link>
          </p>
          <p>
            Problemas com o acesso? <a href="#" className="text-green-600 font-semibold hover:underline">Fale com o suporte acadêmico</a>
          </p>
        </div>
      </div>
    </div>
  );
}
