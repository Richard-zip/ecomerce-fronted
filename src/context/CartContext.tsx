import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalCount: number;
  currentSellerId: string | null;
  currentSellerName: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'campus_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSeller } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [items]);

  const currentSellerId = items.length > 0 ? items[0].product.sellerId : null;
  const currentSellerName = items.length > 0 ? items[0].product.seller?.name || 'Vendedor' : null;

  const addToCart = (product: Product, quantity = 1): { success: boolean; message?: string } => {
    // Restricciones de vendedor y dueño
    if (isSeller || user?.role === 'VENDEDOR') {
      return {
        success: false,
        message: 'Las cuentas de vendedor no pueden realizar compras ni reservas.',
      };
    }

    if (user && (user.id === product.sellerId || (product.seller && user.id === product.seller.id))) {
      return {
        success: false,
        message: 'No puedes reservar tu propio producto.',
      };
    }

    if (product.stock <= 0) {
      return { success: false, message: 'Este producto está agotado' };
    }

    // Regla de negocio: todos los productos deben ser del mismo vendedor en un pedido
    if (items.length > 0 && items[0].product.sellerId !== product.sellerId) {
      return {
        success: false,
        message: `Tu carrito contiene productos de "${items[0].product.seller?.name || 'otro vendedor'}". Para coordinar la entrega en campus, cada pedido debe ser al mismo vendedor. Vacía tu carrito antes de añadir productos de otro estudiante.`,
      };
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });

    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const clamped = Math.min(item.product.stock, quantity);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalCount,
        currentSellerId,
        currentSellerName,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
};
