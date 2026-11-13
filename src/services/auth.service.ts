import { api } from './api';
import { ApiResponse, User, Role } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
  role?: Role;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  whatsapp?: string;
  career?: string;
  campus?: string;
  avatar?: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
  message?: string;
}

export interface ForgotPasswordPayload {
  email: string;
  role?: Role;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
  role?: Role;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/login', credentials);
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponseData> {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
    return res.data;
  },

  async switchRole(targetRole: Role): Promise<AuthResponseData> {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/switch-role', { targetRole });
    return res.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string; email: string }> {
    const res = await api.post<ApiResponse<{ message: string; email: string }>>('/auth/forgot-password', payload);
    return res.data;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    const res = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', payload);
    return res.data;
  },

  async getProfile(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/profile');
    return res.data;
  },
};
