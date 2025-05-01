import api from '@/lib/axios';
import type { Role, User, ApiResponse, RoleFormData } from '@/types';

// Get all roles
export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get<ApiResponse<{ roles: Role[] }>>('/roles');
  return response.data.data.roles;
};

// Get a single role by ID
export const getRole = async (id: string): Promise<Role> => {
  const response = await api.get<ApiResponse<{ role: Role }>>(`/roles/${id}`);
  return response.data.data.role;
};

// Get users by role
export const getRoleUsers = async (roleId: string): Promise<User[]> => {
  const response = await api.get<ApiResponse<{ users: User[] }>>(`/roles/${roleId}/users`);
  return response.data.data.users;
};

// Get all available permissions
export const getAvailablePermissions = async (): Promise<string[]> => {
  const response = await api.get<ApiResponse<{ permissions: string[] }>>('/roles/permissions/available');
  return response.data.data.permissions;
};

// Create a new role
export const createRole = async (roleData: RoleFormData): Promise<Role> => {
  const response = await api.post<ApiResponse<{ role: Role }>>('/roles', roleData);
  return response.data.data.role;
};

// Update an existing role
export const updateRole = async (id: string, roleData: Partial<RoleFormData>): Promise<Role> => {
  const response = await api.put<ApiResponse<{ role: Role }>>(`/roles/${id}`, roleData);
  return response.data.data.role;
};

// Delete a role
export const deleteRole = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<Record<string, never>>>(`/roles/${id}`);
};
