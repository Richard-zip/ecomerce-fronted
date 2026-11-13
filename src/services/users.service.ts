import { api } from './api';
import { ApiResponse, SellerPublicProfile, User } from '../types';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  whatsapp?: string;
  career?: string;
  campus?: string;
  avatar?: string;
}

export interface UploadResult {
  url: string;
  downloadUrl?: string;
  pathname?: string;
  contentType?: string;
}

export const usersService = {
  async getSellerProfile(sellerId: string): Promise<SellerPublicProfile> {
    const res = await api.get<ApiResponse<SellerPublicProfile>>(`/users/sellers/${sellerId}`);
    return res.data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const res = await api.put<ApiResponse<User>>('/users/profile', payload);
    return res.data;
  },

  async uploadSingleImage(file: File, folder = 'products'): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.upload<ApiResponse<UploadResult>>(`/upload/single?folder=${folder}`, formData);
    return res.data;
  },

  async uploadMultipleImages(files: File[], folder = 'products'): Promise<UploadResult[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    const res = await api.upload<ApiResponse<UploadResult[]>>(`/upload/multiple?folder=${folder}`, formData);
    return res.data;
  },
};
