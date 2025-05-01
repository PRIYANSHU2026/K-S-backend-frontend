import api from '@/lib/axios';
import type { User, ApiResponse, UserFormData } from '@/types';

// Get all users with optional filtering
export const getUsers = async (
  filters?: { name?: string; email?: string; role_id?: string }
): Promise<User[]> => {
  const response = await api.get<ApiResponse<{ users: User[] }>>('/users', {
    params: filters,
  });
  return response.data.data.users;
};

// Get a single user by ID
export const getUser = async (id: string): Promise<User> => {
  const response = await api.get<ApiResponse<{ user: User }>>(`/users/${id}`);
  return response.data.data.user;
};

// Create a new user
export const createUser = async (userData: UserFormData): Promise<User> => {
  // Create form data for avatar upload
  const formData = new FormData();

  // Add text fields
  formData.append('name', userData.name);
  formData.append('email', userData.email);
  formData.append('password', userData.password);
  formData.append('role_id', userData.role_id);

  // Add avatar file if it exists
  if (userData.avatar) {
    formData.append('avatar', userData.avatar);
  }

  const response = await api.post<ApiResponse<{ user: User }>>('/users', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.user;
};

// Update an existing user
export const updateUser = async (id: string, userData: Partial<UserFormData>): Promise<User> => {
  // Create form data for avatar upload
  const formData = new FormData();

  // Add text fields (only if they exist)
  if (userData.name !== undefined) {
    formData.append('name', userData.name);
  }

  if (userData.email !== undefined) {
    formData.append('email', userData.email);
  }

  if (userData.password !== undefined) {
    formData.append('password', userData.password);
  }

  if (userData.role_id !== undefined) {
    formData.append('role_id', userData.role_id);
  }

  // Add avatar file if it exists
  if (userData.avatar) {
    formData.append('avatar', userData.avatar);
  }

  const response = await api.put<ApiResponse<{ user: User }>>(`/users/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.user;
};

// Delete a user
export const deleteUser = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<Record<string, never>>>(`/users/${id}`);
};
