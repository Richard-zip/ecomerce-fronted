import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersService } from '../services/users.service';
import { SellerPublicProfile } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { ConditionBadge } from '../components/common/Badge';
import { OFFICIAL_CAMPUS, toWhatsAppClean, formatCOP } from '../utils/format';
import {
  GraduationCap,
  MapPin,
  Star,
  Package,
  ArrowLeft,
  Calendar,
  AlertCircle,
  MessageCircle,
  LayoutGrid,
  List,
  Eye,
  Sparkles,
} from 'lucide-react';

export const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<SellerPublicProfile | null>(null);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchSeller = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await usersService.getSellerProfile(id);
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar el perfil del vendedor');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeller();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
        <div className="h-44 bg-[#D9E2EC] rounded-[12px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-[#D9E2EC] rounded-[12px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] text-center space-y-4 shadow-sm">
        <AlertCircle size={40} className="text-[#C53030] mx-auto" />
        <h3 className="text-lg font-bold text-[#1F2933]">Vendedor no encontrado</h3>
        <p className="text-xs text-[#627D98]">{error || 'El estudiante no existe o no tiene rol de vendedor.'}</p>
        <Link to="/" className="inline-block px-4 py-2 bg-[#102A43] hover:bg-[#243B53] text-white rounded-[8px] text-xs font-semibold shadow-sm transition-colors">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const phoneOrWhatsapp = profile.whatsapp || profile.phone;
  const cleanNumber = phoneOrWhatsapp ? toWhatsAppClean(phoneOrWhatsapp) : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#627D98] hover:text-[#102A43] transition-colors">
        <ArrowLeft size={14} /> Volver al catálogo
      </Link>

      {/* Seller Header Profile Card */}
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-[8px] object-cover border border-[#D9E2EC]"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[8px] bg-[#F0F4F8] text-[#102A43] font-bold text-3xl flex items-center justify-center border border-[#D9E2EC]">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#1F2933]">{profile.name}</h1>
                <span className="bg-[#F0F4F8] text-[#102A43] text-[11px] font-semibold px-2.5 py-0.5 rounded-[8px] border border-[#D9E2EC]">
                  Vendedor de Campus
                </span>
              </div>

              <p className="text-xs text-[#627D98] flex items-center gap-1">
                <MapPin size={13} className="text-[#102A43]" />
                {profile.campus || OFFICIAL_CAMPUS}
              </p>
            </div>
          </div>

          {/* Action buttons (WhatsApp direct contact) */}
          {cleanNumber && (
            <a
              href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(`¡Hola ${profile.name}! Vi tus productos en CampusMarket y me gustaría consultar sobre ellos.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-[8px] bg-[#102A43] hover:bg-[#243B53] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <MessageCircle size={17} />
              <span>Contactar por WhatsApp</span>
            </a>
          )}
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#D9E2EC]">
          <div className="p-3 bg-[#F5F7FA] rounded-[8px] border border-[#D9E2EC] text-center">
            <span className="text-[11px] font-medium text-[#627D98] block">Productos Disponibles</span>
            <span className="text-2xl font-bold text-[#102A43] tabular-nums">{profile.stats.totalProducts}</span>
          </div>

          <div className="p-3 bg-[#F5F7FA] rounded-[8px] border border-[#D9E2EC] text-center">
            <span className="text-[11px] font-medium text-[#627D98] block">Calificación Promedio</span>
            <span className="text-2xl font-bold text-[#102A43] flex items-center justify-center gap-1">
              <Star size={20} className="fill-[#D6A84F] text-[#D6A84F]" />
              <span className="tabular-nums">{profile.stats.averageRating ? profile.stats.averageRating.toFixed(1) : '-'}</span>
            </span>
          </div>

          <div className="p-3 bg-[#F5F7FA] rounded-[8px] border border-[#D9E2EC] text-center">
            <span className="text-[11px] font-medium text-[#627D98] block">Reseñas de Compradores</span>
            <span className="text-2xl font-bold text-[#102A43] tabular-nums">{profile.stats.totalReviews}</span>
          </div>
        </div>
      </div>

      {/* Seller Products Section: En forma de lista o tarjetas (Solo exhibición, sin compra directa) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9E2EC] pb-3">
          <h2 className="text-xl font-bold text-[#1F2933] flex items-center gap-2">
            <Package size={20} className="text-[#102A43]" />
            <span>Productos de {profile.name} ({(profile.products || []).length})</span>
          </h2>

          <div className="flex items-center gap-1 p-1 bg-[#F0F4F8] rounded-[8px] border border-[#D9E2EC]">
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewLayout === 'grid'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-[#627D98] hover:text-[#102A43]'
              }`}
              title="Vista en tarjetas (Grid)"
            >
              <LayoutGrid size={14} />
              <span>Tarjetas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('list')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewLayout === 'list'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-[#627D98] hover:text-[#102A43]'
              }`}
              title="Vista en lista"
            >
              <List size={14} />
              <span>Lista</span>
            </button>
          </div>
        </div>

        {(profile.products || []).length > 0 ? (
          viewLayout === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {profile.products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  showBuyButton={false}
                  product={{
                    ...prod,
                    seller: {
                      id: profile.id,
                      name: profile.name,
                      career: profile.career,
                      campus: profile.campus,
                      avatar: profile.avatar,
                    },
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {profile.products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-4 shadow-sm hover:border-[#102A43]/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-20 h-20 rounded-[8px] overflow-hidden bg-[#F5F7FA] border border-[#D9E2EC] shrink-0">
                      <img
                        src={prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300'}
                        alt={prod.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <ConditionBadge condition={prod.condition} />
                        {prod.category && (
                          <span className="text-[11px] font-semibold text-[#102A43] bg-[#F0F4F8] px-2 py-0.5 rounded-[4px]">
                            {prod.category.name}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-[#1F2933] text-sm truncate">{prod.title}</h4>
                      <p className="text-xs text-[#627D98] line-clamp-1">{prod.description}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D9E2EC]">
                    <div className="text-left sm:text-right">
                      <span className="text-base font-bold text-[#102A43] tabular-nums block">
                        {formatCOP(prod.price)}
                      </span>
                      <span className="text-[11px] text-[#627D98] block">
                        {prod.stock <= 0 ? 'Agotado' : `${prod.stock} disp.`}
                      </span>
                    </div>

                    <Link
                      to={`/products/${prod.id}`}
                      className="h-8 px-4 bg-[#FFFFFF] hover:bg-[#F5F7FA] text-[#102A43] border border-[#D9E2EC] font-semibold text-xs rounded-[6px] shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <Eye size={13} />
                      <span>Ver Producto</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="p-8 text-center bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] text-[#627D98] text-xs shadow-sm">
            Este vendedor actualmente no tiene productos en venta.
          </div>
        )}
      </div>

      {/* Seller Reviews Received */}
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-[#1F2933] flex items-center gap-2">
          <Star size={18} className="text-[#D6A84F] fill-[#D6A84F]" />
          <span>Historial de valoraciones recibidas ({(profile.reviewsReceived || []).length})</span>
        </h3>

        {(profile.reviewsReceived || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.reviewsReceived.map((rev) => (
              <div key={rev.id} className="p-4 bg-[#F5F7FA] rounded-[8px] border border-[#D9E2EC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1F2933]">
                    {rev.buyer?.name || 'Estudiante'}
                  </span>
                  <div className="flex text-[#D6A84F]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < rev.rating ? 'fill-[#D6A84F]' : 'text-[#D9E2EC]'}
                      />
                    ))}
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-xs text-[#1F2933] italic">"{rev.comment}"</p>
                )}
                <span className="text-[10px] text-[#627D98] block">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#627D98] py-4">
            Este vendedor aún no ha recibido reseñas de otros estudiantes.
          </p>
        )}
      </div>
    </div>
  );
};
