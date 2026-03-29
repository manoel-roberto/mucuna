'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export default function FormulariosPage() {
  const [modelos, setModelos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModelos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/formularios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setModelos(data);
      }
    } catch (err) {
      console.error('Erro ao buscar modelos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este modelo de formulário? Esta ação é irreversível.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/formularios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchModelos();
      } else {
        alert('Erro ao excluir: verifique se existem editais ou envios vinculados.');
      }
    } catch (err) {
      alert('Erro ao excluir modelo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-8 rounded-[40px] border border-white/20 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-primary-mucuna tracking-tighter italic">Modelos de Questionários</h1>
          <p className="text-primary-mucuna/60 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Biblioteca de Formulários e Ativos</p>
        </div>
        <Link 
          href="/funcionario/construtor"
          className="group relative px-8 py-5 bg-primary-mucuna text-white font-black uppercase text-sm tracking-[.2em] rounded-2xl hover:bg-secondary-mucuna transition-all shadow-xl shadow-primary-mucuna/20 flex items-center gap-3 w-fit overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
          <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
          <span className="relative z-10">Novo Modelo</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modelos.map((modelo) => (
          <div key={modelo.id} className="bg-white/70 backdrop-blur-xl rounded-[48px] p-10 shadow-2xl shadow-primary-mucuna/5 border border-white hover:shadow-primary-mucuna/10 transition-all group relative overflow-hidden flex flex-col justify-between hover:-translate-y-2">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-surface-mucuna rounded-full group-hover:bg-accent-mucuna/10 transition-colors duration-500" />
            
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-surface-mucuna rounded-[24px] flex items-center justify-center text-primary-mucuna/20 group-hover:bg-accent-mucuna group-hover:text-primary-mucuna transition-all duration-500 shadow-inner">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-primary-mucuna leading-none group-hover:text-accent-mucuna transition-colors italic tracking-tighter uppercase">{modelo.nome}</h3>
                <p className="text-sm font-bold text-primary-mucuna/40 mt-3 line-clamp-2 h-10 italic">"{modelo.descricao || 'Nenhuma descrição fornecida para este modelo.'}"</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-4 py-2 bg-surface-mucuna text-[10px] font-black text-primary-mucuna/40 uppercase tracking-widest rounded-xl border border-primary-mucuna/5">
                  {modelo.esquemaJSON.fields?.length || 0} Campos
                </span>
                <span className="px-4 py-2 bg-accent-mucuna/10 text-[10px] font-black text-accent-mucuna uppercase tracking-widest rounded-xl border border-accent-mucuna/10">
                  Estrutura Ativa
                </span>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-10 pt-8 border-t border-primary-mucuna/5">
               <Link 
                href={`/funcionario/construtor?id=${modelo.id}`}
                className="flex items-center gap-2 text-xs font-black text-primary-mucuna/40 uppercase tracking-widest hover:text-accent-mucuna transition-all group/btn"
              >
                <div className="p-2 bg-surface-mucuna rounded-lg group-hover/btn:bg-accent-mucuna group-hover/btn:text-primary-mucuna transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </div>
                Editar
              </Link>
              <button 
                onClick={() => handleDelete(modelo.id)}
                className="flex items-center gap-2 text-xs font-black text-rose-300 uppercase tracking-widest hover:text-rose-600 transition-all group/del"
              >
                <div className="p-2 bg-rose-50 rounded-lg group-hover/del:bg-rose-600 group-hover/del:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </div>
                Excluir
              </button>
            </div>
          </div>
        ))}

        {modelos.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 bg-white/30 border-4 border-dashed border-white/50 rounded-[80px] p-32 text-center backdrop-blur-sm">
            <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-white">
              <svg className="w-12 h-12 text-primary-mucuna/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-primary-mucuna/20 font-black uppercase tracking-[.4em] text-2xl italic">Livraria Vazia</p>
            <p className="text-primary-mucuna/30 font-bold mt-4 text-sm uppercase tracking-widest">Nenhum modelo de questionário detectado no sistema.</p>
          </div>
        )}
      </div>
    </div>
  );
}
