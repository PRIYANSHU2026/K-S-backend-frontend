import api from '@/lib/axios';
import type { Product, ApiResponse, ProductFormData } from '@/types';

// Get all products with optional filtering
export const getProducts = async (
  filters?: { name?: string; category_id?: string; in_stock?: boolean }
): Promise<Product[]> => {
  const response = await api.get<ApiResponse<{ products: Product[] }>>('/products', {
    params: filters,
  });
  return response.data.data.products;
};

// Get a single product by ID
export const getProduct = async (id: string): Promise<Product> => {
  const response = await api.get<ApiResponse<{ product: Product }>>(`/products/${id}`);
  return response.data.data.product;
};

// Create a new product
export const createProduct = async (productData: ProductFormData): Promise<Product> => {
  // Create form data for file uploads
  const formData = new FormData();

  // Add text fields
  formData.append('name', productData.name);
  formData.append('description', productData.description);
  formData.append('price', productData.price.toString());
  formData.append('category_id', productData.category_id);
  formData.append('features', productData.features);
  formData.append('specifications', productData.specifications);
  formData.append('in_stock', productData.in_stock ? 'true' : 'false');

  if (productData.sku) {
    formData.append('sku', productData.sku);
  }

  // Add image files
  if (productData.images && productData.images.length > 0) {
    for (const image of productData.images) {
      formData.append('images', image);
    }
  }

  const response = await api.post<ApiResponse<{ product: Product }>>('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.product;
};

// Update an existing product
export const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<Product> => {
  // Create form data for file uploads
  const formData = new FormData();

  // Add text fields (only if they exist)
  if (productData.name !== undefined) {
    formData.append('name', productData.name);
  }

  if (productData.description !== undefined) {
    formData.append('description', productData.description);
  }

  if (productData.price !== undefined) {
    formData.append('price', productData.price.toString());
  }

  if (productData.category_id !== undefined) {
    formData.append('category_id', productData.category_id);
  }

  if (productData.features !== undefined) {
    formData.append('features', productData.features);
  }

  if (productData.specifications !== undefined) {
    formData.append('specifications', productData.specifications);
  }

  if (productData.in_stock !== undefined) {
    formData.append('in_stock', productData.in_stock ? 'true' : 'false');
  }

  if (productData.sku !== undefined) {
    formData.append('sku', productData.sku);
  }

  // Add image files
  if (productData.images && productData.images.length > 0) {
    for (const image of productData.images) {
      formData.append('images', image);
    }
  }

  const response = await api.put<ApiResponse<{ product: Product }>>(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.product;
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<Record<string, never>>>(`/products/${id}`);
};
