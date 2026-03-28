'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  perfil: 'ADMINISTRADOR' | 'OPERADOR' | 'CANDIDATO';
  criadoEm: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    perfil: 'OPERADOR',
  });

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      // Busca todos para filtrar no frontend quem é equipe
      const res = await fetch(`${API_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Filtra apenas ADMINISTRADOR e OPERADOR para esta tela
        const equipe = data.filter((u: Usuario) => u.perfil === 'ADMINISTRADOR' || u.perfil === 'OPERADOR');
        setUsuarios(equipe);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Erro ao buscar usuários: ${res.status} ${errorData.message || ''}`);
      }
    } catch (err) {
      console.error('Erro ao buscar usuários', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ nome: '', email: '', cpf: '', perfil: 'OPERADOR' });
        fetchUsuarios();
        alert('Usuário cadastrado com sucesso!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Erro ao cadastrar usuário: ${res.status} ${errorData.message || ''}`);
      }
    } catch (err) {
      alert('Falha na comunicação com o servidor.');
    }
  };

  const deleteUsuario = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchUsuarios();
      }
    } catch (err) {
      alert('Erro ao excluir usuário.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Equipe</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Novo Funcionário
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs uppercase font-bold text-slate-500">
              <th className="p-4">Nome</th>
              <th className="p-4">Email / CPF</th>
              <th className="p-4">Perfil</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">Carregando usuários...</td></tr>
            ) : usuarios.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900">{u.nome}</td>
                <td className="p-4">
                  <div className="text-sm text-slate-600">{u.email}</div>
                  <div className="text-xs text-slate-400">{u.cpf}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    u.perfil === 'ADMINISTRADOR' ? 'bg-purple-100 text-purple-700' :
                    u.perfil === 'OPERADOR' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {u.perfil}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => deleteUsuario(u.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Cadastrar Novo Membro</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                <input 
                  type="text" required 
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                  <input 
                    type="email" required 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">CPF</label>
                  <input 
                    type="text" required 
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Perfil / Permissão</label>
                <select 
                  value={formData.perfil}
                  onChange={e => setFormData({...formData, perfil: e.target.value as any})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="OPERADOR">OPERADOR (Funcionário Padrão)</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR (Gestor)</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
