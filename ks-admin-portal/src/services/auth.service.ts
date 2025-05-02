import api from '@/lib/axios';
import type { AuthResponse, LoginCredentials, User } from '@/types';

// Login function with better error handling
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // Additional validation before sending request
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    console.log('Submitting login request');
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    console.log('Login response received:', response.status);

    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data;
  } catch (error: any) {
    console.error('Login error in service:', error);

    // Add more context to the error
    if (error.response) {
      // Server responded with non-2xx status
      const errorMessage = error.response.data?.message || 'Unknown server error';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your network connection.');
    }

    // Re-throw the original error if it's not an Axios error
    throw error;
  }
};

// Get the currently logged in user
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get('/auth/me');

    if (!response.data || !response.data.data || !response.data.data.user) {
      throw new Error('Invalid user data received from server');
    }

    return response.data.data.user;
  } catch (error: any) {
    console.error('Get current user error:', error);
    throw new Error(error.message || 'Failed to get user data');
  }
};

// Change password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  } catch (error: any) {
    console.error('Change password error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to change password');
  }
};

// Store user data in localStorage
export const setUserData = (token: string, user: User): void => {
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
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
    console.error('Error parsing user data:', error);
    // Clear corrupt data
    localStorage.removeItem('user');
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
  if (typeof user.role === 'object' && user.role.permissions && user.role.permissions.includes('all')) {
    return true;
  }

  // Otherwise, check for specific permission
  if (typeof user.role === 'object' && user.role.permissions) {
    return user.role.permissions.includes(permission);
  }

  return false;
};
