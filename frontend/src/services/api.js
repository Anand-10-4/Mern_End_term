const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('goldencrust_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Products (Daily Bakes)
  getProducts: (params = '') => request(`/products${params ? `?${params}` : ''}`),
  getProductById: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateStock: (id, stockData) => request(`/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify(stockData) }),
  restockMorning: () => request('/products/morning-restock', { method: 'POST' }),

  // Custom Cake Studio
  calculateCakePrice: (config) => request('/custom-cakes/calculate', { method: 'POST', body: JSON.stringify(config) }),
  saveCustomCake: (data) => request('/custom-cakes', { method: 'POST', body: JSON.stringify(data) }),

  // Orders & Kitchen Pipeline
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => request('/orders/my-orders'),
  getKitchenOrders: (status = '') => request(`/orders/kitchen${status ? `?status=${status}` : ''}`),
  getOrderById: (id) => request(`/orders/${id}`),
  updateOrderStatus: (id, status, note) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),

  // Analytics & Dashboard
  getDashboardAnalytics: () => request('/analytics/dashboard'),

  // Razorpay Payment
  getRazorpayConfig: () => request('/payment/config'),
  createRazorpayOrder: (data) => request('/payment/create-order', { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (data) => request('/payment/verify', { method: 'POST', body: JSON.stringify(data) }),
};
