export type Role = 'CLIENTE' | 'VENDEDOR';

export type ProductStatus = 'AVAILABLE' | 'PAUSED' | 'SOLD_OUT';

export type ProductCondition = 'NUEVO' | 'COMO_NUEVO' | 'USADO_BUENO' | 'USADO_REGULAR';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  whatsapp?: string | null;
  career?: string | null;
  campus?: string | null;
  avatar?: string | null;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  condition: ProductCondition;
  status: ProductStatus;
  meetingPoint?: string | null;
  categoryId: string;
  sellerId: string;
  createdAt: string;
  updatedAt?: string;
  category?: {
    id: string;
    name: string;
    slug?: string;
  };
  seller?: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
    whatsapp?: string | null;
    career?: string | null;
    campus?: string | null;
    avatar?: string | null;
  };
  reviews?: Review[];
  _count?: {
    orderItems?: number;
  };
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: {
    id: string;
    title: string;
    images: string[];
    price?: number;
  };
}

export interface Order {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  totalAmount: number;
  meetingPoint?: string | null;
  notes?: string | null;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  updatedAt?: string;
  buyer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
    career?: string | null;
    campus?: string | null;
    avatar?: string | null;
  };
  seller?: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
    career?: string | null;
    campus?: string | null;
    avatar?: string | null;
  };
  items: OrderItem[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  buyerId: string;
  sellerId: string;
  productId?: string | null;
  createdAt: string;
  buyer?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface SellerPublicProfile {
  id: string;
  name: string;
  career?: string | null;
  campus?: string | null;
  avatar?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  createdAt: string;
  products: Product[];
  reviewsReceived: Review[];
  stats: {
    totalProducts: number;
    totalReviews: number;
    averageRating: number | null;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ProductsBackendResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WhatsAppCheckoutResult {
  whatsappUrl: string;
  message: string;
  seller: {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
    campus: string | null;
    career: string | null;
  };
  product: {
    id: string;
    title: string;
    price: number;
  };
  totalAmount: string;
  quantity: number;
  meetingPoint: string;
}

export type RequestStatus = 'OPEN' | 'RESOLVED' | 'CLOSED';

export interface RequestOffer {
  id: string;
  message: string;
  price?: number | null;
  productId?: string | null;
  requestId: string;
  sellerId: string;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    avatar?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    career?: string | null;
  };
  product?: {
    id: string;
    title: string;
    price: number;
    images: string[];
    status: ProductStatus;
  } | null;
}

export interface StudentRequest {
  id: string;
  title: string;
  description: string;
  maxBudget?: number | null;
  career?: string | null;
  campus?: string | null;
  status: RequestStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    career?: string | null;
    campus?: string | null;
    role?: Role;
    phone?: string | null;
    whatsapp?: string | null;
  };
  offers: RequestOffer[];
  _count?: {
    offers: number;
  };
}

export interface RequestsResponse {
  requests: StudentRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SellerAnalytics {
  totalDeliveredRevenue: number;
  potentialRevenue: number;
  totalOrders: number;
  ordersByStatus: {
    PENDING: number;
    CONFIRMED: number;
    DELIVERED: number;
    CANCELLED: number;
  };
  deliveredRate: number;
  averageOrderValue: number;
  salesByMonth: Array<{
    label: string;
    revenue: number;
    ordersCount: number;
  }>;
  topProducts: Array<{
    id: string;
    title: string;
    images: string[];
    unitsSold: number;
    revenue: number;
    currentStock: number;
    status: ProductStatus;
  }>;
  inventoryHealth: {
    totalProducts: number;
    available: number;
    soldOut: number;
    paused: number;
    totalStockUnits: number;
  };
  reviewsStats: {
    totalReviews: number;
    averageRating: number;
    ratingBreakdown: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
}
