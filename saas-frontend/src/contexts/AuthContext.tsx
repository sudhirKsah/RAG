import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

interface UserProfile {
  id: string;
  email: string;
  company_name?: string;
  phone?: string;
  website?: string;
  description?: string;
  created_at?: string;
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
  refreshProfile: () => Promise<void>;
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
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setProfile(parsedUser);
          
          // Refresh profile data from server
          await refreshProfile();
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const refreshProfile = async () => {
    try {
      const response = await api.getProfile();
      if (response.ok) {
        const result = await response.json();
        const updatedUser = result.data.user;
        setUser(updatedUser);
        setProfile(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const signUp = async (email: string, password: string, companyName: string) => {
    try {
      const response = await api.register({ email, password, company_name: companyName });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Sign up failed');
      }

      toast.success('Account created successfully! Please sign in.');
    } catch (error: any) {
      toast.error(error.message || 'Error during sign up');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

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
      const response = await api.updateProfile(updates);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      const updatedUser = result.data.user;
      setProfile(updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, 
        signUp, 
        signIn, 
        signOut, 
        profile, 
        updateProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};