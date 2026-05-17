export type UserRole = 'admin' | 'guru' | 'murid';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
}
