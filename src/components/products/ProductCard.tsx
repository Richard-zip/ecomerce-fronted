import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { ConditionBadge } from '../common/Badge';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCOP } from '../../utils/format';
import {
  MapPin,
  ShoppingBag,
  Check,
  AlertCircle,
  Sparkles,
  Camera,
  Eye,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  showBuyButton?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showBuyButton = true,
}) => {
  const [justAdded, setJustAdded] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { user, isSeller } = useAuth();

  const isOwner = !!user && (user.id === product.sellerId || (product.seller && user.id === product.seller.id));
  const canBuy = showBuyButton && !isSeller && !isOwner;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCartError(null);

    const res = addToCart(product, 1);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    } else {
      setCartError(res.message || 'No se pudo añadir');
      setTimeout(() => setCartError(null), 4000);
    }
  };

  const imageSrc =
    product.images && product.images.length > 0 && product.images[0]
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';

  const isSoldOut = product.stock <= 0 || product.status === 'SOLD_OUT';
  const has360 = product.images && product.images.length > 1;

  return (
    <div className="group bg-[#FFFFFF] rounded-[14px] border border-[#D9E2EC] shadow-sm hover:border-[#102A43]/50 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative">
      {/* Image & Badges Container */}
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden bg-[#F5F7FA] aspect-4/3">
        <img
          src={imageSrc}
          alt={product.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            isSoldOut ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Floating condition badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <ConditionBadge condition={product.condition} />
        </div>

        {/* Category Pill */}
        {product.category && (
          <div className="absolute top-3 right-3 bg-[#102A43]/85 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-0.5 rounded-[8px] z-10">
            {product.category.name}
          </div>
        )}

        {/* Multi-photo badge */}
        {has360 && (
          <div className="absolute bottom-3 left-3 bg-[#102A43]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-[6px] flex items-center gap-1 z-10 border border-white/20 shadow-xs">
            <Camera size={11} className="text-[#D6A84F]" />
            <span>{product.images.length} fotos</span>
          </div>
        )}

        {/* Sold out overlay badge */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-[#102A43]/50 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-[#C53030] text-white font-bold text-xs px-3 py-1.5 rounded-[8px] uppercase tracking-wider shadow-sm">
              Agotado
            </span>
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <Link
            to={`/products/${product.id}`}
            className="font-semibold text-[#1F2933] text-base leading-snug hover:text-[#102A43] transition-colors line-clamp-2"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Campus Meeting Point */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-[#627D98]">
            <MapPin size={13} className="text-[#102A43] shrink-0" />
            <span className="truncate">
              {product.meetingPoint || 'Centro Tutorial Cereté'}
            </span>
          </div>

          {/* Seller Info (sin carrera universitaria) */}
          {product.seller && (
            <Link
              to={`/sellers/${product.seller.id}`}
              className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-[#D9E2EC] group/seller"
            >
              {product.seller.avatar ? (
                <img
                  src={product.seller.avatar}
                  alt={product.seller.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#F0F4F8] text-[#102A43] text-[10px] font-bold flex items-center justify-center">
                  {product.seller.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-[11px] truncate">
                <span className="font-semibold text-[#1F2933] group-hover/seller:text-[#243B53] transition-colors truncate">
                  {product.seller.name}
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Pricing & Stock */}
        <div className="pt-2 border-t border-[#D9E2EC]">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs font-medium text-[#627D98]">Precio (COP)</span>
              <p className="text-xl font-bold text-[#102A43] tracking-tight tabular-nums">
                {formatCOP(product.price)}
              </p>
            </div>

            <div className="text-right">
              {product.stock <= 1 && !isSoldOut ? (
                <span className="text-[11px] font-semibold text-[#8C6517] flex items-center gap-0.5">
                  <Sparkles size={11} className="text-[#D6A84F]" /> ¡Último disponible!
                </span>
              ) : (
                <span className="text-[11px] font-medium text-[#627D98]">
                  {isSoldOut ? 'Sin stock' : `${product.stock} disponibles`}
                </span>
              )}
            </div>
          </div>

          {/* Error banner if different seller */}
          {cartError && (
            <div className="mb-2 p-2 bg-[#FDE8E8] border border-[#C53030]/20 rounded-[8px] text-[11px] text-[#C53030] flex items-start gap-1 leading-tight">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>{cartError}</span>
            </div>
          )}

          {/* Action Buttons: Ver detalle o Reservar según rol y sección */}
          <div className={canBuy ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-1'}>
            <Link
              to={`/products/${product.id}`}
              className="w-full h-9 rounded-[8px] bg-[#FFFFFF] hover:bg-[#F5F7FA] text-[#102A43] border border-[#D9E2EC] font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Eye size={14} />
              <span>Ver Producto</span>
            </Link>

            {canBuy && (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className={`w-full h-9 rounded-[8px] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                  justAdded
                    ? 'bg-[#EAF5EE] text-[#2F855A] border border-[#2F855A]/30'
                    : 'bg-[#102A43] hover:bg-[#243B53] text-white'
                } disabled:opacity-50 disabled:pointer-events-none`}
                title="Añadir a la reserva de campus"
              >
                {justAdded ? (
                  <>
                    <Check size={14} className="text-[#2F855A]" />
                    <span>¡Listo!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    <span>Reservar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
