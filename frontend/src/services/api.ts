import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { auth } from '../config/firebase';
import { tokenStorage, sanitizeInput } from '../utils/tokenStorage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Configuración de axios con timeouts y headers seguros
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Identificar requests AJAX
  },
  withCredentials: true, // Para cookies httpOnly
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const user = auth.currentUser;

      if (user) {
        // Intentar obtener token de memoria primero
        let token = tokenStorage.getToken();

        // Si no hay token en memoria o necesita refresh, obtener nuevo
        if (!token || tokenStorage.needsRefresh()) {
          token = await user.getIdToken(true); // Force refresh
          tokenStorage.setToken(token);
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Sanitizar datos de entrada
      if (config.data && typeof config.data === 'object') {
        config.data = sanitizeInput(config.data);
      }

      // Agregar timestamp para prevenir cache en requests sensibles
      if (['post', 'put', 'delete'].includes(config.method || '')) {
        config.params = {
          ...config.params,
          _t: Date.now()
        };
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log exitoso para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✓ ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Manejo de errores específicos
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token expirado o inválido
          if (!originalRequest._retry) {
            originalRequest._retry = true;

            try {
              // Intentar refresh del token
              const user = auth.currentUser;
              if (user) {
                const newToken = await user.getIdToken(true);
                tokenStorage.setToken(newToken);

                // Reintentar request original
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                return api(originalRequest);
              }
            } catch (refreshError) {
              // Si falla el refresh, cerrar sesión
              tokenStorage.clearToken();
              await auth.signOut();
              window.location.href = '/login';
            }
          } else {
            // Ya se intentó refresh, redirigir a login
            tokenStorage.clearToken();
            await auth.signOut();
            window.location.href = '/login';
          }
          break;

        case 403:
          // Acceso denegado
          console.error('Access denied:', error.response.data);
          break;

        case 429:
          // Rate limit excedido
          console.warn('Rate limit exceeded. Please try again later.');
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Errores del servidor
          console.error('Server error:', error.response.status);
          break;
      }
    } else if (error.request) {
      // Request hecho pero sin respuesta (problema de red)
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API Endpoints con validación adicional
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

export const entrepreneurAPI = {
  getDashboard: () => api.get('/entrepreneur/dashboard'),
  updateLifecycleForm: (data: any) => api.put('/entrepreneur/lifecycle', data),
  getLifecycleQuestions: () => api.get('/entrepreneur/lifecycle/questions'),
};

export const meetingAPI = {
  getMeetings: (params?: any) => api.get('/meetings', { params }),
  createMeeting: (data: any) => api.post('/meetings', data),
  updateMeeting: (id: string, data: any) => api.put(`/meetings/${id}`, data),
  deleteMeeting: (id: string) => api.delete(`/meetings/${id}`),
  getUpcomingMeetings: () => api.get('/meetings/upcoming'),
  getAvailableEntrepreneurs: () => api.get('/meetings/entrepreneurs'),
};

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId: string) => api.get(`/messages/${userId}`),
  sendMessage: (data: any) => api.post('/messages', data),
  markAsRead: (messageId: string) => api.put(`/messages/${messageId}/read`),
  searchUsers: (query: string) => api.get('/messages/search-users', { params: { query } }),
};

export const documentAPI = {
  getDocuments: (params?: any) => api.get('/documents', { params }),
  uploadDocument: (formData: FormData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000 // 60 segundos para uploads
  }),
  updateDocument: (id: string, data: any) => api.put(`/documents/${id}`, data),
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
  downloadDocument: (id: string) => api.get(`/documents/${id}/download`, {
    responseType: 'blob',
    timeout: 60000 // 60 segundos para descargas
  }),
  getDocumentTypes: () => api.get('/documents/types'),
};

export const reportAPI = {
  getImpactMetrics: (params?: any) => api.get('/reports/impact-metrics', { params }),
  getEntrepreneurDirectory: (params?: any) => api.get('/reports/entrepreneur-directory', { params }),
  generateProgressReport: (params?: any) => api.get('/reports/progress-report', { params }),
  getActivityMetrics: (params?: any) => api.get('/reports/activity-metrics', { params }),
};

export default api;