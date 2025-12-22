import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { secureStorage } from '@/services/secureStorage';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean; // Managed state for app startup
  signIn: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  verifyMPIN: (mpin: string) => Promise<boolean>;
  setMPIN: (mpin: string) => Promise<void>;
  hasMPIN: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 1. Start as true

  // 2. Load user data on app mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = await secureStorage.getUserData();
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to load auth state", e);
    } finally {
      setLoading(false); // 3. Set to false only after checking storage
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      if (!identifier.trim() || !password.trim()) {
        return { success: false, error: 'Please enter credentials' };
      }

      // Replace this with your actual API call later
      const mockUser: User = {
        id: '123',
        full_name: 'John Doe',
        email: identifier,
        profile_image: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await secureStorage.setUserData(JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'An error occurred during sign in' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      if (!email.trim() || !password.trim() || !fullName.trim()) {
        return { success: false, error: 'Please fill all fields' };
      }

      const mockUser: User = {
        id: '123',
        full_name: fullName,
        email,
        profile_image: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await secureStorage.setUserData(JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'An error occurred during sign up' };
    }
  };

  const signOut = async () => {
    await secureStorage.clearAll();
    setUser(null);
  };

  const verifyMPIN = async (mpin: string): Promise<boolean> => {
    const storedMPIN = await secureStorage.getMPIN();
    return storedMPIN === mpin;
  };

  const setMPIN = async (mpin: string) => {
    await secureStorage.setMPIN(mpin);
  };

  const hasMPIN = async (): Promise<boolean> => {
    const mpin = await secureStorage.getMPIN();
    return mpin !== null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading, // This will now correctly reflect the loading state
        signIn,
        signUp,
        signOut,
        verifyMPIN,
        setMPIN,
        hasMPIN,
        isAuthenticated: !!user,
      }}
    >
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