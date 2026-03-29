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
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-8 rounded-[40px] border border-white/20 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-primary-mucuna tracking-tighter italic uppercase">Meu Perfil</h1>
          <p className="text-primary-mucuna/60 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Gestão de Identidade e Acesso</p>
        </div>
        <div className="w-16 h-16 bg-primary-mucuna text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-primary-mucuna/20 uppercase font-black italic text-xl">
          {formData.nome?.charAt(0) || 'U'}
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-[48px] p-10 lg:p-16 shadow-2xl shadow-primary-mucuna/5 border border-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-surface-mucuna rounded-full opacity-50" />
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-12">
          {error && (
            <div className="p-6 bg-rose-50/50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-widest rounded-[24px] animate-in slide-in-from-top-2 italic">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="p-6 bg-emerald-50/50 border border-emerald-100 text-emerald-600 text-xs font-black uppercase tracking-widest rounded-[24px] animate-in slide-in-from-top-2 italic">
              ✨ {success}
            </div>
          )}

          <div className="grid grid-cols-1 gap-10">
            <div className="space-y-4 group">
              <label className="text-xs font-black text-primary-mucuna/60 uppercase tracking-[0.2em] ml-2 group-focus-within:text-accent-mucuna transition-colors">Identificação Completa</label>
              <input 
                type="text" required
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner italic placeholder:text-primary-mucuna/20"
                placeholder="Nome do Colaborador"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em] ml-2 group-focus-within:text-accent-mucuna transition-colors">E-mail Institucional</label>
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner italic lowercase tracking-tight"
                  placeholder="usuario@mucuna.com.br"
                />
              </div>
              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em] ml-2 group-focus-within:text-accent-mucuna transition-colors">Cadastro Nacional (CPF)</label>
                <input 
                  type="text" required
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                  className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner tabular-nums italic"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-primary-mucuna/5">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 bg-accent-mucuna rounded-full" />
                <h3 className="text-xs font-black text-primary-mucuna uppercase tracking-[0.3em] italic">Segurança de Acesso</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4 group">
                  <label className="text-xs font-black text-primary-mucuna/60 uppercase tracking-[0.2em] ml-2 group-focus-within:text-accent-mucuna transition-colors">Nova Credencial</label>
                  <input 
                    type="password"
                    autoComplete="new-password"
                    value={formData.senha}
                    onChange={e => setFormData({...formData, senha: e.target.value})}
                    className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner italic"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em] ml-2 group-focus-within:text-accent-mucuna transition-colors">Confirmar Credencial</label>
                  <input 
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmarSenha}
                    onChange={e => setFormData({...formData, confirmarSenha: e.target.value})}
                    className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner italic"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <p className="mt-6 text-[9px] font-black text-primary-mucuna/20 uppercase tracking-[0.4em] text-center italic">Deixe em branco para manter a senha atual</p>
            </div>
          </div>

          <div className="pt-10">
            <button 
              type="submit"
              disabled={saving}
              className="group relative w-full py-6 bg-primary-mucuna text-white font-black uppercase text-sm tracking-[.3em] rounded-[24px] hover:bg-secondary-mucuna transition-all shadow-2xl shadow-primary-mucuna/20 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed italic"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative z-10">{saving ? 'Processando Sincronização...' : 'Confirmar Atualização de Perfil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
