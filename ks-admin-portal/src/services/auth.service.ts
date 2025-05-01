import api from '@/lib/axios';
import type { AuthResponse, LoginCredentials, User } from '@/types';

// Login function
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

// Get the currently logged in user
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data.data.user;
};

// Change password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await api.put('/auth/change-password', { currentPassword, newPassword });
};

// Store user data in localStorage
export const setUserData = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Get user data from localStorage
export const getUserData = (): { token: string | null; user: User | null } => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (!userJson) {
    return { token, user: null };
  }

  try {
    const user = JSON.parse(userJson) as User;
    return { token, user };
  } catch (error) {
    return { token, user: null };
  }
};

// Clear user data from localStorage (logout)
export const clearUserData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const { token } = getUserData();
  return !!token;
};

// Check if user has a specific permission
export const hasPermission = (permission: string): boolean => {
  const { user } = getUserData();

  if (!user || !user.role) {
    return false;
  }

  // If user is a super admin (has 'all' permission), return true
  if (typeof user.role === 'object' && user.role.permissions.includes('all')) {
    return true;
  }

  // Otherwise, check for specific permission
  if (typeof user.role === 'object') {
    return user.role.permissions.includes(permission);
  }

  return false;
};
