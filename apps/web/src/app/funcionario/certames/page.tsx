'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import PermissionGuard from '@/components/PermissionGuard';
import Modal from '@/components/Modal';

export default function CertamesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', nome: '' });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/certames`, {
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
    const url = formData.id ? `${API_URL}/certames/${formData.id}` : `${API_URL}/certames`;

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
      alert('Erro ao salvar certame');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este certame?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/certames/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      alert('Erro ao excluir');
    }
  };

  return (
    <PermissionGuard requiredPermission="CERTAMES_LISTAR">
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-8 rounded-[40px] border border-white/20 shadow-sm">
          <div>
            <h1 className="text-4xl font-black text-primary-mucuna tracking-tighter italic">Gestão de Certames</h1>
            <p className="text-primary-mucuna/60 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Configuração de Tipos de Processo</p>
          </div>
          <button 
            onClick={() => { setFormData({ id: '', nome: '' }); setShowModal(true); }}
            className="group relative px-8 py-5 bg-primary-mucuna text-white font-black uppercase text-sm tracking-[.2em] rounded-2xl hover:bg-secondary-mucuna transition-all shadow-xl shadow-primary-mucuna/20 flex items-center gap-3 w-fit overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
            <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
            <span className="relative z-10">Novo Certame</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map(c => (
            <div key={c.id} className="bg-white/70 backdrop-blur-xl rounded-[48px] p-10 shadow-2xl shadow-primary-mucuna/5 border border-white hover:shadow-primary-mucuna/10 transition-all group relative overflow-hidden flex flex-col justify-between hover:-translate-y-2">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-surface-mucuna rounded-full group-hover:bg-accent-mucuna/10 transition-colors duration-500" />
              
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-surface-mucuna rounded-[24px] flex items-center justify-center text-primary-mucuna/20 group-hover:bg-accent-mucuna group-hover:text-primary-mucuna transition-all duration-500 shadow-inner">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                </div>
                
                <h3 className="text-2xl font-black text-primary-mucuna leading-none group-hover:text-accent-mucuna transition-colors italic tracking-tighter uppercase">{c.nome}</h3>
                
                <div className="pt-4 flex items-center justify-between border-t border-primary-mucuna/5 pt-8 mt-6">
                  <button 
                    onClick={() => { setFormData({ id: c.id, nome: c.nome }); setShowModal(true); }}
                    className="flex items-center gap-2 text-xs font-black text-primary-mucuna/40 uppercase tracking-widest hover:text-accent-mucuna transition-all group/btn"
                  >
                    <div className="p-2 bg-surface-mucuna rounded-lg group-hover/btn:bg-accent-mucuna group-hover/btn:text-primary-mucuna transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </div>
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="flex items-center gap-2 text-xs font-black text-rose-300 uppercase tracking-widest hover:text-rose-600 transition-all group/del"
                  >
                    <div className="p-2 bg-rose-50 rounded-lg group-hover/del:bg-rose-600 group-hover/del:text-white transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </div>
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={`${formData.id ? 'Editar' : 'Novo'} Certame`}
        subtitle="Gerenciamento de Tipos de Processo"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-black text-primary-mucuna/40 uppercase tracking-widest ml-1">Nome do Certame</label>
            <input 
              type="text" 
              required 
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Concurso Público 2024"
              className="w-full px-6 py-4 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-bold text-primary-mucuna shadow-inner"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-6 py-4 text-primary-mucuna/40 font-bold uppercase text-sm tracking-widest hover:text-primary-mucuna transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="group relative flex-1 px-8 py-4 bg-primary-mucuna text-white font-black rounded-2xl hover:bg-secondary-mucuna transition-all shadow-xl shadow-primary-mucuna/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative z-10">Salvar Certame</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
    </PermissionGuard>
  );
}
