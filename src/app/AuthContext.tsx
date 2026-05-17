'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  authenticate,
  saveUserToStorage,
  getUserFromStorage,
  clearUserFromStorage,
  hasPermission as checkPermission,
} from './auth.lib';
import { User, UserRole, AuthContextType } from './auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = getUserFromStorage();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authenticate(username, password);
      saveUserToStorage(authenticatedUser);
      setUser(authenticatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearUserFromStorage();
    setUser(null);
  };

  const hasPermission = (requiredRoles: UserRole | UserRole[]) => {
    if (!user) return false;
    return checkPermission(user.role, requiredRoles);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn: user !== null,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
