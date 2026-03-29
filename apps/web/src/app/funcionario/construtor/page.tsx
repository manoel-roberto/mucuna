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
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/funcionario/formularios" className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
              </Link>
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest">
                {editId ? 'Editando Modelo' : 'Novo Modelo'}
              </span>
            </div>
            <input 
              type="text" 
              value={formTitle} 
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-3xl font-black text-slate-900 w-full border-b-2 border-slate-100 focus:border-emerald-500 outline-none transition-all pb-2 bg-transparent uppercase tracking-tighter"
              placeholder="Título do Formulário"
            />
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva o propósito deste formulário..."
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/20"
              rows={2}
            />
          </div>
          
          <div className="space-y-4">
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest block pl-1">Vincular/Publicar em Edital</label>
            <select 
              value={selectedEditalId}
              onChange={e => setSelectedEditalId(e.target.value)}
              className="w-full px-4 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm outline-none hover:bg-emerald-600 transition-all cursor-pointer appearance-none shadow-lg"
            >
              <option value="">Apenas Salvar Modelo...</option>
              {editais.map(e => (
                <option key={e.id} value={e.id}>{e.titulo} ({e.ano})</option>
              ))}
            </select>
            <p className="text-sm font-bold text-slate-400 pl-1 leading-tight italic">
              {editId ? 'Você pode atualizar o modelo sem alterar os editais já vinculados.' : 'Selecione um edital para disponibilizar este formulário imediatamente.'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-8 flex items-start gap-6 group hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-50 text-slate-300 p-3 rounded-2xl flex-shrink-0 cursor-move group-hover:bg-emerald-50 group-hover:text-emerald-400 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16"/></svg>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Rótulo do Campo</label>
                  <input 
                    type="text" 
                    value={field.label} 
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    placeholder="Ex: Nome da Mãe, Documento RG..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Tipo de Resposta</label>
                  <select 
                    value={field.type} 
                    onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800 appearance-none cursor-pointer"
                  >
                    <option value="TEXT">Texto Curto</option>
                    <option value="NUMBER">Número</option>
                    <option value="DATE">Data / Calendário</option>
                    <option value="FILE">Upload de PDF</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={field.required} 
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-3 text-sm font-bold text-slate-500 uppercase tracking-tighter">Resposta Obrigatória</span>
                </label>

                <button 
                  onClick={() => removeField(field.id)}
                  className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="bg-white/50 border-4 border-dashed border-slate-100 rounded-[40px] p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-lg">Seu formulário está vazio</p>
            <p className="text-slate-300 font-bold mt-2">Adicione campos abaixo para começar a coletar dados.</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 bg-white/70 backdrop-blur-sm p-6 rounded-[32px] border border-white shadow-lg sticky bottom-8">
        {[
          { type: 'TEXT', label: 'Texto', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
          { type: 'NUMBER', label: 'Número', icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14' },
          { type: 'DATE', label: 'Data', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { type: 'FILE', label: 'Arquivo PDF', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' }
        ].map(btn => (
          <button 
            key={btn.type}
            onClick={() => addField(btn.type as FieldType)} 
            className="px-6 py-3 bg-white border-2 border-slate-50 text-slate-800 hover:border-emerald-500 hover:text-emerald-600 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={btn.icon}/></svg>
            {btn.label}
          </button>
        ))}

        <div className="h-8 w-px bg-slate-100 mx-2 uppercase tracking-widest items-center"></div>

        <button 
          onClick={handlePublish}
          disabled={loading}
          className="px-10 py-4 bg-slate-900 text-white font-black uppercase text-sm tracking-[.2em] rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : editId ? 'Atualizar Modelo' : 'Publicar Formulário'}
        </button>
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
