"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

type FieldType = 'TEXT' | 'NUMBER' | 'FILE' | 'DATE';

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
}

function ConstrutorContent() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [formTitle, setFormTitle] = useState('Novo Formulário de Edital');
  const [description, setDescription] = useState('');
  const [editais, setEditais] = useState<any[]>([]);
  const [selectedEditalId, setSelectedEditalId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  useEffect(() => {
    const fetchEditais = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/editais`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEditais(data);
        }
      } catch (err) {
        console.error('Erro ao buscar editais');
      }
    };

    const fetchModelo = async () => {
      if (!editId) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/formularios/${editId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFormTitle(data.nome);
          setDescription(data.descricao || '');
          const normalizedFields = (data.esquemaJSON.fields || []).map((f: any) => ({
            ...f,
            id: f.id || Math.random().toString(36).substr(2, 9)
          }));
          setFields(normalizedFields);
          // Se estiver vinculado a algum edital, poderíamos marcar aqui, 
          // mas por simplicidade vamos permitir revincular.
        }
      } catch (err) {
        console.error('Erro ao buscar modelo para edição');
      }
    };

    fetchEditais();
    fetchModelo();
  }, [editId]);

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'Novo Campo',
      type,
      required: true,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handlePublish = async () => {
    if (fields.length === 0) {
      alert('Adicione pelo menos um campo ao formulário.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Criar ou Atualizar o Modelo
      const method = editId ? 'PATCH' : 'POST';
      const url = editId ? `${API_URL}/formularios/${editId}` : `${API_URL}/formularios`;
      
      const modelRes = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: formTitle,
          descricao: description,
          esquemaJSON: { fields }
        })
      });

      if (!modelRes.ok) throw new Error('Erro ao salvar modelo.');
      const model = await modelRes.json();

      // 2. Vincular ao Edital (opcional no modo edição se já estiver vinculado)
      if (selectedEditalId) {
        const linkRes = await fetch(`${API_URL}/formularios/vincular-edital`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            editalId: selectedEditalId,
            modeloId: model.id,
            obrigatorio: true
          })
        });

        if (!linkRes.ok) throw new Error('Erro ao vincular formulário ao edital.');
      }

      alert(editId ? 'Formulário atualizado com sucesso!' : 'Formulário publicado com sucesso!');
      router.push('/funcionario/formularios');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-48 animate-in fade-in duration-700">
      <div className="bg-white/40 backdrop-blur-md rounded-[48px] shadow-2xl shadow-primary-mucuna/5 border border-white p-12 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3 mb-2 group">
              <Link href="/funcionario/formularios" className="p-3 bg-white rounded-2xl text-primary-mucuna/20 hover:text-accent-mucuna hover:shadow-lg transition-all border border-transparent hover:border-accent-mucuna/20 shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
              </Link>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.3em]">
                  {editId ? 'Símbolo Ativo' : 'Nova Geração'}
                </span>
                <span className="text-xs font-black text-accent-mucuna uppercase tracking-widest">
                  Construtor de Ativos
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary-mucuna/20 uppercase tracking-[0.2em] pl-1">Título do Instrumento</label>
              <input 
                type="text" 
                value={formTitle} 
                onChange={(e) => setFormTitle(e.target.value)}
                className="text-4xl font-black text-primary-mucuna w-full border-b-4 border-surface-mucuna focus:border-accent-mucuna outline-none transition-all pb-4 bg-transparent uppercase tracking-tighter placeholder:text-primary-mucuna/10"
                placeholder="Título do Formulário"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary-mucuna/20 uppercase tracking-[0.2em] pl-1">Contexto / Descrição</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descreva o propósito deste formulário..."
                className="w-full bg-surface-mucuna/50 border border-transparent rounded-[32px] p-8 text-sm font-bold text-primary-mucuna outline-none focus:ring-4 focus:ring-accent-mucuna/10 focus:bg-white focus:border-accent-mucuna/20 transition-all italic h-24 resize-none"
              />
            </div>
          </div>
          
          <div className="space-y-6 bg-surface-mucuna/30 p-8 rounded-[40px] border border-primary-mucuna/5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-[0.3em] block pl-1">Vincular a Edital</label>
              <div className="relative group">
                <select 
                  value={selectedEditalId}
                  onChange={e => setSelectedEditalId(e.target.value)}
                  className="w-full px-6 py-5 bg-primary-mucuna text-white rounded-[24px] font-black text-xs outline-none hover:bg-secondary-mucuna transition-all cursor-pointer appearance-none shadow-2xl shadow-primary-mucuna/20 pr-12"
                >
                  <option value="">Apenas Salvar Modelo...</option>
                  {editais.map(e => (
                    <option key={e.id} value={e.id}>{e.titulo} ({e.ano})</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-accent-mucuna transition-transform group-hover:translate-y-0.5">
                  <svg className="w-5 h-5 shadow-inner" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>
            <p className="text-[10px] font-bold text-primary-mucuna/30 pl-1 leading-relaxed italic uppercase tracking-wider">
              {editId ? 'Atualizações no modelo não afetam editais já publicados, mantendo a integridade histórica.' : 'Vincule a um ciclo ativo para disponibilizar este formulário imediatamente candidatos.'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-primary-mucuna/5 border border-white p-10 flex items-start gap-8 group hover:shadow-accent-mucuna/5 hover:border-accent-mucuna/10 transition-all animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col items-center gap-4">
               <div className="bg-surface-mucuna text-primary-mucuna/20 p-4 rounded-[20px] flex-shrink-0 cursor-move group-hover:bg-accent-mucuna group-hover:text-primary-mucuna transition-all shadow-inner">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16"/></svg>
              </div>
              <span className="text-[10px] font-black text-primary-mucuna/10 tabular-nums">#{index + 1}</span>
            </div>
            
            <div className="flex-1 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em] pl-1">Rótulo do Campo</label>
                  <input 
                    type="text" 
                    value={field.label} 
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    className="w-full px-8 py-5 bg-surface-mucuna/40 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna/30 transition-all font-black text-primary-mucuna uppercase tracking-tighter shadow-inner focus:shadow-xl"
                    placeholder="Ex: Nome da Mãe, Documento RG..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em] pl-1">Tipo de Dado</label>
                  <div className="relative group/sel">
                    <select 
                      value={field.type} 
                      onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                      className="w-full px-8 py-5 bg-surface-mucuna/40 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna/30 transition-all font-black text-primary-mucuna uppercase tracking-widest appearance-none cursor-pointer shadow-inner pr-12"
                    >
                      <option value="TEXT">Texto Alfanumérico</option>
                      <option value="NUMBER">Valor Numérico</option>
                      <option value="DATE">Cronograma / Data</option>
                      <option value="FILE">Documentação Digital (PDF)</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary-mucuna/20 group-hover/sel:text-accent-mucuna transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-8 border-t border-primary-mucuna/5">
                <label className="relative inline-flex items-center cursor-pointer group/toggle">
                  <input 
                    type="checkbox" 
                    checked={field.required} 
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-surface-mucuna peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-mucuna shadow-inner"></div>
                  <span className="ml-4 text-[10px] font-black text-primary-mucuna/30 uppercase tracking-[0.2em] group-hover/toggle:text-primary-mucuna/60 transition-colors">Campo Requisitado</span>
                </label>

                <button 
                  onClick={() => removeField(field.id)}
                  className="p-4 text-primary-mucuna/10 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="bg-white/40 border-4 border-dashed border-white rounded-[60px] p-24 text-center backdrop-blur-sm group hover:border-accent-mucuna/20 transition-all duration-700 leading-none">
            <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-white group-hover:scale-110 transition-transform duration-500">
              <svg className="w-12 h-12 text-primary-mucuna/5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-primary-mucuna/20 font-black uppercase tracking-[0.4em] text-2xl italic mb-4">Estrutura Vacante</p>
            <p className="text-primary-mucuna/30 font-bold text-xs uppercase tracking-widest pl-1">Injete novos nodos de dados para fundamentar este instrumento.</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 z-[200]">
        <div className="bg-primary-mucuna/90 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 shadow-3xl shadow-primary-mucuna/40 flex flex-wrap items-center justify-center gap-4">
          {[
            { type: 'TEXT', label: 'Texto', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
            { type: 'NUMBER', label: 'Número', icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14' },
            { type: 'DATE', label: 'Data', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { type: 'FILE', label: 'Arquivo PDF', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' }
          ].map(btn => (
            <button 
              key={btn.type}
              onClick={() => addField(btn.type as FieldType)} 
              className="px-6 py-4 bg-white/5 border border-white/5 text-white/60 hover:text-accent-mucuna hover:bg-white/10 hover:border-accent-mucuna/20 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={btn.icon}/></svg>
              {btn.label}
            </button>
          ))}

          <div className="h-10 w-px bg-white/10 mx-4 hidden md:block"></div>

          <button 
            onClick={handlePublish}
            disabled={loading}
            className="group relative px-10 py-5 bg-accent-mucuna text-primary-mucuna font-black uppercase text-xs tracking-[0.3em] rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent-mucuna/20 disabled:opacity-50 min-w-[200px] overflow-hidden leading-none"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-mucuna border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
              )}
              {loading ? 'Sincronizando...' : editId ? 'Atualizar Ativo' : 'Publicar Instrumento'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConstrutorPage() {
  return (
    <Suspense fallback={<div>Carregando Construtor...</div>}>
      <ConstrutorContent />
    </Suspense>
  );
}
