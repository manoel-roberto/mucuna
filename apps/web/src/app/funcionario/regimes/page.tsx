'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import PermissionGuard from '@/components/PermissionGuard';

export default function RegimesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', nome: '' });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/regimes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setItems(await res.json());
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
    const url = formData.id ? `${API_URL}/regimes/${formData.id}` : `${API_URL}/regimes`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nome: formData.nome })
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ id: '', nome: '' });
        fetchData();
      }
    } catch (err) {
      alert('Erro ao salvar regime');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este regime?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/regimes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      alert('Erro ao excluir');
    }
  };

  return (
    <PermissionGuard requiredPermission="REGIMES_LISTAR">
      <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Regimes de Trabalho</h1>
          <p className="text-slate-500 font-medium">Cadastre cargas horárias e regimes (Ex: 20h, 40h, Dedicação Exclusiva)</p>
        </div>
        <button 
          onClick={() => { setFormData({ id: '', nome: '' }); setShowModal(true); }}
          className="px-6 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
          Novo Regime
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(c => (
          <div key={c.id} className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 hover:border-emerald-200 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[80px] -mr-8 -mt-8 transition-all group-hover:bg-emerald-100" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 leading-tight">{c.nome}</h3>
              
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => { setFormData({ id: c.id, nome: c.nome }); setShowModal(true); }}
                  className="flex-1 px-4 py-2 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-all text-sm"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full p-10 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 italic">{formData.id ? 'Editar' : 'Novo'} Regime</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Regime</label>
                <input 
                  type="text" 
                  required 
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Dedicação Exclusiva (DE)"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-4 text-slate-400 font-bold uppercase text-sm tracking-widest hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                >
                  Salvar Regime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </PermissionGuard>
  );
}
