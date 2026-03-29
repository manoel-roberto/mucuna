'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import PermissionGuard from '@/components/PermissionGuard';
import Modal from '@/components/Modal';

export default function ModalidadesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', nome: '', descricao: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/modalidades-concorrencia`, {
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
      alert('Erro ao salvar modalidade');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta modalidade?')) return;
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
    <PermissionGuard requiredPermission="MODALIDADES_LISTAR">
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-8 rounded-[40px] border border-white/20 shadow-sm">
          <div>
            <h1 className="text-4xl font-black text-primary-mucuna tracking-tighter italic uppercase">Modalidades</h1>
            <p className="text-primary-mucuna/60 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Cotas e Grupos de Concorrência</p>
          </div>
          <button 
            onClick={() => { setFormData({ id: '', nome: '', descricao: '' }); setShowModal(true); }}
            className="group relative px-8 py-5 bg-primary-mucuna text-white font-black uppercase text-sm tracking-[.2em] rounded-2xl hover:bg-secondary-mucuna transition-all shadow-xl shadow-primary-mucuna/20 flex items-center gap-3 overflow-hidden w-fit"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
            <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
            <span className="relative z-10">Nova Modalidade</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-40 text-center bg-white/40 backdrop-blur-md rounded-[48px] border border-white/20 shadow-sm animate-pulse">
              <div className="w-16 h-16 border-4 border-accent-mucuna border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-xl shadow-accent-mucuna/20"></div>
              <p className="text-primary-mucuna/40 font-black uppercase tracking-[0.3em] text-sm">Sincronizando Modalidades...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="col-span-full bg-white/40 backdrop-blur-md p-20 rounded-[48px] text-center border-2 border-dashed border-primary-mucuna/10">
              <h3 className="text-2xl font-black text-primary-mucuna italic tracking-tighter uppercase mb-2">Nenhuma Modalidade Registrada</h3>
              <p className="text-primary-mucuna/40 font-bold uppercase text-[10px] tracking-widest">Inicie a configuração do sistema administrativo</p>
            </div>
          ) : (
            items.map((c) => (
              <div key={c.id} className="bg-white/70 backdrop-blur-xl rounded-[48px] p-10 shadow-2xl shadow-primary-mucuna/5 border border-white hover:shadow-primary-mucuna/10 transition-all group relative overflow-hidden flex flex-col justify-between hover:-translate-y-2 duration-500">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-surface-mucuna rounded-full group-hover:bg-accent-mucuna/10 transition-colors duration-700" />
                
                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 bg-primary-mucuna text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-primary-mucuna/20 group-hover:bg-accent-mucuna transition-all duration-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-primary-mucuna leading-tight italic tracking-tighter uppercase group-hover:text-accent-mucuna transition-all">{c.nome}</h3>
                    <p className="text-xs text-primary-mucuna/50 font-bold uppercase tracking-widest mt-2 line-clamp-3 leading-relaxed">{c.descricao || 'Sem especificação detalhada.'}</p>
                  </div>
                  
                  <div className="pt-6 border-t border-primary-mucuna/5 flex gap-4 items-center">
                    <button 
                      onClick={() => { setFormData({ id: c.id, nome: c.nome, descricao: c.descricao || '' }); setShowModal(true); }}
                      className="flex-1 px-6 py-3 bg-surface-mucuna text-primary-mucuna/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-mucuna hover:text-white transition-all shadow-inner italic"
                    >
                      Ajustar Definição
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="p-3 text-primary-mucuna/10 hover:text-rose-600 transition-all hover:scale-110"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

          <Modal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)}
            title={`${formData.id ? 'Ajustar' : 'Nova'} Modalidade`}
            subtitle="Configuração de Quotas e Concorrência"
            maxWidth="max-w-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em] ml-2">Título da Modalidade</label>
                <input 
                  type="text" required 
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner italic placeholder:text-primary-mucuna/20"
                  placeholder="Ex: Ampla Concorrência"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em] ml-2">Contexto e Regras</label>
                <textarea 
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-bold text-primary-mucuna shadow-inner min-h-[160px] resize-none leading-relaxed placeholder:text-primary-mucuna/20"
                  placeholder="Descreva os requisitos ou critérios desta modalidade..."
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-5 text-primary-mucuna/40 font-black uppercase text-[10px] tracking-[0.2em] hover:text-primary-mucuna transition-all italic"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="group relative px-12 py-5 bg-primary-mucuna text-white font-black uppercase text-xs tracking-[.2em] rounded-2xl hover:bg-secondary-mucuna transition-all shadow-2xl shadow-primary-mucuna/20 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
                  <span className="relative z-10">Salvar Definição</span>
                </button>
              </div>
            </form>
          </Modal>
        </div>
    </PermissionGuard>
  );
}
