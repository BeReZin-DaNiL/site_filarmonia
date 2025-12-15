import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (data) => api.post('/auth/register', data);
export const getEvents = (params) => 
  api.get('/events', { params });
export const getEvent = (id) => api.get(`/events/${id}`);
export const createOrder = (data) => api.post('/orders', data);
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const payOrder = (id) => api.put(`/orders/${id}/pay`);
export const getUserOrders = () => api.get('/orders');
export const getProfile = () => api.get('/users/me');
export const updateProfile = (data) => api.put('/users/me', data);

// Favorites
export const getFavorites = () => api.get('/users/favorites');
export const addToFavorites = (eventId) => api.post(`/users/favorites/${eventId}`);
export const removeFromFavorites = (eventId) => api.delete(`/users/favorites/${eventId}`);

// Reviews
export const getEventReviews = (id) => api.get(`/events/${id}/reviews`);
export const addEventReview = (id, data) => api.post(`/events/${id}/reviews`, data);
export const getEventSeats = (id) => api.get(`/events/${id}/seats`);

// Polls
export const getPolls = () => api.get('/polls');
export const votePoll = (id, optionId) => api.post(`/polls/${id}/vote`, { optionId });

// Chat
export const getChatHistory = () => api.get('/chat/history');
export const sendChatMessage = (text) => api.post('/chat/send', { text });

// Admin
export const getAdminEvents = (params) => api.get('/admin/events', { params });
export const createEvent = (data) => api.post('/admin/events', data);
export const updateEvent = (id, data) => api.put(`/admin/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/admin/events/${id}`);
export const getAllOrders = (params) => api.get('/admin/orders', { params });
export const updateAdminOrder = (id, data) => api.put(`/admin/orders/${id}`, data);
export const bulkUpdateOrders = (data) => api.post('/admin/orders/bulk', data);
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const updateAdminUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const bulkUpdateUsers = (data) => api.post('/admin/users/bulk', data);
export const getAuditLogs = () => api.get('/admin/audit-logs');
export const getAdminReports = (params) => api.get('/admin/reports', { params });
export const getDatabaseDump = () => api.get('/admin/db');

export default api;