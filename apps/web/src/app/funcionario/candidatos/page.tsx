'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import PermissionGuard from '@/components/PermissionGuard';

interface Candidato {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  perfil: string;
  criadoEm: string;
}

export default function CandidatosPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidatos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/usuarios?perfil=Candidato`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCandidatos(data);
      }
    } catch (err) {
      console.error('Erro ao buscar candidatos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatos();
  }, []);

  const deleteCandidato = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este candidato?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchCandidatos();
      }
    } catch (err) {
      alert('Erro ao excluir candidato.');
    }
  };

  return (
    <PermissionGuard requiredPermission="CANDIDATOS_LISTAR">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-primary-mucuna font-display uppercase tracking-tight">Base de Candidatos</h1>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl shadow-primary-mucuna/5 border border-accent-mucuna/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-mucuna border-b border-accent-mucuna/10">
            <tr className="text-[10px] uppercase font-black text-primary-mucuna/40 tracking-widest">
              <th className="p-6">Nome</th>
              <th className="p-6">Email / CPF</th>
              <th className="p-6">Data de Cadastro</th>
              <th className="p-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-accent-mucuna/5">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">Carregando candidatos...</td></tr>
            ) : candidatos.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum candidato encontrado.</td></tr>
            ) : candidatos.map(c => (
              <tr key={c.id} className="hover:bg-surface-mucuna/50 transition-colors group">
                <td className="p-6 font-bold text-primary-mucuna">{c.nome}</td>
                <td className="p-6">
                  <div className="text-sm font-medium text-primary-mucuna/80">{c.email}</div>
                  <div className="text-[10px] font-black text-accent-mucuna/60 uppercase tracking-wider">{c.cpf}</div>
                </td>
                <td className="p-6 text-sm font-bold text-primary-mucuna/40">
                  {new Date(c.criadoEm).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => deleteCandidato(c.id)}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </PermissionGuard>
  );
}
