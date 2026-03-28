'use client';
import { useState } from 'react';
import { API_URL } from '@/lib/api';

interface FormRendererProps {
  modelo: any;
  classificacaoId: string;
  onSuccess?: () => void;
}

export default function FormRenderer({ modelo, classificacaoId, onSuccess }: FormRendererProps) {
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const fields = modelo.esquemaJSON.fields || [];

  const handleChange = (id: string, value: any) => {
    setRespostas(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/envios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          classificacaoId,
          modeloId: modelo.id,
          respostasJSON: respostas
        })
      });

      if (res.ok) {
        alert('Formulário enviado com sucesso!');
        if (onSuccess) onSuccess();
      } else {
        throw new Error('Erro ao enviar formulário.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 p-10 space-y-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{modelo.nome}</h3>
          </div>
          <p className="text-slate-500 text-sm font-bold leading-relaxed">{modelo.descricao || 'Preencha as informações abaixo para prosseguir com sua habilitação.'}</p>
        </div>

        <div className="space-y-8">
          {fields.map((field: any) => (
            <div key={field.id} className="space-y-3">
              <label 
                htmlFor={`field-${field.id}`}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block"
              >
                {field.label} {field.required && <span className="text-rose-500 ml-1">●</span>}
              </label>
              
              {field.type === 'TEXT' && (
                <input 
                  id={`field-${field.id}`}
                  type="text" 
                  required={field.required}
                  placeholder={`Digite seu ${field.label.toLowerCase()}...`}
                  onChange={e => handleChange(field.id, e.target.value)}
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800 placeholder:text-slate-300"
                />
              )}

              {field.type === 'NUMBER' && (
                <input 
                  id={`field-${field.id}`}
                  type="number" 
                  required={field.required}
                  placeholder="00"
                  onChange={e => handleChange(field.id, e.target.value)}
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                />
              )}

              {field.type === 'DATE' && (
                <input 
                  id={`field-${field.id}`}
                  type="date" 
                  required={field.required}
                  onChange={e => handleChange(field.id, e.target.value)}
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800 cursor-pointer"
                />
              )}

              {field.type === 'FILE' && (
                <div className="relative group">
                  <input 
                    id={`field-${field.id}`}
                    type="file" 
                    accept="application/pdf"
                    required={field.required}
                    onChange={e => handleChange(field.id, e.target.files?.[0]?.name)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full px-8 py-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[20px] group-hover:bg-white group-hover:border-emerald-500 transition-all flex items-center justify-between text-slate-400 font-bold">
                    <div className="flex items-center gap-4">
                      <svg className="w-6 h-6 text-slate-300 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                      <span className="text-sm">{respostas[field.id] || 'Anexar documento PDF'}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase group-hover:text-emerald-600 transition-colors">Selecionar</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-slate-900 text-white font-black uppercase text-xs tracking-[.3em] rounded-[24px] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 hover:shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : 'Enviar Respostas'}
          </button>
          <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-6">Ao enviar, você declara que as informações são verdadeiras.</p>
        </div>
      </div>
    </form>
  );
}
