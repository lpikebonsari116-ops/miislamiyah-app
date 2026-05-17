import { User, UserRole } from './auth.types';
import { supabase } from '@/utils/supabase';

const AUTH_STORAGE_KEY = 'sukma_auth_user';
const USERS_STORAGE_KEY = 'sukma_custom_users';

interface CustomUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email?: string;
}

function getCustomUsers(): CustomUser[] {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  } catch (error) {
    console.error('Failed to get custom users:', error);
    return [];
  }
}

function saveCustomUsers(users: CustomUser[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  } catch (error) {
    console.error('Failed to save custom users:', error);
  }
}

export function addCustomUser(user: CustomUser): void {
  const users = getCustomUsers();
  users.push(user);
  saveCustomUsers(users);
}

export function updateCustomUser(id: string, userData: Partial<CustomUser>): void {
  const users = getCustomUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...userData };
    saveCustomUsers(users);
  }
}

export function deleteCustomUser(id: string): void {
  const users = getCustomUsers();
  saveCustomUsers(users.filter(u => u.id !== id));
}

export function getAllUsers(): CustomUser[] {
  const defaultUsers = [
    { id: '1', username: 'admin', password: 'admin123', role: 'admin' as UserRole, name: 'Administrator Utama' },
    { id: '2', username: 'guru', password: 'guru123', role: 'guru' as UserRole, name: 'Guru Pengajar' },
    { id: '3', username: 'murid', password: 'murid123', role: 'murid' as UserRole, name: 'Siswa MI' },
  ];
  return [...defaultUsers, ...getCustomUsers()];
}

export async function authenticate(
  username: string,
  password: string
): Promise<User> {
  const allUsers = getAllUsers();

  const foundUser = allUsers.find(
    (u) => u.username === username.toLowerCase() && u.password === password
  );

  if (!foundUser) {
    // Fallback search in Supabase for convenience (optional)
    if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username.toLowerCase())
          .single();

        if (!error && data && data.password === password) {
          return {
            id: data.id,
            username: data.username,
            role: data.role as UserRole,
            name: data.nama_lengkap || data.name,
            email: data.email,
          };
        }
      } catch (e) {
        console.warn('Supabase auth fallback failed');
      }
    }
    
    throw new Error('Username atau Password salah');
  }

  return {
    id: foundUser.id,
    username: foundUser.username,
    role: foundUser.role,
    name: foundUser.name,
    email: foundUser.email,
  };
}

export function saveUserToStorage(user: User): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Failed to save user to storage:', error);
  }
}

export function getUserFromStorage(): User | null {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  } catch (error) {
    console.error('Failed to get user from storage:', error);
    return null;
  }
}

export function clearUserFromStorage(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to clear user from storage:', error);
  }
}

export function hasPermission(
  userRole: UserRole,
  requiredRoles: UserRole | UserRole[]
): boolean {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  // Admin has access to everything
  if (userRole === 'admin') {
    return true;
  }

  return roles.includes(userRole);
}

export const roleHierarchy: Record<UserRole, number> = {
  admin: 3,
  guru: 2,
  murid: 1,
};

export function canPerformAction(
  userRole: UserRole,
  action: 'view' | 'create' | 'edit' | 'delete'
): boolean {
  switch (userRole) {
    case 'admin':
      return true; // Admin bisa semua
    case 'guru':
      return action !== 'view'; // Guru bisa create, edit, delete
    case 'murid':
      return action === 'view'; // Murid hanya bisa view
    default:
      return false;
  }
}
