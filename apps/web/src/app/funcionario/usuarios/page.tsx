'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

interface Role {
  id: string;
  nome: string;
  descricao?: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  roleId: string;
  role: {
    nome: string;
  };
  criadoEm: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    roleId: '',
    senha: '',
  });

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const staffRoles = data.filter((r: Role) => r.nome !== 'Candidato');
        setRoles(staffRoles);
        if (!editMode && staffRoles.length > 0) {
          setFormData(prev => ({ ...prev, roleId: staffRoles[0].id }));
        }
      }
    } catch (err) {
      console.error('Erro ao buscar perfis', err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const equipe = data.filter((u: Usuario) => u.role?.nome !== 'Candidato');
        setUsuarios(equipe);
      }
    } catch (err) {
      console.error('Erro ao buscar usuários', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUsuarios();
  }, []);

  const openCreateModal = () => {
    setEditMode(false);
    setEditingId(null);
    setFormData({ 
      nome: '', 
      email: '', 
      cpf: '', 
      roleId: roles[0]?.id || '', 
      senha: '' 
    });
    setShowModal(true);
  };

  const openEditModal = (u: Usuario) => {
    setEditMode(true);
    setEditingId(u.id);
    setFormData({
      nome: u.nome,
      email: u.email,
      cpf: u.cpf,
      roleId: u.roleId,
      senha: '', // Senha vazia por padrão na edição
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editMode ? 'PATCH' : 'POST';
      const url = editMode ? `${API_URL}/usuarios/${editingId}` : `${API_URL}/usuarios`;
      
      // Remove a senha do corpo se estiver vazia durante a edição
      const payload = { ...formData };
      if (editMode && !payload.senha) {
        delete (payload as any).senha;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        fetchUsuarios();
        alert(editMode ? 'Usuário atualizado!' : 'Usuário cadastrado!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Erro: ${errorData.message || 'Verifique os dados.'}`);
      }
    } catch (err) {
      alert('Falha na comunicação.');
    }
  };

  const deleteUsuario = async (id: string) => {
    if (!confirm('Remover este funcionário?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchUsuarios();
    } catch (err) {
      alert('Erro ao excluir.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Equipe</h1>
          <p className="text-sm text-slate-500">Administre os membros da equipe e seus perfis de acesso.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Novo Integrante
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
              <th className="p-6">Funcionário</th>
              <th className="p-6">Email / CPF</th>
              <th className="p-6">Perfil</th>
              <th className="p-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="p-12 text-center text-slate-300 font-bold italic">Sincronizando equipe...</td></tr>
            ) : usuarios.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-6">
                  <div className="font-extrabold text-slate-900">{u.nome}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Membro da Equipe</div>
                </td>
                <td className="p-6">
                  <div className="text-sm font-bold text-slate-600">{u.email}</div>
                  <div className="text-xs font-medium text-slate-400">{u.cpf}</div>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    u.role?.nome === 'Administrador' ? 'bg-indigo-100 text-indigo-700' :
                    u.role?.nome === 'Operador' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {u.role?.nome || 'Sem Perfil'}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(u)}
                      className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Editar informações e senha"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button 
                      onClick={() => deleteUsuario(u.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-md w-full p-10 space-y-8 animate-in zoom-in-95 duration-300">
            <div>
              <h2 className="text-2xl font-black text-slate-900">{editMode ? 'Editar' : 'Novo'} Integrante</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configurações de Identidade e Acesso</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nome Completo</label>
                <input 
                  type="text" required 
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                  placeholder="Nome do funcionário"
                />
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Profissional</label>
                  <input 
                    type="email" required 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    placeholder="email@uefs.br"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">CPF</label>
                  <input 
                    type="text" required 
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Senha de Acesso</label>
                <input 
                  type="password"
                  required={!editMode}
                  value={formData.senha}
                  onChange={e => setFormData({...formData, senha: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                  placeholder={editMode ? "Deixe em branco p/ manter atual" : "Mínimo 6 caracteres"}
                />
                {editMode && <p className="text-[9px] font-bold text-emerald-500 mt-1 uppercase tracking-tighter">* Preencha apenas se desejar redefinir a senha.</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Perfil / Permissão</label>
                <select 
                  value={formData.roleId}
                  onChange={e => setFormData({...formData, roleId: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Selecione um perfil</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.nome}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
                  {editMode ? 'Salvar Mudanças' : 'Criar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
