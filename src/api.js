import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await api.post('/auth/refresh-token');
        if (refreshResponse.data?.token) {
          const newToken = refreshResponse.data.token;
          localStorage.setItem('token', newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  verifyMfa: (data) => api.post('/auth/verify-mfa', data),
};

// Truck API
export const truckAPI = {
  searchTrucks: (params) => api.get('/trucks', { params }),
  getTruckDetails: (id) => api.get(`/trucks/${id}`),
};

// Booking API
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getUserBookings: () => api.get('/bookings'),
};

// Owner API
export const ownerAPI = {
  getDashboard: () => api.get('/owner/dashboard'),
  addTruck: (data) => api.post('/owner/trucks', data),
  getTrucks: () => api.get('/owner/trucks'),
  getBookings: () => api.get('/owner/bookings'),
  updateBookingStatus: (id, data) => api.put(`/owner/bookings/${id}`, data),
};

// Customer API
export const customerAPI = {
  getDashboard: () => api.get('/customer/dashboard'),
  getBookings: () => api.get('/customer/bookings'),
  updateProfile: (data) => api.put('/customer/profile', data),
  addReview: (data) => api.post('/customer/reviews', data),
  cancelBooking: (id) => api.put(`/customer/bookings/${id}/cancel`),
};

// Stats API
export const statsAPI = {
  getStats: () => api.get('/stats'),
};

export default api;
