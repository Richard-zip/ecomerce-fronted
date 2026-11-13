import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/orders.service';
import { usersService } from '../services/users.service';
import { formatCOP, OFFICIAL_CAMPUS, toWhatsAppClean } from '../utils/format';
import {
  ShoppingBag,
  Trash2,
  MapPin,
  FileText,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  LogIn,
  MessageCircle,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
    currentSellerName,
  } = useCart();

  const { isAuthenticated, isSeller, user } = useAuth();
  const navigate = useNavigate();

  const [meetingPoint, setMeetingPoint] = useState(
    items.length > 0 && items[0].product.meetingPoint ? items[0].product.meetingPoint : OFFICIAL_CAMPUS
  );
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderCreatedNumber, setOrderCreatedNumber] = useState<number | null>(null);
  const [sellerContactPhone, setSellerContactPhone] = useState<string>('');
  const [confirmedOrderWhatsAppUrl, setConfirmedOrderWhatsAppUrl] = useState<string | null>(null);

  // Precargar el número telefónico del vendedor de los productos en el carrito
  useEffect(() => {
    if (items.length > 0) {
      const firstItem = items[0];
      const directPhone = firstItem.product?.seller?.whatsapp || firstItem.product?.seller?.phone;
      if (directPhone) {
        setSellerContactPhone(directPhone);
      } else if (firstItem.product?.sellerId) {
        usersService
          .getSellerProfile(firstItem.product.sellerId)
          .then((profile) => {
            const p = profile.whatsapp || profile.phone;
            if (p) setSellerContactPhone(p);
          })
          .catch(() => {});
      }
    }
  }, [items]);

  // Acción al presionar "Iniciar Sesión para Reservar": enviar mensaje al vendedor por WhatsApp y redirigir
  const handleLoginAndReserve = async (e: React.MouseEvent) => {
    e.preventDefault();

    let phoneToUse = sellerContactPhone;
    if (!phoneToUse && items.length > 0) {
      phoneToUse = items[0].product?.seller?.whatsapp || items[0].product?.seller?.phone || '';
      if (!phoneToUse && items[0].product?.sellerId) {
        try {
          const profile = await usersService.getSellerProfile(items[0].product.sellerId);
          phoneToUse = profile.whatsapp || profile.phone || '';
        } catch (err) {
          console.warn('No se pudo obtener el perfil del vendedor para WhatsApp:', err);
        }
      }
    }

    const sellerName = currentSellerName || items[0]?.product?.seller?.name || 'Compañero';
    const productLines = items
      .map(
        (it) =>
          `• ${it.quantity}x ${it.product.title} - ${formatCOP(it.product.price)} c/u (Subtotal: ${formatCOP(it.product.price * it.quantity)})`
      )
      .join('\n');

    const messageLines = [
      `¡Hola ${sellerName}! 👋`,
      ``,
      `Te escribo desde CampusMarket (Centro Tutorial Cereté). Tengo los siguientes productos en mi carrito y voy a iniciar sesión para formalizar la reserva:`,
      ``,
      `📦 *Detalles de los productos:*`,
      productLines,
      ``,
      `💰 *Total a pagar al recibir:* ${formatCOP(totalAmount)}`,
      `📍 *Punto de recogida:* ${meetingPoint.trim() || OFFICIAL_CAMPUS}`,
      notes.trim() ? `📝 *Notas / Horario:* ${notes.trim()}` : null,
      ``,
      `¿Tienes disponibilidad para la entrega en el campus? ¡Quedo atento!`,
    ];

    const message = messageLines.filter(Boolean).join('\n');
    const cleanPhone = phoneToUse ? toWhatsAppClean(phoneToUse) : '';

    if (cleanPhone) {
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    navigate('/login');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (items.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        meetingPoint: meetingPoint.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const order = await ordersService.createOrder(payload);
      setOrderCreatedNumber(order.orderNumber);

      // Notificar al vendedor por WhatsApp con el número oficial de orden
      let phoneToUse = sellerContactPhone;
      if (!phoneToUse && items[0]?.product?.sellerId) {
        try {
          const profile = await usersService.getSellerProfile(items[0].product.sellerId);
          phoneToUse = profile.whatsapp || profile.phone || '';
        } catch {}
      }

      const cleanPhone = phoneToUse ? toWhatsAppClean(phoneToUse) : '';
      if (cleanPhone) {
        const sellerName = currentSellerName || items[0]?.product?.seller?.name || 'Compañero';
        const productLines = items
          .map(
            (it) =>
              `• ${it.quantity}x ${it.product.title} (${formatCOP(it.product.price * it.quantity)})`
          )
          .join('\n');

        const orderMsg = [
          `¡Hola ${sellerName}! 👋`,
          ``,
          `Acabo de confirmar el *Pedido #${order.orderNumber}* en CampusMarket (Centro Tutorial Cereté):`,
          ``,
          `📦 *Productos:*`,
          productLines,
          ``,
          `💰 *Total a pagar al recibir:* ${formatCOP(totalAmount)}`,
          `📍 *Punto de recogida:* ${meetingPoint.trim() || OFFICIAL_CAMPUS}`,
          notes.trim() ? `📝 *Nota:* ${notes.trim()}` : null,
          user?.name ? `👤 *Comprador:* ${user.name}` : null,
          ``,
          `¿En qué horario podemos encontrarnos en el campus para la entrega?`,
        ]
          .filter(Boolean)
          .join('\n');

        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(orderMsg)}`;
        setConfirmedOrderWhatsAppUrl(waUrl);
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }

      clearCart();
    } catch (err: any) {
      setError(
        err.message ||
          'No se pudo procesar la orden. Asegúrate de tener rol CLIENTE (los vendedores no pueden comprar sus propios productos).'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSeller) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-[#F5F7FA] text-[#102A43] rounded-[8px] flex items-center justify-center mx-auto border border-[#D9E2EC]">
          <ShoppingBag size={28} />
        </div>
        <h3 className="text-xl font-bold text-[#1F2933]">Carrito no disponible para vendedores</h3>
        <p className="text-xs text-[#627D98] leading-relaxed">
          Las cuentas con rol de vendedor no pueden realizar pedidos ni utilizar el carrito de compras. Para comprar productos en el campus, utiliza una cuenta de estudiante comprador.
        </p>
        <div className="pt-2">
          <Link
            to="/seller"
            className="inline-block px-5 py-2.5 bg-[#102A43] hover:bg-[#243B53] text-white rounded-[8px] text-xs font-semibold shadow-sm transition-colors"
          >
            Ir al Panel de Vendedor
          </Link>
        </div>
      </div>
    );
  }

  if (orderCreatedNumber !== null) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] shadow-sm text-center space-y-5">
        <div className="w-14 h-14 bg-[#EAF5EE] text-[#2F855A] rounded-[8px] flex items-center justify-center mx-auto">
          <CheckCircle size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1F2933]">¡Pedido #{orderCreatedNumber} Creado!</h2>
          <p className="text-xs text-[#627D98] mt-2 leading-relaxed">
            Se ha descontado el stock y notificado la reserva a tu compañero vendedor. Podrás ver el estado en tu panel de compras.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          {confirmedOrderWhatsAppUrl && (
            <a
              href={confirmedOrderWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#102A43] hover:bg-[#243B53] text-white rounded-[8px] text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <MessageCircle size={15} />
              <span>Notificar al vendedor por WhatsApp</span>
            </a>
          )}
          <Link
            to="/orders"
            className="px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#F5F7FA] border border-[#D9E2EC] text-[#102A43] rounded-[8px] text-xs font-semibold shadow-sm transition-colors"
          >
            Ver mis pedidos y compras
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#F5F7FA] border border-[#D9E2EC] text-[#102A43] rounded-[8px] text-xs font-semibold shadow-sm transition-colors"
          >
            Seguir explorando
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-[#F5F7FA] text-[#627D98] rounded-[8px] flex items-center justify-center mx-auto border border-[#D9E2EC]">
          <ShoppingBag size={28} />
        </div>
        <h3 className="text-lg font-bold text-[#1F2933]">Tu carrito está vacío</h3>
        <p className="text-xs text-[#627D98]">
          Explora los productos de tus compañeros universitarios y reserva tus materiales académicos.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-[#102A43] hover:bg-[#243B53] text-white text-xs font-semibold rounded-[8px] shadow-sm transition-colors"
        >
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2933] tracking-tight">
            Reserva de Pedido en Campus
          </h1>
          <p className="text-xs text-[#627D98] mt-0.5">
            Artículos solicitados al vendedor estudiante:{' '}
            <span className="font-semibold text-[#1F2933]">{currentSellerName}</span>
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-[#C53030] hover:text-[#9B2C2C] font-semibold flex items-center gap-1 p-2 rounded-[8px] hover:bg-[#FDE8E8] transition-colors"
        >
          <Trash2 size={14} /> Vaciar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] shadow-sm overflow-hidden divide-y divide-[#D9E2EC]">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="p-4 sm:p-5 flex items-center gap-4">
                <img
                  src={
                    product.images && product.images[0]
                      ? product.images[0]
                      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200'
                  }
                  alt={product.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-[8px] object-cover border border-[#D9E2EC] shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${product.id}`}
                    className="font-semibold text-[#1F2933] text-sm hover:text-[#102A43] transition-colors truncate block"
                  >
                    {product.title}
                  </Link>

                  <p className="text-xs text-[#627D98] mt-0.5">
                    Precio unitario: {formatCOP(product.price)}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-[#D9E2EC] rounded-[8px] overflow-hidden bg-[#FFFFFF]">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-2.5 py-1 text-xs font-bold text-[#627D98] hover:bg-[#F5F7FA] transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-[#1F2933]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="px-2.5 py-1 text-xs font-bold text-[#627D98] hover:bg-[#F5F7FA] disabled:opacity-30 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-xs text-[#C53030] hover:text-[#9B2C2C] font-medium"
                    >
                      Quitar
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-medium text-[#627D98] block">Subtotal</span>
                  <span className="text-base font-bold text-[#102A43] tabular-nums">
                    {formatCOP(product.price * quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order coordination & confirmation form */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleCheckout}
            className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-6 shadow-sm space-y-5"
          >
            <h3 className="text-base font-bold text-[#1F2933]">
              Punto de Recogida: Centro Tutorial Cereté 📍
            </h3>

            {error && (
              <div className="p-3 bg-[#FDE8E8] border border-[#C53030]/20 rounded-[8px] text-xs text-[#C53030] flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Meeting Point */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1 flex items-center gap-1">
                <MapPin size={13} className="text-[#102A43]" />
                Lugar de recogida dentro del Centro Tutorial Cereté
              </label>
              <input
                type="text"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                placeholder="Centro Tutorial Cereté - Cafetería, Biblioteca, Portería..."
                className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-xs text-[#1F2933] placeholder-[#627D98] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
                required
              />
              <span className="text-[10px] text-[#627D98] mt-1 block">
                * Todos los pedidos de la plataforma se entregan y recogen exclusivamente en el Centro Tutorial Cereté.
              </span>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1 flex items-center gap-1">
                <FileText size={13} className="text-[#627D98]" />
                Notas para el vendedor (horarios de clase / detalles)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Salgo de clase a las 4:00 pm, nos vemos en la cafetería."
                className="w-full p-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-xs text-[#1F2933] placeholder-[#627D98] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] resize-none"
              />
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-[#F5F7FA] rounded-[8px] border border-[#D9E2EC] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#627D98]">
                <span>Total de productos:</span>
                <span className="font-semibold text-[#1F2933]">{items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#627D98]">
                <span>Comisión por servicio:</span>
                <span className="text-[#2F855A] font-semibold">Gratis ($ 0 COP)</span>
              </div>
              <div className="border-t border-[#D9E2EC] pt-2 flex items-center justify-between">
                <span className="font-bold text-[#1F2933] text-sm">Total a pagar al recibir:</span>
                <span className="font-bold text-2xl text-[#102A43] tabular-nums">
                  {formatCOP(totalAmount)}
                </span>
              </div>
            </div>

            {/* Authentication warning or checkout button */}
            {!isAuthenticated ? (
              <div className="space-y-2">
                <div className="p-3 bg-[#FBF5EA] border border-[#D6A84F]/40 rounded-[8px] text-xs text-[#8C6517] flex items-start gap-2">
                  <LogIn size={15} className="shrink-0 mt-0.5" />
                  <span>
                    Al pulsar el botón se enviará un mensaje al vendedor por WhatsApp con los datos de tu pedido y podrás iniciar sesión para formalizar la reserva.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLoginAndReserve}
                  className="w-full h-11 bg-[#102A43] hover:bg-[#243B53] text-white font-semibold text-xs rounded-[8px] flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>Iniciar Sesión para Reservar</span>
                </button>
              </div>
            ) : user?.role === 'VENDEDOR' && user.id === items[0].product.sellerId ? (
              <div className="p-3 bg-[#FDE8E8] border border-[#C53030]/20 rounded-[8px] text-xs text-[#C53030]">
                No puedes ordenar tus propios productos. Debes iniciar sesión con una cuenta de comprador.
              </div>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 px-4 bg-[#102A43] hover:bg-[#243B53] text-white font-semibold rounded-[8px] shadow-sm transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <span>{isLoading ? 'Confirmando pedido...' : 'Confirmar Reserva en Campus'}</span>
                <ArrowRight size={16} />
              </button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#627D98]">
              <ShieldCheck size={14} className="text-[#2F855A]" />
              <span>Pago en efectivo, Nequi o Daviplata al recibir en el Centro Tutorial Cereté</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
