'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    senha: '',
    confirmarSenha: '',
  });

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/usuarios/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({
            ...prev,
            nome: data.nome,
            email: data.email,
            cpf: data.cpf,
          }));
        } else {
          setError('Erro ao carregar dados do perfil.');
        }
      } catch (err) {
        setError('Erro de conexão com o servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload: any = {
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
      };

      if (formData.senha) {
        payload.senha = formData.senha;
      }

      const res = await fetch(`${API_URL}/usuarios/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setSuccess('Perfil atualizado com sucesso!');
        // Atualizar o localStorage com o novo nome
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, nome: updatedUser.nome }));
        
        // Limpar campos de senha
        setFormData(prev => ({ ...prev, senha: '', confirmarSenha: '' }));
        
        // Opcional: recarregar a página para atualizar o layout se necessário (ou o layout pegará as mudanças se usar um contexto)
        // Como o layout usa useEffect para carregar do localStorage no mount, talvez precise de um refresh ou evento
        window.location.reload(); 
      } else {
        const data = await res.json();
        setError(data.message || 'Erro ao atualizar perfil.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 font-bold italic animate-pulse">Carregando seu perfil...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Meu Perfil</h1>
        <p className="text-slate-500 font-medium">Gerencie suas informações pessoais e credenciais de acesso.</p>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 lg:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold rounded-2xl animate-in fade-in slide-in-from-top-1">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Nome Completo</label>
              <input 
                type="text" required
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">E-mail</label>
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">CPF</label>
                <input 
                  type="text" required
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <hr className="border-slate-100 my-4" />

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Alterar Senha</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Preencha apenas se desejar alterar sua senha atual</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Nova Senha</label>
                  <input 
                    type="password"
                    autoComplete="new-password"
                    value={formData.senha}
                    onChange={e => setFormData({...formData, senha: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Confirmar Nova Senha</label>
                  <input 
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmarSenha}
                    onChange={e => setFormData({...formData, confirmarSenha: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              disabled={saving}
              className="w-full py-5 bg-slate-900 text-white font-black uppercase text-sm tracking-[0.2em] rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Gravando Alterações...' : 'Atualizar Meu Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
