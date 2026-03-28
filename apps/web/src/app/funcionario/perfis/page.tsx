'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

interface Permission {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  categoria: string;
}

interface Role {
  id: string;
  nome: string;
  descricao?: string;
  permissions: {
    permissionId: string;
    permission: Permission;
  }[];
}

export default function PerfisPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    permissionIds: [] as string[],
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [rolesRes, permsRes] = await Promise.all([
        fetch(`${API_URL}/roles`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/roles/permissions`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (rolesRes.ok && permsRes.ok) {
        setRoles(await rolesRes.json());
        setAllPermissions(await permsRes.json());
      }
    } catch (err) {
      console.error('Erro ao buscar dados', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        nome: role.nome,
        descricao: role.descricao || '',
        permissionIds: role.permissions.map(p => p.permissionId),
      });
    } else {
      setEditingRole(null);
      setFormData({
        nome: '',
        descricao: '',
        permissionIds: [],
      });
    }
    setShowModal(true);
  };

  const togglePermission = (id: string) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter(pid => pid !== id)
        : [...prev.permissionIds, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingRole ? `${API_URL}/roles/${editingRole.id}` : `${API_URL}/roles`;
      const method = editingRole ? 'PATCH' : 'POST';

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
        alert(`Perfil ${editingRole ? 'atualizado' : 'criado'} com sucesso!`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Erro: ${errorData.message || 'Erro ao salvar perfil'}`);
      }
    } catch (err) {
      alert('Falha na comunicação com o servidor.');
    }
  };

  const deleteRole = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este perfil?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/roles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || 'Erro ao remover perfil. Certifique-se que não existem usuários vinculados.');
      }
    } catch (err) {
      alert('Erro ao excluir perfil.');
    }
  };

  // Agrupa permissões por categoria
  const permissionsByCategory = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.categoria]) acc[perm.categoria] = [];
    acc[perm.categoria].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Perfis de Acesso (RBAC)</h1>
          <p className="text-slate-500 text-sm">Configure o que cada tipo de colaborador pode fazer no sistema.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Novo Perfil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Carregando perfis...</div>
        ) : roles.map(role => (
          <div key={role.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 hover:border-emerald-500 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900">{role.nome}</h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase font-bold tabular-nums">
                  {role.permissions.length} Permissões
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{role.descricao || 'Sem descrição definida.'}</p>
              
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 5).map(p => (
                  <span key={p.permissionId} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                    {p.permission.nome}
                  </span>
                ))}
                {role.permissions.length > 5 && (
                  <span className="text-[10px] text-slate-400 px-1 py-1">+{role.permissions.length - 5}</span>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-50">
              <button 
                onClick={() => handleOpenModal(role)}
                className="flex-1 text-slate-600 hover:bg-slate-100 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Editar
              </button>
              <button 
                onClick={() => deleteRole(role.id)}
                className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
                title="Remover Perfil"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingRole ? `Editar Perfil: ${editingRole.nome}` : 'Criar Novo Perfil'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Perfil</label>
                    <input 
                      type="text" required 
                      placeholder="Ex: Recursos Humanos"
                      value={formData.nome}
                      onChange={e => setFormData({...formData, nome: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</label>
                    <input 
                      type="text"
                      placeholder="Para que serve este perfil?"
                      value={formData.descricao}
                      onChange={e => setFormData({...formData, descricao: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Capacidades e Permissões</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.entries(permissionsByCategory).map(([categoria, perms]) => (
                      <div key={categoria} className="space-y-3">
                        <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest">{categoria}</h4>
                        <div className="space-y-2">
                          {perms.map(perm => (
                            <label key={perm.id} className="flex items-start gap-3 group cursor-pointer">
                              <div className="relative flex items-center mt-0.5">
                                <input 
                                  type="checkbox"
                                  className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-all"
                                  checked={formData.permissionIds.includes(perm.id)}
                                  onChange={() => togglePermission(perm.id)}
                                />
                                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-1 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">{perm.nome}</span>
                                {perm.descricao && <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{perm.descricao}</p>}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-black shadow-lg shadow-slate-200 transition-all">
                   {editingRole ? 'Salvar Alterações' : 'Criar Perfil de Acesso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
