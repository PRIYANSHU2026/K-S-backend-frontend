import api from '@/lib/axios';
import type { Customer, ApiResponse, Warranty, CustomerFormData } from '@/types';

// Get all customers with optional filtering
export const getCustomers = async (
  filters?: { name?: string; email?: string; phone?: string }
): Promise<Customer[]> => {
  const response = await api.get<ApiResponse<{ customers: Customer[] }>>('/customers', {
    params: filters,
  });
  return response.data.data.customers;
};

// Get a single customer by ID
export const getCustomer = async (id: string): Promise<Customer> => {
  const response = await api.get<ApiResponse<{ customer: Customer }>>(`/customers/${id}`);
  return response.data.data.customer;
};

// Get warranties by customer
export const getCustomerWarranties = async (customerId: string): Promise<Warranty[]> => {
  const response = await api.get<ApiResponse<{ warranties: Warranty[] }>>(
    `/customers/${customerId}/warranties`
  );
  return response.data.data.warranties;
};

// Create a new customer
export const createCustomer = async (customerData: CustomerFormData): Promise<Customer> => {
  const response = await api.post<ApiResponse<{ customer: Customer }>>('/customers', customerData);
  return response.data.data.customer;
};

// Update an existing customer
export const updateCustomer = async (
  id: string,
  customerData: Partial<CustomerFormData>
): Promise<Customer> => {
  const response = await api.put<ApiResponse<{ customer: Customer }>>(
    `/customers/${id}`,
    customerData
  );
  return response.data.data.customer;
};

// Delete a customer
export const deleteCustomer = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<Record<string, never>>>(`/customers/${id}`);
};
