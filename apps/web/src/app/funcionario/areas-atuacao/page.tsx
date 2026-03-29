'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import PermissionGuard from '@/components/PermissionGuard';
import Modal from '@/components/Modal';

interface Area {
  id: string;
  nome: string;
  cargoId: string;
  cargo: { nome: string };
}

interface Cargo {
  id: string;
  nome: string;
}

function AreasContent() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cargoId: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingBulk, setDeletingBulk] = useState(false);

  const searchParams = useSearchParams();
  const filterCargoId = searchParams.get('cargoId');
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [areasRes, cargosRes] = await Promise.all([
        fetch(`${API_URL}/areas-atuacao${filterCargoId ? `?cargoId=${filterCargoId}` : ''}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/cargos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (areasRes.ok) setAreas(await areasRes.json());
      if (cargosRes.ok) setCargos(await cargosRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCargoId]);

  const openCreateModal = () => {
    setEditMode(false);
    setCurrentId(null);
    setFormData({ nome: '', cargoId: filterCargoId || '' });
    setShowModal(true);
  };

  const openEditModal = (area: Area) => {
    setEditMode(true);
    setCurrentId(area.id);
    setFormData({
      nome: area.nome,
      cargoId: area.cargoId,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editMode ? `${API_URL}/areas-atuacao/${currentId}` : `${API_URL}/areas-atuacao`;
      const method = editMode ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        alert('Erro ao salvar área.');
      }
    } catch (err) {
      alert('Falha na comunicação.');
    }
  };

  const deleteArea = async (id: string) => {
    if (!confirm('Excluir esta área?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/areas-atuacao/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      alert('Erro ao excluir.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Deseja excluir permanentemente as ${selectedIds.length} áreas selecionadas?`)) return;

    setDeletingBulk(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/areas-atuacao/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });

      if (!res.ok) throw new Error('Falha ao excluir áreas');
      
      setSelectedIds([]);
      await fetchData();
      alert('Áreas excluídas com sucesso!');
    } catch (err) {
      alert('Erro ao excluir áreas em massa');
    } finally {
      setDeletingBulk(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === areas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(areas.map(a => a.id));
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-8 rounded-[40px] border border-white/20 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-surface-mucuna text-primary-mucuna/20 rounded-[24px] flex items-center justify-center shadow-inner group-hover:bg-accent-mucuna transition-all">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <div>
            <h1 className="text-4xl font-black text-primary-mucuna tracking-tighter italic uppercase">Áreas de Formação</h1>
            <p className="text-primary-mucuna/60 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Especializações Vinculadas a Cargos</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              disabled={deletingBulk}
              className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 border border-rose-100 shadow-xl shadow-rose-200"
            >
              {deletingBulk ? (
                <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              )}
              Excluir ({selectedIds.length})
            </button>
          )}
          {filterCargoId && (
            <button 
              onClick={() => router.push('/funcionario/areas-atuacao')}
              className="px-6 py-4 border border-primary-mucuna/10 text-primary-mucuna/40 font-black rounded-2xl hover:bg-white hover:text-primary-mucuna transition-all text-xs uppercase tracking-widest"
            >
              Limpar Filtro
            </button>
          )}
          <button 
            onClick={openCreateModal}
            className="group relative px-8 py-5 bg-primary-mucuna text-white font-black uppercase text-sm tracking-[.2em] rounded-2xl hover:bg-secondary-mucuna transition-all shadow-xl shadow-primary-mucuna/20 flex items-center gap-3 w-fit overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
            <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
            <span className="relative z-10">Nova Área</span>
          </button>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-[48px] shadow-2xl shadow-primary-mucuna/5 border border-white overflow-hidden animate-in slide-in-from-bottom-6 duration-1000">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-primary-mucuna/5">
              <th className="px-10 py-8 w-10">
                <div className="flex items-center">
                  <input 
                    type="checkbox"
                    checked={areas.length > 0 && selectedIds.length === areas.length}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded-lg text-accent-mucuna focus:ring-accent-mucuna border-primary-mucuna/10 cursor-pointer shadow-inner appearance-none border-2 checked:bg-accent-mucuna checked:border-accent-mucuna transition-all relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                  />
                </div>
              </th>
              <th className="px-10 py-8 text-xs font-black text-primary-mucuna/60 uppercase tracking-[0.3em]">Nome da Especialização</th>
              <th className="px-10 py-8 text-xs font-black text-primary-mucuna/60 uppercase tracking-[0.3em]">Cargo Vinculado</th>
              <th className="px-10 py-8 text-xs font-black text-primary-mucuna/60 uppercase tracking-[0.3em] text-right">Controle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-mucuna/5">
            {loading ? (
              <tr><td colSpan={4} className="px-10 py-32 text-center text-primary-mucuna/20 font-black italic uppercase tracking-widest animate-pulse">Sincronizando Base de Dados...</td></tr>
            ) : areas.length === 0 ? (
              <tr><td colSpan={4} className="px-10 py-32 text-center text-primary-mucuna/20 font-black italic uppercase tracking-widest">Nenhum Registro Identificado</td></tr>
            ) : (
              areas.map((area) => (
                <tr key={area.id} className={`${selectedIds.includes(area.id) ? 'bg-accent-mucuna/5' : 'hover:bg-surface-mucuna/30'} transition-all group`}>
                  <td className="px-10 py-8">
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(area.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds([...selectedIds, area.id]);
                        else setSelectedIds(selectedIds.filter(id => id !== area.id));
                      }}
                      className="w-5 h-5 rounded-lg text-accent-mucuna focus:ring-accent-mucuna border-primary-mucuna/10 cursor-pointer shadow-inner appearance-none border-2 checked:bg-accent-mucuna checked:border-accent-mucuna transition-all relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                    />
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-primary-mucuna font-black text-xl italic tracking-tighter uppercase group-hover:text-accent-mucuna transition-colors">{area.nome}</span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-2 bg-surface-mucuna text-primary-mucuna/60 rounded-xl text-xs font-black uppercase tracking-widest border border-primary-mucuna/5 shadow-inner italic">
                      {area.cargo?.nome}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex gap-3 justify-end opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <button onClick={() => openEditModal(area)} className="p-3 bg-white text-primary-mucuna/40 rounded-xl shadow-lg border border-primary-mucuna/5 hover:bg-primary-mucuna hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button onClick={() => deleteArea(area.id)} className="p-3 bg-white text-rose-300 rounded-xl shadow-lg border border-primary-mucuna/5 hover:bg-rose-600 hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={`${editMode ? 'Editar' : 'Nova'} Área`}
        subtitle="Sincronização com Cargo"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-black text-primary-mucuna/60 uppercase tracking-widest pl-1">Cargo Vinculado</label>
            <div className="relative">
              <select
                required
                value={formData.cargoId}
                onChange={e => setFormData({...formData, cargoId: e.target.value})}
                className="w-full px-6 py-4 bg-surface-mucuna/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna appearance-none cursor-pointer"
              >
                <option value="">Selecione um cargo...</option>
                {cargos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-accent-mucuna">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-primary-mucuna/60 uppercase tracking-widest pl-1">Nome da Área / Formação</label>
            <input 
              type="text" required 
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
              className="w-full px-6 py-4 bg-surface-mucuna/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-accent-mucuna transition-all font-bold text-primary-mucuna"
              placeholder="Ex: Engenharia Civil"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-primary-mucuna/40 font-bold uppercase text-sm tracking-widest hover:text-primary-mucuna transition-all">Cancelar</button>
            <button type="submit" className="group relative px-10 py-4 bg-primary-mucuna text-white font-black rounded-2xl hover:bg-secondary-mucuna transition-all shadow-xl shadow-primary-mucuna/20">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative z-10">{editMode ? 'Salvar Mudanças' : 'Cadastrar Área'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function AreasAtuacaoPage() {
  return (
    <PermissionGuard requiredPermission="AREAS_LISTAR">
      <Suspense fallback={<div className="p-20 text-center font-black animate-pulse text-slate-300">Inicializando módulo de áreas...</div>}>
        <AreasContent />
      </Suspense>
    </PermissionGuard>
  );
}
