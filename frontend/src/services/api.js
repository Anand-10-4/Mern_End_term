const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('amber_token');
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
  getUsers: () => request('/auth/users'),

  // Batches
  getBatches: (params = '') => request(`/batches${params ? `?${params}` : ''}`),
  getBatchById: (id) => request(`/batches/${id}`),
  createBatch: (data) => request('/batches', { method: 'POST', body: JSON.stringify(data) }),
  reserveBatch: (id, amountKg) => request(`/batches/${id}/reserve`, { method: 'POST', body: JSON.stringify({ amountKg }) }),
  releaseReservation: (id, reservationToken) => request(`/batches/${id}/release-reservation`, { method: 'POST', body: JSON.stringify({ reservationToken }) }),

  // Cupping Lab
  getCuppings: () => request('/cuppings'),
  getLotCuppingHistory: (lotId) => request(`/cuppings/lot/${lotId}`),
  evaluateCupping: (data) => request('/cuppings', { method: 'POST', body: JSON.stringify(data) }),

  // Orders & Escrow
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => request('/orders'),
  getOrderById: (id) => request(`/orders/${id}`),
  updateOrderStatus: (id, status, note) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
  getCertificate: (id) => request(`/orders/certificate/${id}`),

  // Analytics
  getDashboardAnalytics: () => request('/analytics/dashboard'),
};
