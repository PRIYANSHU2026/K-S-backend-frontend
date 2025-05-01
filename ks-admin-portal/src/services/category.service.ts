import api from '@/lib/axios';
import type { Category, ApiResponse, Product } from '@/types';

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<ApiResponse<{ categories: Category[] }>>('/categories');
  return response.data.data.categories;
};

// Get a single category by ID
export const getCategory = async (id: string): Promise<Category> => {
  const response = await api.get<ApiResponse<{ category: Category }>>(`/categories/${id}`);
  return response.data.data.category;
};

// Get products by category
export const getCategoryProducts = async (categoryId: string): Promise<Product[]> => {
  const response = await api.get<ApiResponse<{ products: Product[] }>>(`/categories/${categoryId}/products`);
  return response.data.data.products;
};

// Create a new category
export const createCategory = async (
  categoryData: { name: string; description?: string }
): Promise<Category> => {
  const response = await api.post<ApiResponse<{ category: Category }>>('/categories', categoryData);
  return response.data.data.category;
};

// Update an existing category
export const updateCategory = async (
  id: string,
  categoryData: { name?: string; description?: string }
): Promise<Category> => {
  const response = await api.put<ApiResponse<{ category: Category }>>(`/categories/${id}`, categoryData);
  return response.data.data.category;
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<Record<string, never>>>(`/categories/${id}`);
};
