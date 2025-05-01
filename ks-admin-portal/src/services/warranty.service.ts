import api from '@/lib/axios';
import type { Warranty, ApiResponse, WarrantyFormData } from '@/types';

// Get all warranties with optional filtering
export const getWarranties = async (
  filters?: { product_id?: string; customer_id?: string; status?: string; search?: string }
): Promise<Warranty[]> => {
  const response = await api.get<ApiResponse<{ warranties: Warranty[] }>>('/warranties', {
    params: filters,
  });
  return response.data.data.warranties;
};

// Get expiring warranties
export const getExpiringWarranties = async (days = 30): Promise<Warranty[]> => {
  const response = await api.get<ApiResponse<{ warranties: Warranty[] }>>('/warranties/expiring', {
    params: { days },
  });
  return response.data.data.warranties;
};

// Update all warranty statuses (mark expired)
export const updateWarrantyStatuses = async (): Promise<void> => {
  await api.put<ApiResponse<Record<string, never>>>('/warranties/update-statuses');
};

// Get a single warranty by ID
export const getWarranty = async (id: string): Promise<Warranty> => {
  const response = await api.get<ApiResponse<{ warranty: Warranty }>>(`/warranties/${id}`);
  return response.data.data.warranty;
};

// Create a new warranty
export const createWarranty = async (warrantyData: WarrantyFormData): Promise<Warranty> => {
  const response = await api.post<ApiResponse<{ warranty: Warranty }>>('/warranties', warrantyData);
  return response.data.data.warranty;
};

// Update an existing warranty
export const updateWarranty = async (
  id: string,
  warrantyData: Partial<WarrantyFormData>
): Promise<Warranty> => {
  const response = await api.put<ApiResponse<{ warranty: Warranty }>>(
    `/warranties/${id}`,
    warrantyData
  );
  return response.data.data.warranty;
};

// Delete a warranty
export const deleteWarranty = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<Record<string, never>>>(`/warranties/${id}`);
};
