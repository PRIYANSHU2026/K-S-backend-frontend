import api from '../lib/axios';

// Interface for website content
export interface WebsiteContent {
  id: string;
  section: string;
  title: string;
  content: string;
  metadata?: Record<string, any> | string;
  created_at?: string;
  updated_at?: string;
}

// Get all website content sections
export const getAllContent = async () => {
  const response = await api.get('/content');
  return response.data;
};

// Get content by section identifier
export const getContentBySection = async (section: string) => {
  const response = await api.get(`/content/section/${section}`);
  return response.data;
};

// Get content by ID
export const getContentById = async (id: string) => {
  const response = await api.get(`/content/${id}`);
  return response.data;
};

// Create new content section
export const createContent = async (contentData: Partial<WebsiteContent>) => {
  const response = await api.post('/content', contentData);
  return response.data;
};

// Update content
export const updateContent = async (id: string, contentData: Partial<WebsiteContent>) => {
  const response = await api.put(`/content/${id}`, contentData);
  return response.data;
};

// Delete content
export const deleteContent = async (id: string) => {
  const response = await api.delete(`/content/${id}`);
  return response.data;
};
