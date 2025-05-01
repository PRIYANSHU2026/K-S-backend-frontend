import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/types';
import * as authService from '@/services/auth.service';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          // Get user data from localStorage
          const { user } = authService.getUserData();

          if (user) {
            setUser(user);
            setIsAuthenticated(true);
          } else {
            // If user data is not in localStorage, try to fetch it
            try {
              const userData = await authService.getCurrentUser();
              setUser(userData);
              setIsAuthenticated(true);
            } catch (error) {
              console.error('Failed to get current user:', error);
              authService.clearUserData();
              setIsAuthenticated(false);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.clearUserData();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });

      // Store token and user data
      authService.setUserData(response.data.token, response.data.user);

      // Update state
      setUser(response.data.user);
      setIsAuthenticated(true);

      // Success message
      toast.success('Login successful');
    } catch (error) {
      console.error('Login error:', error);

      // Error message
      toast.error('Login failed. Please check your credentials.');

      // Re-throw the error for the component to handle
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.clearUserData();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
