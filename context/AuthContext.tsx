import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { secureStorage } from '@/services/secureStorage';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check for both user data AND auth token
      const storedUser = await secureStorage.getUserData();
      const authToken = await secureStorage.getAuthToken();
      
      if (storedUser && authToken) {
        setUser(JSON.parse(storedUser));
      } else {
        // If either is missing, clear both to ensure clean state
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to load auth state", e);
      setUser(null);
    } finally {
      setLoading(false);
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

      // Mock token - replace with real token from API
      const mockToken = 'mock_auth_token_' + Date.now();

      // Store both user data AND token
      await secureStorage.setUserData(JSON.stringify(mockUser));
      await secureStorage.setAuthToken(mockToken);
      
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

      // Mock token - replace with real token from API
      const mockToken = 'mock_auth_token_' + Date.now();

      // Store both user data AND token
      await secureStorage.setUserData(JSON.stringify(mockUser));
      await secureStorage.setAuthToken(mockToken);
      
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
        loading,
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