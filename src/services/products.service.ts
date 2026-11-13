import { api } from './api';
import {
  ApiResponse,
  Product,
  ProductsResponse,
  ProductsBackendResponse,
  ProductCondition,
  ProductStatus,
  WhatsAppCheckoutResult,
} from '../types';

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductPayload {
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  condition: ProductCondition;
  meetingPoint?: string;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  status?: ProductStatus;
}

export interface WhatsAppCheckoutParams {
  quantity?: number;
  meetingPoint?: string;
  clientName?: string;
  notes?: string;
}

export const productsService = {
  async getProducts(params?: ProductQueryParams): Promise<ProductsResponse> {
    const res = await api.get<ProductsBackendResponse>('/products', params);
    const products = Array.isArray(res.data) ? res.data : [];
    const pagination = res.pagination || {
      total: products.length,
      page: 1,
      limit: 12,
      totalPages: 1,
    };
    return {
      products,
      pagination,
    };
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
      return res.data;
    } catch {
      const fallback = await api.get<ApiResponse<Product>>(`/products/detail/${id}`);
      return fallback.data;
    }
  },

  async getWhatsAppCheckout(id: string, options?: WhatsAppCheckoutParams): Promise<WhatsAppCheckoutResult> {
    const res = await api.post<ApiResponse<WhatsAppCheckoutResult>>(`/products/${id}/whatsapp-checkout`, options);
    return res.data;
  },

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const res = await api.post<ApiResponse<Product>>('/products', payload);
    return res.data;
  },

  async getMyProducts(): Promise<Product[]> {
    const res = await api.get<ApiResponse<Product[]>>('/products/my/products');
    return res.data;
  },

  async updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
    const res = await api.put<ApiResponse<Product>>(`/products/${id}`, payload);
    return res.data;
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    const res = await api.delete<ApiResponse<null>>(`/products/${id}`);
    return { message: res.message || 'Producto eliminado exitosamente' };
  },
};
