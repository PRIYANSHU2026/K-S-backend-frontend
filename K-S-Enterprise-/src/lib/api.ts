// API helper for K-S-Enterprise frontend
// This allows us to handle API requests consistently

// Base URL is determined by environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Fetches data from the API
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `Server responded with status: ${response.status}` }));
      throw new Error(error.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
}

/**
 * Fetches content from the API based on section name
 */
export async function fetchContent(section: string) {
  try {
    const data = await fetchAPI(`/content/section/${section}`);
    return data.success && data.data ? data.data : null;
  } catch (error) {
    console.error(`Failed to fetch content for section ${section}:`, error);
    return null;
  }
}

/**
 * Submits the contact form to the API
 */
export async function submitContactForm(formData: any) {
  return fetchAPI('/contact', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

/**
 * Fetches products based on filters
 */
export async function fetchProducts(filters: { category?: string, subcategory?: string, id?: string } = {}) {
  const params = new URLSearchParams();

  if (filters.id) params.append('id', filters.id);
  if (filters.category) params.append('category', filters.category);
  if (filters.subcategory) params.append('subcategory', filters.subcategory);

  const queryString = params.toString() ? `?${params.toString()}` : '';

  try {
    const data = await fetchAPI(`/catalog${queryString}`);
    return {
      products: data.products || [],
      product: data.product || null,
    };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return { products: [], product: null };
  }
}
