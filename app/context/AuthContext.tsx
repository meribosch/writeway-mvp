'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/database.types';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../utils/auth';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const { user, error } = await loginUser(username, password);
    
    if (user) {
      setUser(user);
      return { success: true, error: null };
    }
    
    return { success: false, error: error || 'Login failed' };
  };

  const register = async (username: string, password: string) => {
    const { user, error } = await registerUser(username, password);
    
    if (user) {
      setUser(user);
      return { success: true, error: null };
    }
    
    return { success: false, error: error || 'Registration failed' };
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 