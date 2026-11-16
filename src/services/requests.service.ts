import { api } from './api';
import { ApiResponse, StudentRequest, RequestOffer, RequestStatus } from '../types';

export interface GetRequestsParams {
  status?: RequestStatus;
  career?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  maxBudget?: number | null;
  career?: string | null;
  campus?: string | null;
}

export interface CreateOfferPayload {
  message: string;
  price?: number | null;
  productId?: string | null;
}

export const requestsService = {
  async getRequests(params?: GetRequestsParams): Promise<{
    requests: StudentRequest[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const res = await api.get<{
      success: boolean;
      data: StudentRequest[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>('/requests', { params });
    return {
      requests: res.data || [],
      pagination: res.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 },
    };
  },

  async getRequestById(id: string): Promise<StudentRequest> {
    const res = await api.get<ApiResponse<StudentRequest>>(`/requests/detail/${id}`);
    return res.data;
  },

  async getMyRequests(): Promise<StudentRequest[]> {
    const res = await api.get<ApiResponse<StudentRequest[]>>('/requests/my/list');
    return res.data;
  },

  async createRequest(payload: CreateRequestPayload): Promise<StudentRequest> {
    const res = await api.post<ApiResponse<StudentRequest>>('/requests', payload);
    return res.data;
  },

  async updateStatus(id: string, status: RequestStatus): Promise<StudentRequest> {
    const res = await api.patch<ApiResponse<StudentRequest>>(`/requests/${id}/status`, { status });
    return res.data;
  },

  async deleteRequest(id: string): Promise<{ message: string }> {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/requests/${id}`);
    return res.data;
  },

  async createOffer(requestId: string, payload: CreateOfferPayload): Promise<RequestOffer> {
    const res = await api.post<ApiResponse<RequestOffer>>(`/requests/${requestId}/offers`, payload);
    return res.data;
  },

  async deleteOffer(offerId: string): Promise<{ message: string }> {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/requests/offers/${offerId}`);
    return res.data;
  },
};
