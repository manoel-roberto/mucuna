'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import Link from 'next/link';
import PermissionGuard from '@/components/PermissionGuard';
import Modal from '@/components/Modal';

interface Cargo {
  id: string;
  nome: string;
  descricao: string | null;
  _count?: {
    areas: number;
  };
}

export default function CargosPage() {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingBulk, setDeletingBulk] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/cargos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCargos(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditMode(false);
    setCurrentId(null);
    setFormData({ nome: '', descricao: '' });
    setShowModal(true);
  };

  const openEditModal = (cargo: Cargo) => {
    setEditMode(true);
    setCurrentId(cargo.id);
    setFormData({
      nome: cargo.nome,
      descricao: cargo.descricao || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editMode ? `${API_URL}/cargos/${currentId}` : `${API_URL}/cargos`;
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
        alert('Erro ao salvar cargo.');
      }
    } catch (err) {
      alert('Falha na comunicação.');
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    
    const lines = importText.trim().split(/\r?\n/);
    if (lines.length < 2) return;

    const headers = lines[0].toUpperCase().split(';').map(h => h.trim());
    const dataLines = lines.slice(1);

    const getIndex = (possibleHeaders: string[]) => {
      for (const h of possibleHeaders) {
        const idx = headers.indexOf(h.toUpperCase());
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const idxCargo = getIndex(['CARGO', 'FUNÇÃO', 'FUNCAO', 'POSTO']);
    const idxArea = getIndex(['AREA', 'ÁREA', 'AREA ATUACAO', 'AREA_ATUACAO', 'ESPECIALIDADE']);
    const idxCarreira = getIndex(['CARREIRA']);
    const idxNivel = getIndex(['NIVEL', 'NÍVEL']);

    const items = dataLines.map(line => {
      const parts = line.split(';').map(s => s.trim());
      if (parts.length < 2) return null;

      const getVal = (idx: number) => (idx !== -1 && parts[idx]) ? parts[idx] : undefined;

      const cargoNome = getVal(idxCargo);
      const areaNome = getVal(idxArea);
      const carreiraNome = getVal(idxCarreira);
      const nivelNome = getVal(idxNivel);

      if (!cargoNome || !areaNome) return null;

      return { 
        cargoNome, 
        areaNome,
        carreiraNome,
        nivelNome
      };
    }).filter((i): i is any => i !== null);

    if (items.length === 0) {
      alert('Nenhum dado válido encontrado. Certifique-se de usar os cabeçalhos: Cargo;Area;Carreira;Nivel');
      setImporting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/cargos/importar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items }),
      });

      if (res.ok) {
        setShowImportModal(false);
        setImportText('');
        fetchData();
        alert('Cargos e Áreas importados com sucesso!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Erro ao importar dados: ${errorData.message || res.statusText}`);
      }
    } catch (err: any) {
      alert(`Falha na comunicação: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setImportText(event.target?.result as string);
    reader.readAsText(file);
  };

  const deleteCargo = async (id: string) => {
    if (!confirm('Excluir este cargo? Isto pode afetar áreas vinculadas.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/cargos/${id}`, {
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
    if (!confirm(`Deseja excluir permanentemente os ${selectedIds.length} cargos selecionados?`)) return;

    setDeletingBulk(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/cargos/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });

      if (!res.ok) throw new Error('Falha ao excluir cargos');
      
      setSelectedIds([]);
      await fetchData();
      alert('Cargos excluídos com sucesso!');
    } catch (err) {
      alert('Erro ao excluir cargos em massa');
    } finally {
      setDeletingBulk(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === cargos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cargos.map(c => c.id));
    }
  };

  return (
    <PermissionGuard requiredPermission="CARGOS_LISTAR">
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-8 rounded-[40px] border border-white/20 shadow-sm transition-all duration-500">
        <div>
          <h1 className="text-4xl font-black text-primary-mucuna tracking-tighter italic uppercase">Cargos e Funções</h1>
          <p className="text-primary-mucuna/60 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Gestão de Ocupações Institucionais</p>
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
          {cargos.length > 0 && (
            <button 
              onClick={toggleSelectAll}
              className="px-6 py-4 bg-white/50 border border-primary-mucuna/10 text-primary-mucuna/60 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-primary-mucuna transition-all flex items-center gap-3 shadow-sm"
            >
              <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${selectedIds.length === cargos.length ? 'bg-accent-mucuna border-accent-mucuna' : 'border-primary-mucuna/10 bg-surface-mucuna'}`}>
                {selectedIds.length === cargos.length && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg>
                )}
              </div>
              {selectedIds.length === cargos.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </button>
          )}
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-6 py-4 bg-white/50 border border-primary-mucuna/10 text-primary-mucuna/60 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-primary-mucuna transition-all flex items-center gap-3 shadow-sm"
          >
            <svg className="w-5 h-5 text-accent-mucuna" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Importar CSV
          </button>
          <button 
            onClick={openCreateModal}
            className="group relative px-8 py-5 bg-primary-mucuna text-white font-black uppercase text-sm tracking-[.2em] rounded-2xl hover:bg-secondary-mucuna transition-all shadow-xl shadow-primary-mucuna/20 flex items-center gap-3 w-fit overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
            <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
            <span className="relative z-10">Novo Cargo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-40 text-center bg-white/40 backdrop-blur-md rounded-[48px] border border-white/20 shadow-sm animate-pulse">
            <div className="w-16 h-16 border-4 border-accent-mucuna border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-xl shadow-accent-mucuna/20"></div>
            <p className="text-primary-mucuna/40 font-black uppercase tracking-[0.3em] text-sm">Sincronizando Base de Cargos...</p>
          </div>
        ) : cargos.length === 0 ? (
          <div className="col-span-full bg-white/40 backdrop-blur-md p-20 rounded-[48px] text-center border-2 border-dashed border-primary-mucuna/10 group hover:border-accent-mucuna/40 transition-all duration-700">
            <div className="w-24 h-24 bg-surface-mucuna rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
               <svg className="w-12 h-12 text-primary-mucuna/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <h3 className="text-2xl font-black text-primary-mucuna italic tracking-tighter uppercase mb-2">Nenhum Cargo Identificado</h3>
            <p className="text-primary-mucuna/40 font-bold uppercase text-[10px] tracking-widest">Inicie o cadastro ou importe via CSV</p>
          </div>
        ) : (
          cargos.map((cargo) => (
            <div key={cargo.id} className="bg-white/70 backdrop-blur-xl rounded-[48px] p-10 shadow-2xl shadow-primary-mucuna/5 border border-white hover:shadow-primary-mucuna/10 transition-all group relative overflow-hidden flex flex-col justify-between hover:-translate-y-2 duration-500">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-surface-mucuna rounded-full group-hover:bg-accent-mucuna/10 transition-colors duration-700" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-5 items-start">
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(cargo.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds([...selectedIds, cargo.id]);
                        else setSelectedIds(selectedIds.filter(id => id !== cargo.id));
                      }}
                      className="w-6 h-6 mt-4 rounded-lg text-accent-mucuna focus:ring-accent-mucuna border-primary-mucuna/10 cursor-pointer shadow-inner appearance-none border-2 checked:bg-accent-mucuna checked:border-accent-mucuna transition-all relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[6px] after:h-[11px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                    />
                    <div className="w-16 h-16 bg-surface-mucuna rounded-[24px] flex items-center justify-center text-primary-mucuna/10 group-hover:bg-accent-mucuna group-hover:text-primary-mucuna transition-all duration-500 shadow-inner">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(cargo)} className="p-3 text-primary-mucuna/20 hover:text-accent-mucuna transition-all hover:scale-110">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onClick={() => deleteCargo(cargo.id)} className="p-3 text-primary-mucuna/20 hover:text-rose-600 transition-all hover:scale-110">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-primary-mucuna leading-tight group-hover:text-accent-mucuna transition-all italic tracking-tighter uppercase mb-3">{cargo.nome}</h3>
                <p className="text-xs text-primary-mucuna/50 font-bold uppercase tracking-widest line-clamp-2 h-10 leading-relaxed mb-8">{cargo.descricao || 'Sem especificação registrada.'}</p>
              </div>

              <div className="relative z-10 pt-8 border-t border-primary-mucuna/5 flex items-center justify-between mt-4">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em] mb-1">Especialidades</span>
                   <span className="text-2xl font-black text-accent-mucuna tracking-tighter italic">{cargo._count?.areas || 0}</span>
                </div>
                <Link 
                  href={`/funcionario/areas-atuacao?cargoId=${cargo.id}`}
                  className="px-6 py-3 bg-surface-mucuna text-primary-mucuna/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-mucuna hover:text-white transition-all shadow-sm flex items-center gap-2 italic group/btn shadow-inner"
                >
                  Explorar Áreas
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5-5 5"/></svg>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        title="Importação Estruturada"
        subtitle="Sincronização Lote: Cargos, Áreas e Níveis"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-mucuna/50 p-8 rounded-[32px] border border-primary-mucuna/5 flex flex-col justify-between shadow-inner">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em]">Instruções de Formato</p>
                <p className="text-xs text-primary-mucuna/60 font-bold leading-relaxed">
                  Utilize o separador <span className="text-accent-mucuna font-black">ponto e vírgula (;)</span>. O sistema identifica automaticamente as colunas:
                </p>
                <code className="bg-white/50 p-3 rounded-xl block text-[10px] text-primary-mucuna font-black italic shadow-sm border border-white">
                  CARGO; AREA; CARREIRA; NIVEL
                </code>
              </div>
              <a 
                href="/modelo_cargos_areas.csv" 
                download 
                className="mt-8 text-accent-mucuna hover:text-primary-mucuna text-[10px] font-black uppercase tracking-widest flex items-center gap-2 underline decoration-2 underline-offset-8 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                Baixar Template Estruturado
              </a>
            </div>
            
            <div className="bg-white/50 p-8 rounded-[32px] border-2 border-dashed border-primary-mucuna/10 flex flex-col items-center justify-center text-center group hover:border-accent-mucuna/40 transition-all duration-500 cursor-pointer relative overflow-hidden">
              <input type="file" id="import-file" className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />
              <label htmlFor="import-file" className="cursor-pointer relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl text-primary-mucuna/10 group-hover:text-accent-mucuna transition-all duration-500">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                </div>
                <span className="block text-[10px] font-black text-primary-mucuna/40 uppercase tracking-[0.2em] group-hover:text-primary-mucuna transition-colors">Carregar Arquivo</span>
              </label>
              <div className="absolute inset-0 bg-accent-mucuna/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em] ml-2">Preview / Edição Manual</label>
            <textarea 
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="w-full h-64 p-8 bg-surface-mucuna/50 border border-transparent rounded-[32px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-mono text-xs font-bold text-primary-mucuna shadow-inner resize-none"
              placeholder="CARGO;AREA;CARREIRA;NIVEL&#10;Professor Adjunto;Matemática;Magistério;Superior"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <button 
              onClick={() => setShowImportModal(false)}
              className="px-8 py-5 text-primary-mucuna/40 font-black uppercase text-[10px] tracking-[0.2em] hover:text-primary-mucuna transition-all italic"
            >
              Descartar
            </button>
            <button 
              disabled={!importText.trim() || importing}
              onClick={handleImport}
              className="group relative px-12 py-5 bg-primary-mucuna text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-secondary-mucuna disabled:opacity-20 transition-all shadow-2xl shadow-primary-mucuna/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative z-10 flex items-center gap-3">
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    Confirmar Importação
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={`${editMode ? 'Editar' : 'Novo'} Cargo`}
        subtitle="Especificação de Ocupação Principal"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em] ml-2">Nomenclatura do Cargo</label>
            <input 
              type="text" required 
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
              className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner italic"
              placeholder="Ex: Professor de Ensino Superior"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em] ml-2">Descrição Funcional</label>
            <textarea 
              rows={4}
              value={formData.descricao}
              onChange={e => setFormData({...formData, descricao: e.target.value})}
              className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-bold text-primary-mucuna shadow-inner resize-none leading-relaxed"
              placeholder="Descreva as atribuições principais deste cargo..."
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
            <button type="button" onClick={() => setShowModal(false)} className="px-8 py-5 text-primary-mucuna/40 font-black uppercase text-[10px] tracking-[0.2em] hover:text-primary-mucuna transition-all italic">Cancelar</button>
            <button type="submit" className="group relative px-12 py-5 bg-primary-mucuna text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-secondary-mucuna transition-all shadow-2xl shadow-primary-mucuna/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative z-10">{editMode ? 'Salvar Mudanças' : 'Cadastrar Cargo'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
    </PermissionGuard>
  );
}
