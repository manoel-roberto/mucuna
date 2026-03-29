'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '@/lib/api';

interface User {
  id: string;
  nome: string;
  email: string;
  roleName: string;
  permissions: string[];
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/usuarios/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const text = await res.text();
        if (!text) {
          console.warn('API retornou resposta vazia para /usuarios/me');
          throw new Error('No user data found');
        }
        
        const data = JSON.parse(text);
        const flattenedPermissions = data.role?.permissions?.map((p: any) => p.permission.slug) || [];
        
        const userData = {
          id: data.id,
          nome: data.nome,
          email: data.email,
          roleName: data.role?.nome || 'Usuário',
          permissions: flattenedPermissions
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Se o token for inválido, limpa tudo
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (e) {
      console.error('Erro ao sincronizar usuário com API', e);
      // Fallback para o localStorage se a API falhar
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const hasPermission = (permission: string) => {
    if (!user) return false;
    return (
      user.permissions.includes(permission) || 
      user.permissions.includes('ADMIN') || 
      user.roleName === 'Administrador'
    );
  };

  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
  };

  return (
    <UserContext.Provider value={{ user, loading, hasPermission, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
