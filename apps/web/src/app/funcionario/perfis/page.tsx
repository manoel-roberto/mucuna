'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import PermissionGuard from '@/components/PermissionGuard';

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

  const toggleCategory = (category: string, perms: Permission[]) => {
    const permIds = perms.map(p => p.id);
    const allSelected = permIds.every(id => formData.permissionIds.includes(id));

    setFormData(prev => ({
      ...prev,
      permissionIds: allSelected
        ? prev.permissionIds.filter(id => !permIds.includes(id))
        : [...new Set([...prev.permissionIds, ...permIds])]
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
    <PermissionGuard requiredPermission="PERFIS_LISTAR">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary-mucuna font-display uppercase tracking-tight">Perfis de Acesso (RBAC)</h1>
          <p className="text-slate-400 font-bold text-sm tracking-tight">Configure o que cada tipo de colaborador pode fazer no sistema.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary-mucuna hover:bg-secondary-mucuna text-white px-5 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-primary-mucuna/10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
          Novo Perfil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Carregando perfis...</div>
        ) : roles.map(role => (
          <div key={role.id} className="bg-white rounded-[32px] shadow-xl shadow-primary-mucuna/5 border border-accent-mucuna/10 p-8 space-y-6 hover:border-accent-mucuna/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-primary-mucuna uppercase tracking-tight">{role.nome}</h3>
                <span className="text-[10px] bg-accent-mucuna/10 text-accent-mucuna px-3 py-1 rounded-full uppercase font-black tabular-nums tracking-widest">
                  {role.permissions.length} PERMISÕES
                </span>
              </div>
              <p className="text-slate-400 font-medium text-sm mb-4 line-clamp-2">{role.descricao || 'Sem descrição definida.'}</p>
              
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 5).map(p => (
                  <span key={p.permissionId} className="text-[9px] font-black uppercase tracking-wider bg-surface-mucuna text-primary-mucuna/60 px-2 py-1 rounded-lg">
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
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Matriz de Permissões Granulares</h3>
                    <div className="flex gap-2">
                       <button 
                         type="button" 
                         onClick={() => setFormData({...formData, permissionIds: []})}
                         className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider px-3 py-1 rounded-lg hover:bg-red-50"
                       >
                         Nenhuma
                       </button>
                       <button 
                         type="button" 
                         onClick={() => setFormData({...formData, permissionIds: allPermissions.map(p => p.id)})}
                         className="text-[10px] font-bold text-emerald-500 hover:text-emerald-700 transition-colors uppercase tracking-wider px-3 py-1 rounded-lg hover:bg-emerald-50"
                       >
                         Tudo (Admin)
                       </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 italic">
                          <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Módulo / Recurso</th>
                          <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-2">Consultar</th>
                          <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-2">Criar</th>
                          <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-2">Editar</th>
                          <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-2">Excluir</th>
                          <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-2">Outros / Especial</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {Object.entries(permissionsByCategory).sort(([a], [b]) => a.localeCompare(b)).map(([categoria, perms]) => {
                          // Detecção robusta de permissões CRUD
                          const listar = perms.find(p => p.slug.endsWith('_LISTAR') || p.slug.endsWith('_VER') || p.slug.endsWith('_CONSULTAR'));
                          const criar = perms.find(p => p.slug.endsWith('_CRIAR') || p.slug.endsWith('_ADICIONAR') || p.slug.endsWith('_NOVO'));
                          const editar = perms.find(p => p.slug.endsWith('_EDITAR') || p.slug.endsWith('_ALTERAR') || p.slug.endsWith('_ATUALIZAR'));
                          const excluir = perms.find(p => p.slug.endsWith('_EXCLUIR') || p.slug.endsWith('_REMOVER') || p.slug.endsWith('_DELETAR'));
                          
                          // Outras permissões que não encaixam no CRUD padrão
                          const usedIds = new Set([listar?.id, criar?.id, editar?.id, excluir?.id].filter(Boolean));
                          const extras = perms.filter(p => !usedIds.has(p.id));

                          return (
                            <tr key={categoria} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50">
                              <td className="py-5 pl-4 max-w-[200px]">
                                <span className="text-[11px] font-black text-accent-mucuna uppercase tracking-widest block mb-0.5">{categoria}</span>
                                <div className="flex items-center gap-2">
                                  <button 
                                    type="button"
                                    onClick={() => toggleCategory(categoria, perms)}
                                    className="text-[9px] font-bold text-slate-300 hover:text-emerald-500 transition-colors uppercase"
                                  >
                                    {perms.every(p => formData.permissionIds.includes(p.id)) ? 'Limpar Tudo' : 'Marcar Tudo'}
                                  </button>
                                </div>
                              </td>
                              
                              {[listar, criar, editar, excluir].map((p, idx) => (
                                <td key={idx} className="py-5 text-center">
                                  {p ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                      <label className="relative flex items-center justify-center cursor-pointer group/cb">
                                        <input 
                                          type="checkbox"
                                          className="peer appearance-none w-6 h-6 border-2 border-accent-mucuna/20 rounded-lg checked:bg-primary-mucuna checked:border-primary-mucuna transition-all hover:border-accent-mucuna"
                                          checked={formData.permissionIds.includes(p.id)}
                                          onChange={() => togglePermission(p.id)}
                                        />
                                        <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                                        <div className="absolute -top-8 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover/cb:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 font-bold">
                                          {p.nome}
                                        </div>
                                      </label>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center h-full">
                                      <span className="text-slate-100 text-[10px] font-bold">—</span>
                                    </div>
                                  )}
                                </td>
                              ))}

                              <td className="py-5 px-4">
                                <div className="flex flex-wrap gap-1.5 justify-start">
                                  {extras.map(p => (
                                    <button 
                                      key={p.id}
                                      type="button"
                                      onClick={() => togglePermission(p.id)}
                                      className={`text-[9px] font-bold px-2 py-1.5 rounded-lg border transition-all flex items-center gap-1.5
                                        ${formData.permissionIds.includes(p.id) 
                                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                          : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'}`}
                                    >
                                      <div className={`w-2 h-2 rounded-full ${formData.permissionIds.includes(p.id) ? 'bg-accent-mucuna' : 'bg-slate-200'}`} />
                                      {p.nome}
                                    </button>
                                  ))}
                                  {extras.length === 0 && <span className="text-slate-100 text-[10px] font-bold">—</span>}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-surface-mucuna border-t border-accent-mucuna/10 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-slate-100 rounded-2xl transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-primary-mucuna text-white font-black uppercase text-xs tracking-widest rounded-3xl hover:bg-secondary-mucuna shadow-xl shadow-primary-mucuna/20 transition-all">
                   {editingRole ? 'Salvar Alterações' : 'Criar Perfil de Acesso'}
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
