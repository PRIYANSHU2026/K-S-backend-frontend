// Auth & User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role | string;
  role_id?: string;
  role_name?: string;
  last_login?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Product & Category Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category_id: string;
  category_name?: string;
  features?: string[];
  specifications?: Record<string, string>;
  in_stock: boolean;
  sku?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Customer & Warranty Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Warranty {
  id: string;
  product_id: string;
  customer_id: string;
  purchase_date: string;
  expiry_date: string;
  warranty_details?: string;
  status: 'active' | 'expired' | 'claimed';
  created_at?: string;
  updated_at?: string;
  product_name?: string;
  customer_name?: string;
  customer_email?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
  error?: string;
}

// Form Types (for components)
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  features: string;
  specifications: string;
  in_stock: boolean;
  sku: string;
  images?: File[];
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export interface WarrantyFormData {
  product_id: string;
  customer_id: string;
  purchase_date: string;
  expiry_date: string;
  warranty_details: string;
  status: 'active' | 'expired' | 'claimed';
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  role_id: string;
  avatar?: File;
}

export interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  activeWarranties: number;
  expiringWarranties: number;
}
