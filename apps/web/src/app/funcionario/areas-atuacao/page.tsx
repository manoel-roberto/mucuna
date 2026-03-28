'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Áreas de Formação / Atuação</h1>
            <p className="text-slate-500 font-medium text-sm">Especializações vinculadas aos cargos operacionais</p>
          </div>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              disabled={deletingBulk}
              className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 border border-rose-100 shadow-lg shadow-rose-100/50"
            >
              {deletingBulk ? (
                <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              )}
              Excluir ({selectedIds.length})
            </button>
          )}
          {filterCargoId && (
            <button 
              onClick={() => router.push('/funcionario/areas-atuacao')}
              className="px-6 py-4 border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all text-xs uppercase"
            >
              Limpar Filtro
            </button>
          )}
          <button 
            onClick={openCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-emerald-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
            Nova Área
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6 w-10">
                <input 
                  type="checkbox"
                  checked={areas.length > 0 && selectedIds.length === areas.length}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer shadow-sm"
                />
              </th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome da Área / Especialização</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo Vinculado</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={3} className="px-10 py-20 text-center text-slate-400 font-black italic">Buscando especializações...</td></tr>
            ) : areas.length === 0 ? (
              <tr><td colSpan={3} className="px-10 py-20 text-center text-slate-400 font-black italic">Nenhuma área encontrada.</td></tr>
            ) : (
              areas.map((area) => (
                <tr key={area.id} className={`${selectedIds.includes(area.id) ? 'bg-emerald-50/50' : 'hover:bg-slate-50/50'} transition-colors group`}>
                  <td className="px-10 py-6">
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(area.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds([...selectedIds, area.id]);
                        else setSelectedIds(selectedIds.filter(id => id !== area.id));
                      }}
                      className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer shadow-sm"
                    />
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-slate-900 font-extrabold text-lg">{area.nome}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-emerald-100 italic">
                      {area.cargo?.nome}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(area)} className="p-2 bg-white text-emerald-600 rounded-xl shadow-sm border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => deleteArea(area.id)} className="p-2 bg-white text-rose-600 rounded-xl shadow-sm border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">
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

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full p-10 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{editMode ? 'Editar' : 'Nova'} Área</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Sincronização com Cargo</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-200 hover:text-slate-900 transition-all">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cargo Vinculado</label>
                <select
                  required
                  value={formData.cargoId}
                  onChange={e => setFormData({...formData, cargoId: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-black text-slate-800 appearance-none"
                >
                  <option value="">Selecione um cargo...</option>
                  {cargos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nome da Área / Formação</label>
                <input 
                  type="text" required 
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                  placeholder="Ex: Engenharia Civil"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all">Cancelar</button>
                <button type="submit" className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100">
                  {editMode ? 'Salvar Mudanças' : 'Cadastrar Área'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AreasAtuacaoPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black animate-pulse text-slate-300">Inicializando módulo de áreas...</div>}>
      <AreasContent />
    </Suspense>
  );
}
