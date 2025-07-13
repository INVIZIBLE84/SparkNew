import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Auth API
export const authAPI = {
  register: async (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    department: string;
    rollNumber?: string;
    year?: number;
  }): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  login: async (emailOrUsername: string, password: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/login', { emailOrUsername, password });
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  refreshToken: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

// User API
export const userAPI = {
  getAllUsers: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};

// Attendance API
export const attendanceAPI = {
  getAttendance: async (filters?: any): Promise<ApiResponse> => {
    const response = await apiClient.get('/attendance', { params: filters });
    return response.data;
  },

  markAttendance: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/attendance/mark', data);
    return response.data;
  },

  getAttendanceReport: async (filters?: any): Promise<ApiResponse> => {
    const response = await apiClient.get('/attendance/report', { params: filters });
    return response.data;
  },
};

// Fee API
export const feeAPI = {
  getFees: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/fees');
    return response.data;
  },

  payFee: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/fees/pay', data);
    return response.data;
  },

  getFeeHistory: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/fees/history');
    return response.data;
  },
};

// Clearance API
export const clearanceAPI = {
  getClearanceStatus: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/clearance');
    return response.data;
  },

  requestClearance: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/clearance/request', data);
    return response.data;
  },

  approveClearance: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await apiClient.put(`/clearance/${id}/approve`, data);
    return response.data;
  },
};

// Notification API
export const notificationAPI = {
  getNotifications: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  sendNotification: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/notifications/send', data);
    return response.data;
  },
};

// Document API
export const documentAPI = {
  getDocuments: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/documents');
    return response.data;
  },

  uploadDocument: async (formData: FormData): Promise<ApiResponse> => {
    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadDocument: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },

  getAttendanceStats: async (filters?: any): Promise<ApiResponse> => {
    const response = await apiClient.get('/analytics/attendance', { params: filters });
    return response.data;
  },

  getFeeStats: async (filters?: any): Promise<ApiResponse> => {
    const response = await apiClient.get('/analytics/fees', { params: filters });
    return response.data;
  },
};

export default apiClient; 