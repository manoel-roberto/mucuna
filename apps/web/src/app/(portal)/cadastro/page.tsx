'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export default function CadastroPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [numeroInscricao, setNumeroInscricao] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editalId, setEditalId] = useState('');
  const [editais, setEditais] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Buscar editais que possuem convocações ativas
    fetch(`${API_URL}/editais/ativos-convocacao`)
      .then(res => res.json())
      .then(data => {
        setEditais(data);
        if (data.length > 0) setEditalId(data[0].id);
      })
      .catch(err => console.error('Erro ao buscar editais', err));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editalId) {
      alert('Selecione um edital para se cadastrar.');
      return;
    }
    if (password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          cpf,
          numeroInscricao,
          password,
          editalId
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        alert(result.message || 'Erro ao realizar cadastro.');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Cadastro Realizado!</h1>
          <p className="text-slate-600">Sua conta foi criada. Você será redirecionado para o login em instantes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Crie sua conta</h1>
          <p className="text-slate-500 mt-2">Apenas para candidatos convocado(a)s em edital</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="edital">Selecione o Edital</label>
            <select
              id="edital"
              required
              value={editalId}
              onChange={(e) => setEditalId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold"
            >
              {editais.map(e => (
                <option key={e.id} value={e.id}>{e.titulo} ({e.ano})</option>
              ))}
              {editais.length === 0 && <option value="">Nenhum edital com convocações em curso</option>}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="name">Nome Completo</label>
            <input 
              id="name"
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Ex: João da Silva"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="email">E-mail</label>
            <input 
              id="email"
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="cpf">CPF</label>
              <input 
                id="cpf"
                type="text" 
                required 
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="inscricao">Nº Inscrição</label>
              <input 
                id="inscricao"
                type="text" 
                required 
                value={numeroInscricao}
                onChange={(e) => setNumeroInscricao(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="2024XXXX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="password">Senha</label>
              <input 
                id="password"
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="confirmPassword">Confirmar Senha</label>
              <input 
                id="confirmPassword"
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all"
          >
            {loading ? 'Processando...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">
          Já tem uma conta? <Link href="/login" className="text-green-600 font-bold hover:underline">Faça login</Link>
        </div>
      </div>
    </div>
  );
}
