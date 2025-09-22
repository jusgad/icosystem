import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateDocument: (id: string, data: any) => api.put(`/documents/${id}`, data),
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
  downloadDocument: (id: string) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  getDocumentTypes: () => api.get('/documents/types'),
};

export default api;