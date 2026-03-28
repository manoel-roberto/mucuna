'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import PermissionGuard from '@/components/PermissionGuard';

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
    <PermissionGuard requiredPermission="USUARIOS_LISTAR">
      <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-mucuna/5 border border-primary-mucuna/10 rounded-full">
            <div className="w-1.5 h-1.5 bg-primary-mucuna rounded-full" />
            <span className="text-[10px] font-black text-primary-mucuna uppercase tracking-[0.2em]">Administração</span>
          </div>
          <h1 className="text-4xl font-black text-primary-mucuna font-display uppercase tracking-tighter italic">Gestão de <span className="text-accent-mucuna not-italic">Equipe.</span></h1>
          <p className="text-sm text-slate-400 font-bold max-w-md">Controle de acessos e membros da equipe administrativa do ecossistema Mucunã.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="group relative bg-primary-mucuna hover:bg-secondary-mucuna text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-primary-mucuna/20 hover:-translate-y-1 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
          <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
          <span className="relative z-10">Novo Integrante</span>
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-primary-mucuna/5 border border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-mucuna/50 border-b border-primary-mucuna/5">
                <th className="p-8 text-[10px] uppercase font-black text-primary-mucuna/40 tracking-[0.3em]">Funcionário</th>
                <th className="p-8 text-[10px] uppercase font-black text-primary-mucuna/40 tracking-[0.3em]">Contato & Identidade</th>
                <th className="p-8 text-[10px] uppercase font-black text-primary-mucuna/40 tracking-[0.3em]">Perfil de Acesso</th>
                <th className="p-8 text-right text-[10px] uppercase font-black text-primary-mucuna/40 tracking-[0.3em]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-mucuna/5">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center text-primary-mucuna/20 font-black uppercase tracking-widest animate-pulse">Sincronizando Dados Orgânicos...</td></tr>
              ) : usuarios.map(u => (
                <tr key={u.id} className="hover:bg-primary-mucuna/[0.02] transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-mucuna rounded-2xl flex items-center justify-center text-primary-mucuna font-black text-xl shadow-inner border border-primary-mucuna/5">
                        {u.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-primary-mucuna text-lg leading-tight uppercase tracking-tighter italic">{u.nome}</div>
                        <div className="text-[10px] text-accent-mucuna font-black uppercase tracking-widest mt-0.5">Membro Integrante</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="text-sm font-bold text-slate-600 mb-1">{u.email}</div>
                    <div className="inline-block px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">{u.cpf}</div>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${
                      u.role?.nome === 'Administrador' ? 'bg-primary-mucuna text-white' :
                      u.role?.nome === 'Operador' ? 'bg-accent-mucuna text-white' : 'bg-surface-mucuna text-primary-mucuna border border-primary-mucuna/10'
                    }`}>
                      {u.role?.nome || 'Sem Perfil'}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => openEditModal(u)}
                        className="p-3 text-primary-mucuna/30 hover:text-primary-mucuna hover:bg-white rounded-2xl transition-all shadow-none hover:shadow-lg hover:shadow-primary-mucuna/10"
                        title="Editar configurações"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button 
                        onClick={() => deleteUsuario(u.id)}
                        className="p-3 text-primary-mucuna/30 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all shadow-none hover:shadow-lg hover:shadow-rose-600/10"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-primary-mucuna/40 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-500">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[56px] shadow-2xl shadow-primary-mucuna/20 max-w-lg w-full p-12 space-y-10 animate-in zoom-in-95 duration-500 border border-white">
            <div className="space-y-3">
              <div className="w-16 h-1 bg-accent-mucuna rounded-full opacity-50" />
              <h2 className="text-4xl font-black text-primary-mucuna font-display uppercase tracking-tighter leading-tight italic">{editMode ? 'Editar' : 'Novo'} <span className="text-accent-mucuna not-italic">Membro.</span></h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sincronização de Identidade e Acesso</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna transition-colors">Nome Completo</label>
                  <input 
                    type="text" required 
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-bold text-primary-mucuna shadow-inner"
                    placeholder="Nome do integrante"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna transition-colors">E-mail Corporativo</label>
                    <input 
                      type="email" required 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-bold text-primary-mucuna shadow-inner"
                      placeholder="email@uefs.br"
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna transition-colors">CPF</label>
                    <input 
                      type="text" required 
                      value={formData.cpf}
                      onChange={e => setFormData({...formData, cpf: e.target.value})}
                      className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-bold text-primary-mucuna shadow-inner"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna transition-colors">Senha de Acesso</label>
                  <input 
                    type="password"
                    required={!editMode}
                    value={formData.senha}
                    onChange={e => setFormData({...formData, senha: e.target.value})}
                    className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-bold text-primary-mucuna shadow-inner"
                    placeholder={editMode ? "Mantenha em branco p/ não alterar" : "Mínimo 6 caracteres"}
                  />
                  {editMode && <p className="text-[9px] font-black text-accent-mucuna mt-2 uppercase tracking-tight italic">* Preencha apenas para redefinir a credencial.</p>}
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-primary-mucuna/40 uppercase tracking-widest pl-2 group-focus-within:text-accent-mucuna transition-colors">Perfil de Permissão</label>
                  <div className="relative">
                    <select 
                      value={formData.roleId}
                      onChange={e => setFormData({...formData, roleId: e.target.value})}
                      className="w-full px-8 py-5 bg-surface-mucuna/50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-accent-mucuna transition-all font-black text-primary-mucuna shadow-inner appearance-none cursor-pointer text-sm"
                    >
                      <option value="" disabled>Selecione um perfil orgânico</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.nome}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-accent-mucuna">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-10">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-5 text-primary-mucuna/40 font-black uppercase text-[10px] tracking-widest hover:text-primary-mucuna transition-all order-2 md:order-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="group relative flex-[2] py-5 bg-primary-mucuna text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:bg-secondary-mucuna transition-all shadow-2xl shadow-primary-mucuna/30 order-1 md:order-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-mucuna to-support-mucuna opacity-0 group-hover:opacity-10 transition-opacity" />
                  <span className="relative z-10">{editMode ? 'Salvar Mudanças' : 'Confirmar Ingresso'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </PermissionGuard>
  );
}
