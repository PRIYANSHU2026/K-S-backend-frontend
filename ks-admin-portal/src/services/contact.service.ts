import api from '../lib/axios';

// Interface for contact form submission
export interface ContactSubmission {
  id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  subject?: string;
  message: string;
  timestamp: string;
  status: 'new' | 'read' | 'responded' | 'archived';
}

// Get all contact form submissions with pagination
export const getAllContactSubmissions = async (page = 1, limit = 10) => {
  const response = await api.get(`/contact?page=${page}&limit=${limit}`);
  return response.data;
};

// Get contact form submission by ID
export const getContactSubmissionById = async (id: string) => {
  const response = await api.get(`/contact/${id}`);
  return response.data;
};

// Delete contact form submission
export const deleteContactSubmission = async (id: string) => {
  const response = await api.delete(`/contact/${id}`);
  return response.data;
};
