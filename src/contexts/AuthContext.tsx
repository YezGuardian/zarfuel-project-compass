
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

// Types for our authentication context
type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
};

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS: User[] = [
  { id: '1', email: 'admin@zarfuel.com', name: 'Admin User', role: 'admin' },
  { id: '2', email: 'viewer@zarfuel.com', name: 'Viewer User', role: 'viewer' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for saved user in local storage
    const savedUser = localStorage.getItem('zarfuelUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user in mock data (in a real app, this would be an API call)
    const foundUser = MOCK_USERS.find(user => user.email === email);
    
    if (foundUser && password === 'password') { // In a real app, compare hashed passwords
      setUser(foundUser);
      localStorage.setItem('zarfuelUser', JSON.stringify(foundUser));
      toast.success(`Welcome back, ${foundUser.name}`);
    } else {
      toast.error('Invalid email or password');
      throw new Error('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('zarfuelUser');
    toast.info('You have been logged out');
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
