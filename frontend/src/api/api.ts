import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base URL for backend API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// Axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // for cookie-based auth if needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every request if present
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle global response errors (optional: can be extended)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Optionally log errors here
    // console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ------------------- Auth API -------------------

/**
 * Get current authenticated user.
 * Throws if not authenticated.
 */
export async function getCurrentUser(): Promise<{
  id: string;
  username: string;
  email: string;
}> {
  const res = await apiClient.get('/auth/me');
  return res.data;
}

/**
 * Logout current user.
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('jwt_token');
}

// ------------------- Notification Preferences API -------------------

/**
 * Get notification preferences for a user.
 * @param userId User ID
 */
export async function getNotificationPreferences(
  userId: string
): Promise<{ [eventType: string]: boolean }> {
  const res = await apiClient.get(`/notification-preferences/${userId}`);
  return res.data.preferences;
}

/**
 * Update notification preferences for a user.
 * @param userId User ID
 * @param preferences Preferences object
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: { [eventType: string]: boolean }
): Promise<void> {
  await apiClient.put(`/notification-preferences/${userId}`, { preferences });
}

// ------------------- Products API -------------------

/**
 * Get all products.
 */
export async function getProducts(): Promise<
  Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    createdAt?: string;
    updatedAt?: string;
  }>
> {
  const res = await apiClient.get('/products');
  return res.data.products;
}

/**
 * Create a new product.
 * @param product Product data
 */
export async function createProduct(product: {
  name: string;
  description: string;
  price: number;
}): Promise<void> {
  await apiClient.post('/products', product);
}

/**
 * Update an existing product.
 * @param productId Product ID
 * @param product Product data
 */
export async function updateProduct(
  productId: string,
  product: {
    name: string;
    description: string;
    price: number;
  }
): Promise<void> {
  await apiClient.put(`/products/${productId}`, product);
}

/**
 * Delete a product.
 * @param productId Product ID
 */
export async function deleteProduct(productId: string): Promise<void> {
  await apiClient.delete(`/products/${productId}`);
}