'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

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
      const res = await fetch(`${API_URL}/usuarios?perfil=CANDIDATO`, {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Base de Candidatos</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs uppercase font-bold text-slate-500">
              <th className="p-4">Nome</th>
              <th className="p-4">Email / CPF</th>
              <th className="p-4">Data de Cadastro</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">Carregando candidatos...</td></tr>
            ) : candidatos.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum candidato encontrado.</td></tr>
            ) : candidatos.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900">{c.nome}</td>
                <td className="p-4">
                  <div className="text-sm text-slate-600">{c.email}</div>
                  <div className="text-xs text-slate-400">{c.cpf}</div>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {new Date(c.criadoEm).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => deleteCandidato(c.id)}
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
    </div>
  );
}
