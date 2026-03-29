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
      <div className="min-h-screen bg-surface-mucuna flex items-center justify-center p-8 relative overflow-hidden">
        {/* Elementos Orgânicos de Fundo */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-support-mucuna/10 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-mucuna/10 rounded-full blur-[140px] translate-x-1/2 translate-y-1/2 animate-pulse-slow delay-700" />

        <div className="max-w-3xl w-full bg-white/60 backdrop-blur-3xl rounded-[64px] shadow-3xl shadow-primary-mucuna/10 p-20 text-center space-y-12 border border-white relative z-10 animate-in zoom-in duration-700">
          <div className="w-32 h-32 bg-primary-mucuna text-accent-mucuna rounded-[48px] flex items-center justify-center mx-auto shadow-2xl shadow-primary-mucuna/20 animate-bounce-subtle border border-accent-mucuna/20">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div className="space-y-6">
            <div className="text-6xl font-black text-primary-mucuna font-display uppercase tracking-tighter leading-[0.9] italic">
              Conexão <br/> <span className="text-accent-mucuna not-italic">Estabelecida.</span>
            </div>
            <p className="text-slate-500 font-bold text-lg max-w-sm mx-auto uppercase tracking-tight">Sua jornada no ecossistema <span className="text-primary-mucuna font-black underline decoration-support-mucuna decoration-4 underline-offset-4">Mucunã</span> começou.</p>
          </div>
          <div className="pt-8">
            <div className="inline-flex items-center gap-6 px-10 py-5 bg-white rounded-3xl border border-primary-mucuna/5 shadow-2xl">
              <div className="w-3 h-3 bg-support-mucuna rounded-full animate-pulse shadow-[0_0_20px_rgba(46,125,50,0.6)]" />
              <span className="text-[12px] font-black text-primary-mucuna uppercase tracking-[0.3em]">Gerando Identidade Digital...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-mucuna flex items-center justify-center p-6 lg:p-12 font-sans selection:bg-accent-mucuna/30 relative overflow-hidden">
      {/* Elementos Orgânicos de Fundo Intensificados */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] bg-primary-mucuna/10 rounded-full blur-[160px] animate-pulse-slow" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[50%] h-[50%] bg-accent-mucuna/10 rounded-full blur-[160px] animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-support-mucuna/5 rounded-full blur-[120px] animate-pulse-slow delay-500" />
      </div>

      <div className="max-w-4xl w-full bg-white/40 backdrop-blur-3xl rounded-[64px] shadow-3xl shadow-primary-mucuna/10 p-12 lg:p-20 border border-white relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="max-w-2xl mx-auto w-full space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary-mucuna/5 border border-primary-mucuna/10 rounded-2xl backdrop-blur-xl mx-auto">
              <div className="w-2 h-2 bg-accent-mucuna rounded-full animate-pulse shadow-[0_0_10px_rgba(176,125,78,0.8)]" />
              <span className="text-[10px] font-black text-primary-mucuna uppercase tracking-[0.4em]">Nova Matriz de Identidade</span>
            </div>
            <h2 className="text-6xl font-black text-primary-mucuna font-display uppercase tracking-tighter leading-none italic">
              Criar <span className="text-accent-mucuna not-italic">Registro.</span>
            </h2>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest max-w-md mx-auto leading-relaxed">
              Exclusivo para convocados em processos <span className="text-primary-mucuna font-black">ativos da instituição.</span>
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-10">
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-[0.3em] ml-6 transition-colors group-focus-within:text-accent-mucuna italic" htmlFor="edital">Edital de Convocação</label>
              <div className="relative">
                <select
                  id="edital"
                  required
                  value={editalId}
                  onChange={(e) => setEditalId(e.target.value)}
                  className="w-full px-10 py-7 bg-white/60 border border-primary-mucuna/10 text-primary-mucuna rounded-[32px] focus:ring-8 focus:ring-accent-mucuna/5 focus:border-accent-mucuna/40 outline-none font-black text-xs transition-all appearance-none cursor-pointer shadow-2xl shadow-primary-mucuna/5 uppercase tracking-[0.1em] italic"
                >
                  {Array.isArray(editais) && editais.map(e => (
                    <option key={e.id} value={e.id}>{e.titulo} ({e.ano})</option>
                  ))}
                  {(!Array.isArray(editais) || editais.length === 0) && <option value="">Nenhum processo em curso</option>}
                </select>
                <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-accent-mucuna">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 group md:col-span-2">
                <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-[0.3em] ml-6 transition-colors group-focus-within:text-accent-mucuna italic" htmlFor="name">Nome Completo</label>
                <input 
                  id="name" type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-10 py-7 bg-white/80 border border-primary-mucuna/10 text-primary-mucuna rounded-[32px] focus:ring-8 focus:ring-accent-mucuna/5 focus:border-accent-mucuna/40 outline-none font-bold placeholder:text-slate-200 transition-all shadow-inner italic"
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-[0.3em] ml-6 transition-colors group-focus-within:text-accent-mucuna italic" htmlFor="email">E-mail</label>
                <input 
                  id="email" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-10 py-7 bg-white/80 border border-primary-mucuna/10 text-primary-mucuna rounded-[32px] focus:ring-8 focus:ring-accent-mucuna/5 focus:border-accent-mucuna/40 outline-none font-bold placeholder:text-slate-200 transition-all shadow-inner italic lowercase"
                  placeholder="exemplo@email.com"
                />
              </div>

              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-[0.3em] ml-6 transition-colors group-focus-within:text-accent-mucuna italic" htmlFor="cpf">CPF</label>
                <input 
                  id="cpf" type="text" required value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full px-10 py-7 bg-white/80 border border-primary-mucuna/10 text-primary-mucuna rounded-[32px] focus:ring-8 focus:ring-accent-mucuna/5 focus:border-accent-mucuna/40 outline-none font-bold placeholder:text-slate-200 transition-all shadow-inner tabular-nums italic"
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-4 group md:col-span-2">
                <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-[0.3em] ml-6 transition-colors group-focus-within:text-accent-mucuna italic" htmlFor="inscricao">Número de Inscrição</label>
                <input 
                  id="inscricao" type="text" required value={numeroInscricao}
                  onChange={(e) => setNumeroInscricao(e.target.value)}
                  className="w-full px-10 py-7 bg-white/80 border border-primary-mucuna/10 text-primary-mucuna rounded-[32px] focus:ring-8 focus:ring-accent-mucuna/5 focus:border-accent-mucuna/40 outline-none font-bold placeholder:text-slate-200 transition-all shadow-inner tabular-nums italic"
                  placeholder="2024XXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-primary-mucuna/5 pt-12">
              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-[0.3em] ml-6 transition-colors group-focus-within:text-accent-mucuna italic" htmlFor="password">Senha</label>
                <input 
                  id="password" type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-10 py-7 bg-white/80 border border-primary-mucuna/10 text-primary-mucuna rounded-[32px] focus:ring-8 focus:ring-accent-mucuna/5 focus:border-accent-mucuna/40 outline-none font-bold placeholder:text-slate-200 transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-[0.3em] ml-6 transition-colors group-focus-within:text-accent-mucuna italic" htmlFor="confirmPassword">Confirmar</label>
                <input 
                  id="confirmPassword" type="password" required value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-10 py-7 bg-white/80 border border-primary-mucuna/10 text-primary-mucuna rounded-[32px] focus:ring-8 focus:ring-accent-mucuna/5 focus:border-accent-mucuna/40 outline-none font-bold placeholder:text-slate-200 transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-10">
              <button 
                type="submit" disabled={loading}
                className="group relative w-full py-8 bg-primary-mucuna overflow-hidden text-accent-mucuna font-black uppercase text-xs tracking-[.5em] rounded-[32px] shadow-3xl shadow-primary-mucuna/30 transition-all hover:bg-black active:scale-95 disabled:opacity-50 italic"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="relative z-10">{loading ? 'Sincronizando Matriz...' : 'Finalizar Entrega de Dados'}</span>
              </button>
            </div>
          </form>

          <div className="text-center">
            <Link href="/login" className="inline-flex items-center gap-4 group">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-primary-mucuna transition-colors">Já possui credenciais?</span>
              <div className="px-6 py-2 bg-white border border-primary-mucuna/5 rounded-full text-[10px] font-black uppercase tracking-[.2em] text-accent-mucuna shadow-xl shadow-primary-mucuna/5 group-hover:bg-accent-mucuna group-hover:text-white transition-all italic">Autenticar Agora</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

