'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import Link from 'next/link';

export default function ImportarHabilitadosPage() {
  const [editais, setEditais] = useState<any[]>([]);
  const [selectedEditalId, setSelectedEditalId] = useState('');
  const [importText, setImportText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [step, setStep] = useState(1); // 1: Edital, 2: Dados, 3: Sucesso
  const [stats, setStats] = useState<{ total: number; errors?: string[] }>({ total: 0 });
  const router = useRouter();

  useEffect(() => {
    const fetchEditais = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/editais`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Apenas editais que não estão ENCERRADOS
          setEditais(data.filter((e: any) => e.status !== 'ENCERRADO'));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchEditais();
  }, []);

  const handleImport = async () => {
    if (!selectedEditalId) return;
    
    setLoading(true);
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

    const idxInscricao = getIndex(['INSCRICAO', 'INSC', 'INSCRIÇÃO']);
    const idxCpf = getIndex(['CPF']);
    const idxNome = getIndex(['NOME', 'CANDIDATO']);
    const idxNota = getIndex(['NOTA']);
    const idxPosAmpla = getIndex(['POS_AMPLA', 'POSICAO', 'POSICAO_AMPLA', 'POS', 'AMPLA CONCORRENCIA', 'POSICAO AMPLA']);
    const idxPosNegro = getIndex(['POS_NEGRO', 'POSICAO NEGRO', 'NEGRO']);
    const idxPosPCD = getIndex(['POS_PCD', 'POSICAO PCD', 'PCD']);
    const idxModalidade = getIndex(['MODALIDADE', 'MOD', 'MODALIDADE_CONCORRENCIA', 'VAGA']);
    const idxCargo = getIndex(['CARGO']);
    const idxArea = getIndex(['AREA', 'ÁREA', 'AREA_ATUACAO', 'AREA ATUACAO']);
    const idxCarreira = getIndex(['CARREIRA']);
    const idxEmail = getIndex(['EMAIL', 'E-MAIL']);
    const idxTelefone = getIndex(['TELEFONE', 'TELEFONE FIXO']);
    const idxCelular = getIndex(['CELULAR']);
    const idxNivel = getIndex(['NIVEL', 'NÍVEL']);
    const idxEndereco = getIndex(['ENDERECO', 'ENDEREÇO']);

    const parsed = dataLines.map((line) => {
      const parts = line.split(';').map(s => s.trim());
      if (parts.length < 3) return null;

      const getVal = (idx: number) => (idx !== -1 && parts[idx]) ? parts[idx] : undefined;

      const numeroInscricao = getVal(idxInscricao);
      const cpf = getVal(idxCpf);
      const nome = getVal(idxNome);
      const notaRaw = getVal(idxNota);
      const posicaoAmpla = getVal(idxPosAmpla);
      const posicaoNegro = getVal(idxPosNegro);
      const posicaoPCD = getVal(idxPosPCD);
      const modalidadeConcorrencia = getVal(idxModalidade);
      const cargo = getVal(idxCargo);
      const area = getVal(idxArea);
      const carreira = getVal(idxCarreira);
      const nivel = getVal(idxNivel);
      const email = getVal(idxEmail);
      const telefone = getVal(idxTelefone);
      const celular = getVal(idxCelular);
      const endereco = getVal(idxEndereco);

      return { 
        numeroInscricao, 
        cpf, 
        nome, 
        nota: notaRaw ? parseFloat(notaRaw.replace(',', '.')) : undefined,
        posicaoAmpla: posicaoAmpla ? parseInt(posicaoAmpla as string) : 0, 
        posicaoNegro: (posicaoNegro && !isNaN(parseInt(posicaoNegro as string))) ? parseInt(posicaoNegro as string) : undefined,
        posicaoPCD: (posicaoPCD && !isNaN(parseInt(posicaoPCD as string))) ? parseInt(posicaoPCD as string) : undefined,
        modalidadeConcorrencia,
        cargo,
        area,
        carreira,
        nivel,
        email,
        telefone,
        celular,
        endereco
      };
    }).filter((c): c is any => c !== null && !!c.nome && !!c.cpf && !!c.numeroInscricao);

    if (parsed.length === 0) {
      alert('Nenhum dado válido encontrado no CSV. Verique o cabeçalho e os separadores (;).');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/editais/${selectedEditalId}/classificacao/importar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ candidatos: parsed }),
      });

      if (res.ok) {
        const data = await res.json();
        setStats({ total: data.total, errors: data.errors });
        setStep(3);
      } else {
        const error = await res.json();
        alert(error.message || 'DEBUG-WEB: Erro ao importar (sem mensagem da API).');
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Importação da Banca Examinadora</h1>
        <p className="text-slate-500 font-medium">Sincronize a lista de candidatos aprovados e habilitados</p>
      </div>

      {/* Stepper Visual */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black transition-all ${
              step === s ? 'bg-emerald-600 text-white shadow-lg scale-110' : 
              step > s ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
            }`}>
              {step > s ? '✓' : s}
            </div>
            {s < 3 && <div className={`w-12 h-1 bg-slate-200 rounded ${step > s ? 'bg-emerald-200' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
        {step === 1 && (
          <div className="p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Selecione o Edital Destino</label>
              <div className="grid grid-cols-1 gap-3">
                {editais.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEditalId(e.id)}
                    className={`w-full p-6 text-left rounded-3xl border-2 transition-all flex justify-between items-center group ${
                      selectedEditalId === e.id 
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-md' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="block font-black text-slate-900 text-lg">{e.titulo}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{e.ano} • {e.status}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedEditalId === e.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-200'
                    }`}>
                      {selectedEditalId === e.id && <div className="w-2 h-2 rounded-full bg-white animate-in zoom-in" />}
                    </div>
                  </button>
                ))}
                {editais.length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 italic font-bold">
                    Nenhum edital ativo encontrado para importação.
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                disabled={!selectedEditalId}
                onClick={() => setStep(2)}
                className="px-12 py-5 bg-slate-900 text-white font-black rounded-[24px] hover:bg-emerald-600 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all shadow-xl"
              >
                Próximo Passo: Dados
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-10 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 relative overflow-hidden h-full">
                 <div className="relative z-10 flex gap-4 items-start">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <h4 className="font-black text-emerald-900 uppercase text-xs tracking-widest mb-1">Processamento Inteligente (CSV)</h4>
                      <p className="text-sm text-emerald-700 font-bold leading-relaxed">
                        O sistema mapeia as colunas automaticamente pelo cabeçalho. Certifique-se de que o arquivo contenha:<br/>
                        <code className="bg-white/80 px-1.5 rounded text-emerald-900 font-black text-[10px]">INSCRICAO; CPF; NOME; MODALIDADE; CARGO; AREA; CARREIRA; NIVEL</code>
                      </p>
                      <a 
                        href="/modelo_importacao.csv" 
                        download="modelo_importacao.csv"
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/40 hover:bg-white/60 text-emerald-900 rounded-lg text-[10px] font-black transition-all border border-emerald-200/50"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        Baixar Arquivo de Exemplo
                      </a>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center group hover:bg-white hover:border-emerald-500 transition-all">
                <input 
                  type="file" 
                  id="csv-file" 
                  accept=".csv,.txt"
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <label htmlFor="csv-file" className="cursor-pointer space-y-2">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 transition-all">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <span className="block text-xs font-black text-slate-500 uppercase tracking-widest">Upload de Arquivo CSV</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dados Coletados / Área de Texto</label>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                className="w-full h-80 p-8 bg-slate-50 border-2 border-slate-100 rounded-[32px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-mono text-xs font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="2026001;123.456.789-00;MANOEL SILVA;1;AMPLA CONCORRENCIA;PROFESSOR;MATEMATICA;MAGISTERIO;SUPERIOR"
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-8 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all"
              >
                Voltar
              </button>
              <button
                disabled={!importText.trim() || loading}
                onClick={handleImport}
                className="px-12 py-5 bg-emerald-600 text-white font-black rounded-[24px] hover:bg-emerald-700 disabled:opacity-30 transition-all shadow-xl shadow-emerald-200"
              >
                {loading ? 'Processando...' : 'Processar e Salvar'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-16 text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 italic">Importação Concluída!</h2>
              <p className="text-slate-500 font-bold">Processamos <span className="text-emerald-600">{stats.total} candidatos</span> com sucesso.</p>
              
              {stats.errors && stats.errors.length > 0 && (
                <div className="mt-6 p-6 bg-rose-50 border border-rose-100 rounded-3xl text-left max-h-60 overflow-y-auto">
                  <h4 className="text-xs font-black text-rose-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    Avisos / Erros ({stats.errors.length})
                  </h4>
                  <ul className="space-y-1.5">
                    {stats.errors.map((err, i) => (
                      <li key={i} className="text-[10px] text-rose-600 font-bold flex gap-2">
                        <span className="opacity-50">•</span>
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center pt-8">
              <button
                onClick={() => { setStep(1); setImportText(''); setSelectedEditalId(''); }}
                className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
              >
                Nova Importação
              </button>
              <Link
                href="/funcionario/editais"
                className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 font-black rounded-2xl hover:border-slate-200 transition-all"
              >
                Ver Editais
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
