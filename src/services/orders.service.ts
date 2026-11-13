import { api } from './api';
import { ApiResponse, Order, OrderStatus, Review } from '../types';

export interface CreateOrderPayload {
  items: {
    productId: string;
    quantity: number;
  }[];
  meetingPoint?: string;
  notes?: string;
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
  productId?: string;
  sellerId: string;
}

export const ordersService = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await api.post<ApiResponse<Order>>('/orders', payload);
    return res.data;
  },

  async getBuyerOrders(): Promise<Order[]> {
    const res = await api.get<ApiResponse<Order[]>>('/orders/my/purchases');
    return res.data;
  },

  async cancelOrderByBuyer(orderId: string): Promise<Order> {
    const res = await api.patch<ApiResponse<Order>>(`/orders/${orderId}/cancel`);
    return res.data;
  },

  async getSellerOrders(): Promise<Order[]> {
    const res = await api.get<ApiResponse<Order[]>>('/orders/my/sales');
    return res.data;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const res = await api.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, { status });
    return res.data;
  },

  async getOrderById(orderId: string): Promise<Order> {
    const res = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return res.data;
  },

  async createReview(payload: CreateReviewPayload): Promise<Review> {
    const res = await api.post<ApiResponse<Review>>('/orders/reviews', payload);
    return res.data;
  },
};
