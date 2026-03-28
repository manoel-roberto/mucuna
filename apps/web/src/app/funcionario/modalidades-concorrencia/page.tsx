'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import Link from 'next/link';

export default function ModalidadesConcorrenciaPage() {
  const [modalidades, setModalidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', nome: '', descricao: '' });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/modalidades-concorrencia`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setModalidades(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = formData.id ? 'PATCH' : 'POST';
    const url = formData.id ? `${API_URL}/modalidades-concorrencia/${formData.id}` : `${API_URL}/modalidades-concorrencia`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nome: formData.nome, descricao: formData.descricao })
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ id: '', nome: '', descricao: '' });
        fetchData();
      }
    } catch (err) {
      alert('Erro ao salvar modalidade de concorrência');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta modalidade de concorrência? Candidatos vinculados podem ficar sem categoria.')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/modalidades-concorrencia/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      alert('Erro ao excluir');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Modalidades de Concorrência</h1>
          <p className="text-slate-500 font-medium">Categorias para classificação de candidatos e disputas de vagas</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modalidades.map(t => (
          <div key={t.id} className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 hover:border-emerald-200 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[80px] -mr-8 -mt-8 transition-all group-hover:bg-emerald-100" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 leading-tight">{t.nome}</h3>
              <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">{t.descricao || 'Sem descrição.'}</p>
              

            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
