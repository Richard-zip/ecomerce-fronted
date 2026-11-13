import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersService } from '../services/orders.service';
import { Order } from '../types';
import { OrderStatusBadge } from '../components/common/Badge';
import { ReviewModal } from '../components/orders/ReviewModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { formatCOP, OFFICIAL_CAMPUS, toWhatsAppClean } from '../utils/format';
import {
  PackageCheck,
  MapPin,
  MessageCircle,
  Calendar,
  XCircle,
  Star,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

export const MyPurchasesPage: React.FC = () => {
  const { isAuthenticated, isSeller } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<Order | null>(null);
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    orderId: null,
    isLoading: false,
  });
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ordersService.getBuyerOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar tus pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleOpenCancelModal = (orderId: string) => {
    setActionError(null);
    setCancelModal({
      isOpen: true,
      orderId,
      isLoading: false,
    });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal.orderId) return;

    setCancelModal((prev) => ({ ...prev, isLoading: true }));
    setActionError(null);
    try {
      await ordersService.cancelOrderByBuyer(cancelModal.orderId);
      setCancelModal({ isOpen: false, orderId: null, isLoading: false });
      await fetchOrders();
    } catch (err: any) {
      setActionError(err.message || 'Error al cancelar el pedido');
      setCancelModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  if (isSeller) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] text-center space-y-4 shadow-sm">
        <PackageCheck size={40} className="text-[#102A43] mx-auto" />
        <h3 className="text-xl font-bold text-[#1F2933]">Portal exclusivo de vendedores</h3>
        <p className="text-xs text-[#627D98]">
          Como vendedor, tu cuenta está configurada para gestionar inventario y recibir pedidos de compradores del campus.
        </p>
        <Link
          to="/seller"
          className="inline-block px-5 py-2.5 bg-[#102A43] hover:bg-[#243B53] text-white rounded-[8px] text-xs font-semibold shadow-sm transition-colors"
        >
          Ir al Panel de Vendedor
        </Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] text-center space-y-4 shadow-sm">
        <PackageCheck size={40} className="text-[#102A43] mx-auto" />
        <h3 className="text-xl font-bold text-[#1F2933]">Inicia sesión para ver tus pedidos</h3>
        <p className="text-xs text-[#627D98]">
          Revisa el estado de entrega en campus y califica a tus compañeros vendedores.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 bg-[#102A43] hover:bg-[#243B53] text-white rounded-[8px] text-xs font-semibold shadow-sm transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2933] tracking-tight">
            Mis Pedidos y Compras en Campus
          </h1>
          <p className="text-xs text-[#627D98] mt-0.5">
            Historial de reservas, estado de confirmación y entregas con compañeros.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F5F7FA] border border-[#D9E2EC] rounded-[8px] text-xs font-semibold text-[#102A43] flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#FDE8E8] border border-[#C53030]/20 rounded-[12px] text-xs text-[#C53030] flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-[#D9E2EC] rounded-[12px]" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const sellerPhone = order.seller?.phone;
            const cleanPhone = sellerPhone ? toWhatsAppClean(sellerPhone) : '';

            return (
              <div
                key={order.id}
                className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] shadow-sm p-5 sm:p-6 space-y-4 hover:border-[#102A43]/40 transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9E2EC] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#1F2933] text-sm">
                      Pedido #{order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#627D98]">
                    <Calendar size={13} />
                    <span>{new Date(order.createdAt).toLocaleDateString()} a las {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Seller & Campus Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#F5F7FA] rounded-[8px] border border-[#D9E2EC] space-y-1">
                    <span className="text-[11px] font-semibold text-[#627D98] uppercase">Vendedor</span>
                    <p className="font-bold text-[#1F2933] text-sm">{order.seller?.name || 'Estudiante'}</p>
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${order.seller?.name}! Te escribo sobre mi Pedido #${order.orderNumber} en CampusMarket.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#102A43] hover:text-[#243B53] font-semibold mt-1"
                      >
                        <MessageCircle size={13} /> Chatear por WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="p-3 bg-[#F5F7FA] rounded-[8px] border border-[#D9E2EC] space-y-1">
                    <span className="text-[11px] font-semibold text-[#627D98] uppercase">Lugar de Entrega</span>
                    <p className="font-bold text-[#1F2933] flex items-center gap-1 text-sm">
                      <MapPin size={14} className="text-[#102A43]" />
                      {order.meetingPoint || OFFICIAL_CAMPUS}
                    </p>
                    {order.notes && (
                      <p className="text-[#627D98] italic mt-1">Nota: "{order.notes}"</p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#D9E2EC]">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.product?.images && item.product.images[0]
                              ? item.product.images[0]
                              : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'
                          }
                          alt={item.product?.title || 'Producto'}
                          className="w-12 h-12 rounded-[8px] object-cover border border-[#D9E2EC]"
                        />
                        <div>
                          <p className="text-xs font-semibold text-[#1F2933]">
                            {item.product?.title || 'Producto universitario'}
                          </p>
                          <p className="text-[11px] text-[#627D98]">
                            {item.quantity} x {formatCOP(item.unitPrice)}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#102A43] tabular-nums">
                        {formatCOP(item.quantity * item.unitPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer row: Total & Actions */}
                <div className="pt-3 border-t border-[#D9E2EC] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-[#627D98]">Total a pagar:</span>
                    <span className="text-xl font-bold text-[#102A43] tabular-nums">
                      {formatCOP(order.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Cancel button if pending */}
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleOpenCancelModal(order.id)}
                        className="px-3.5 py-2 rounded-[8px] bg-[#FDE8E8] hover:bg-[#F8B4B4] text-[#C53030] font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle size={14} />
                        <span>Cancelar Pedido</span>
                      </button>
                    )}

                    {/* Review seller button if delivered or confirmed */}
                    {(order.status === 'DELIVERED' || order.status === 'CONFIRMED') && order.seller && (
                      <button
                        onClick={() => setSelectedReviewOrder(order)}
                        className="px-3.5 py-2 rounded-[8px] bg-[#FFFFFF] hover:bg-[#F5F7FA] text-[#102A43] border border-[#D9E2EC] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Star size={14} className="fill-[#D6A84F] text-[#D6A84F]" />
                        Calificar Vendedor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-[#F5F7FA] text-[#102A43] rounded-[8px] flex items-center justify-center mx-auto border border-[#D9E2EC]">
            <ShoppingBag size={28} />
          </div>
          <h3 className="text-base font-bold text-[#1F2933]">Aún no has realizado pedidos</h3>
          <p className="text-xs text-[#627D98]">
            Explora libros, calculadoras y útiles en el campus para crear tu primera reserva.
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-[#102A43] hover:bg-[#243B53] text-white rounded-[8px] text-xs font-semibold shadow-sm transition-colors"
          >
            Ir al catálogo
          </Link>
        </div>
      )}

      {/* Review Modal */}
      {selectedReviewOrder && selectedReviewOrder.seller && (
        <ReviewModal
          isOpen={!!selectedReviewOrder}
          onClose={() => setSelectedReviewOrder(null)}
          sellerId={selectedReviewOrder.sellerId}
          sellerName={selectedReviewOrder.seller?.name || 'Vendedor'}
          productId={selectedReviewOrder.items[0]?.productId}
          productTitle={selectedReviewOrder.items[0]?.product?.title}
          onSuccess={fetchOrders}
        />
      )}

      {/* Styled Cancellation Confirm Modal */}
      <ConfirmModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, orderId: null, isLoading: false })}
        onConfirm={handleConfirmCancel}
        title="¿Cancelar este pedido?"
        message="Al cancelar este pedido, los productos volverán inmediatamente al stock disponible del vendedor para otros estudiantes de la sede."
        confirmText="Sí, cancelar pedido"
        cancelText="Conservar pedido"
        type="danger"
        isLoading={cancelModal.isLoading}
      />
    </div>
  );
};
