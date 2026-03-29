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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Modelos de Questionários</h1>
          <p className="text-slate-500 font-bold mt-2">Crie uma biblioteca de formulários para aplicar em seus editais.</p>
        </div>
        <Link 
          href="/funcionario/construtor"
          className="px-8 py-5 bg-emerald-600 text-white font-black uppercase text-sm tracking-[.2em] rounded-[20px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center gap-3 w-fit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
          Novo Modelo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modelos.map((modelo) => (
          <div key={modelo.id} className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-10 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors uppercase tracking-tighter">{modelo.nome}</h3>
                <p className="text-sm font-bold text-slate-400 mt-2 line-clamp-2 h-8">{modelo.descricao || 'Nenhuma descrição fornecida para este modelo.'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-4 py-2 bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-xl">
                  {modelo.esquemaJSON.fields?.length || 0} Campos Configurados
                </span>
                <span className="px-4 py-2 bg-emerald-50 text-[9px] font-black text-emerald-600 uppercase tracking-widest rounded-xl">
                  Habilitado
                </span>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-10 pt-8 border-t border-slate-50">
               <Link 
                href={`/funcionario/construtor?id=${modelo.id}`}
                className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest hover:text-emerald-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                Editar
              </Link>
              <button 
                onClick={() => handleDelete(modelo.id)}
                className="flex items-center gap-2 text-sm font-black text-rose-500 uppercase tracking-widest hover:text-rose-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Excluir
              </button>
            </div>
          </div>
        ))}

        {modelos.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 bg-white/50 border-4 border-dashed border-slate-100 rounded-[60px] p-32 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <svg className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[.3em] text-xl">Sua biblioteca está vazia</p>
            <p className="text-slate-300 font-bold mt-3 text-sm">Cadastre múltiplos modelos para agilizar seus processos seletivos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
