import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

interface UserProfile {
  id: string;
  email: string;
  company_name?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, companyName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      setProfile(JSON.parse(userData));
    }

    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, companyName: string) => {
    try {
      const response = await api.register({ email, password, company_name: companyName });
      if (!response.ok) throw new Error('Sign up failed');

      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error during sign up');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      const result = await response.json();
  
      if (!response.ok) throw new Error(result.message || 'Login failed');
  
      const { user, token } = result.data;
  
      // Save token and user info to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
  
      setUser(user);
      setProfile(user);
  
      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error during login');
      throw error;
    }
  };
  

  const signOut = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setProfile(null);
      toast.success('Signed out successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error during sign out');
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updated = { ...profile, ...updates };
      setProfile(updated);
      localStorage.setItem('user', JSON.stringify(updated));

      toast.success('Profile updated!');
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut, profile, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
