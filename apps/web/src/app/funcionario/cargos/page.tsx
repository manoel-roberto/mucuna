'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import Link from 'next/link';

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cargos e Funções</h1>
          <p className="text-slate-500 font-medium">Gerencie as ocupações principais da instituição</p>
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
          {cargos.length > 0 && (
            <button 
              onClick={toggleSelectAll}
              className="px-6 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <input 
                type="checkbox" 
                checked={selectedIds.length > 0 && selectedIds.length === cargos.length} 
                onChange={() => {}} // Controlled by button click
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 pointer-events-none"
              />
              {selectedIds.length === cargos.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </button>
          )}
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-6 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Importar CSV
          </button>
          <button 
            onClick={openCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-emerald-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
            Novo Cargo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando base de cargos...</p>
          </div>
        ) : cargos.length === 0 ? (
          <div className="col-span-full bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-400 italic">Nenhum cargo cadastrado</h3>
            <p className="text-slate-300 font-bold text-sm mt-2">Clique em "Novo Cargo" para começar</p>
          </div>
        ) : (
          cargos.map((cargo) => (
            <div key={cargo.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-emerald-100 transition-all group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-50 rounded-full group-hover:bg-emerald-50 transition-colors" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-start">
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(cargo.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds([...selectedIds, cargo.id]);
                        else setSelectedIds(selectedIds.filter(id => id !== cargo.id));
                      }}
                      className="w-5 h-5 mt-3 rounded-lg text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer transition-all shadow-sm"
                    />
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors text-slate-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(cargo)} className="p-2 text-slate-300 hover:text-emerald-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onClick={() => deleteCargo(cargo.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{cargo.nome}</h3>
                <p className="text-sm text-slate-500 font-medium line-clamp-2 h-10 leading-relaxed mb-6">{cargo.descricao || 'Sem descrição cadastrada.'}</p>
              </div>

              <div className="relative z-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                   <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Áreas Vinculadas</span>
                   <span className="text-lg font-black text-emerald-600">{cargo._count?.areas || 0}</span>
                </div>
                <Link 
                  href={`/funcionario/areas-atuacao?cargoId=${cargo.id}`}
                  className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  Ver Áreas
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110] animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-10 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 italic">Importação em Massa</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Sincronização de Cargos e Áreas</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-200 hover:text-slate-900 transition-all">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-emerald-700 font-bold leading-relaxed">
                    Use o ponto e vírgula como separador (Compatível com formato Habilitados):<br/>
                    <code className="bg-white px-2 py-1 rounded mt-2 block w-max text-emerald-900 italic">...;CARGO;AREA;CARREIRA;NIVEL;...</code>
                  </p>
                </div>
                <a 
                  href="/modelo_cargos_areas.csv" 
                  download 
                  className="mt-4 text-emerald-700 hover:text-emerald-900 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 underline decoration-2 underline-offset-4"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  Baixar Modelo CSV
                </a>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center group hover:bg-white hover:border-emerald-500 transition-all">
                <input type="file" id="import-file" className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />
                <label htmlFor="import-file" className="cursor-pointer">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm text-slate-400 group-hover:text-emerald-600 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  </div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Subir CSV</span>
                </label>
              </div>
            </div>

            <textarea 
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="w-full h-64 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-mono text-xs font-bold text-slate-700"
              placeholder="Cargo;Area;Carreira;Nivel&#10;Professor;Matemática;Magistério;Superior&#10;Professor;Física;Magistério;Superior&#10;Técnico;Assuntos Educacionais;Técnica;Superior&#10;Assistente;Administração;Técnica;Médio&#10;Analista;Tecnologia da Informação;Técnica;Superior&#10;Bibliotecário;Documentalista;Técnica;Superior&#10;Assistente;Social;Técnica;Superior&#10;Contador;Geral;Técnica;Superior&#10;Professor;Química;Magistério;Superior&#10;Analista;Sistemas;Técnica;Superior&#10;Técnico;Laboratório;Técnica;Médio&#10;Psicólogo;Escolar;Técnica;Superior"
            />

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowImportModal(false)}
                className="px-8 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all"
              >
                Cancelar
              </button>
              <button 
                disabled={!importText.trim() || importing}
                onClick={handleImport}
                className="px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 disabled:opacity-30 transition-all shadow-xl shadow-emerald-100"
              >
                {importing ? 'Importando...' : 'Processar e Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full p-10 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{editMode ? 'Editar' : 'Novo'} Cargo</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Definição Operacional</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-200 hover:text-slate-900 transition-all">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nome do Cargo/Função</label>
                <input 
                  type="text" required 
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                  placeholder="Ex: Professor de Ensino Superior"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Descrição Breve</label>
                <textarea 
                  rows={4}
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800 resize-none"
                  placeholder="Descreva as responsabilidades..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all">Cancelar</button>
                <button type="submit" className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100">
                  {editMode ? 'Salvar Mudanças' : 'Cadastrar Cargo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
