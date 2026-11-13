import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsService } from '../services/products.service';
import { Product } from '../types';
import { ConditionBadge } from '../components/common/Badge';
import { Product360Viewer } from '../components/products/Product360Viewer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCOP, OFFICIAL_CAMPUS } from '../utils/format';
import {
  MapPin,
  ShoppingBag,
  Star,
  Check,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isSeller } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productsService.getProductById(id);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar el producto');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
        <div className="h-4 bg-[#D9E2EC] rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-[#D9E2EC] rounded-[12px]" />
          <div className="space-y-4">
            <div className="h-8 bg-[#D9E2EC] rounded w-3/4" />
            <div className="h-6 bg-[#D9E2EC] rounded w-1/4" />
            <div className="h-24 bg-[#E2E8F0] rounded-[8px]" />
            <div className="h-12 bg-[#D9E2EC] rounded-[8px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] text-center space-y-4 shadow-sm">
        <AlertCircle size={40} className="text-[#C53030] mx-auto" />
        <h3 className="text-xl font-bold text-[#1F2933]">Producto no disponible</h3>
        <p className="text-xs text-[#627D98]">{error || 'El producto no existe o fue retirado.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#102A43] hover:bg-[#243B53] text-white rounded-[8px] text-xs font-semibold shadow-sm transition-colors"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  const isSoldOut = product.stock <= 0 || product.status === 'SOLD_OUT';

  const handleAddToCart = () => {
    setCartError(null);
    const res = addToCart(product, quantity);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } else {
      setCartError(res.message || 'Error al añadir al carrito');
      setTimeout(() => setCartError(null), 5000);
    }
  };

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'];

  const currentDisplayImage = selectedImage || images[0];

  // Calcular promedio de reseñas
  const reviews = product.reviews || [];
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#627D98]">
        <Link to="/" className="hover:text-[#102A43] flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} /> Catálogo
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <span className="text-[#627D98]">{product.category.name}</span>
            <span>/</span>
          </>
        )}
        <span className="text-[#1F2933] font-semibold truncate max-w-[200px] sm:max-w-md">
          {product.title}
        </span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Images Column: Visor de fotos desde diferentes ángulos con Zoom */}
        <div className="lg:col-span-7 space-y-4">
          <Product360Viewer
            images={images}
            title={product.title}
            badge={<ConditionBadge condition={product.condition} />}
            isSoldOut={isSoldOut}
          />

          {/* Detailed Description */}
          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-6 shadow-sm space-y-3 mt-6">
            <h3 className="font-bold text-[#1F2933] text-lg">Descripción del producto</h3>
            <p className="text-sm text-[#1F2933] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>

        {/* Purchase Info & Seller Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-6 shadow-sm space-y-5">
            <div>
              {product.category && (
                <span className="text-xs font-semibold text-[#102A43] uppercase tracking-wider">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-2xl font-bold text-[#1F2933] mt-1 leading-tight">
                {product.title}
              </h1>

              {/* Rating summary */}
              {averageRating && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex text-[#D6A84F]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className={i < Math.round(Number(averageRating)) ? 'fill-[#D6A84F]' : 'text-[#D9E2EC]'}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#1F2933]">{averageRating}</span>
                  <span className="text-xs text-[#627D98]">({reviews.length} reseñas)</span>
                </div>
              )}
            </div>

            {/* Price Tag & Stock */}
            <div className="p-4 bg-[#F5F7FA] rounded-[8px] border border-[#D9E2EC] flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-[#627D98]">Precio oficial (COP)</span>
                <p className="text-3xl font-bold text-[#102A43] tabular-nums">
                  {formatCOP(product.price)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-[#627D98]">Stock</span>
                <p className={`text-sm font-semibold tabular-nums ${product.stock <= 1 ? 'text-[#8C6517]' : 'text-[#2F855A]'}`}>
                  {isSoldOut ? 'Agotado' : `${product.stock} unidades`}
                </p>
              </div>
            </div>

            {/* Meeting Point Box */}
            <div className="p-4 rounded-[8px] bg-[#F5F7FA] border border-[#D9E2EC] space-y-1">
              <div className="flex items-center gap-2 text-[#102A43] text-xs font-semibold">
                <MapPin size={16} className="text-[#102A43]" />
                <span>Punto de recogida oficial:</span>
              </div>
              <p className="text-sm font-semibold text-[#1F2933] pl-6">
                {product.meetingPoint || OFFICIAL_CAMPUS} (Todos los pedidos se recogen en esta sede)
              </p>
            </div>

            {/* Quantity Selector */}
            {!isSoldOut && (
              <div className="flex items-center gap-4">
                <label className="text-xs font-semibold text-[#1F2933]">Cantidad:</label>
                <div className="flex items-center border border-[#D9E2EC] rounded-[8px] overflow-hidden bg-[#FFFFFF]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 bg-[#F5F7FA] hover:bg-[#E2E8F0] text-[#1F2933] disabled:opacity-40 text-sm font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-[#1F2933] min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3 py-1.5 bg-[#F5F7FA] hover:bg-[#E2E8F0] text-[#1F2933] disabled:opacity-40 text-sm font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-bold text-[#102A43] tabular-nums">
                  Total: {formatCOP(product.price * quantity)}
                </span>
              </div>
            )}

            {/* Cart Error Message */}
            {cartError && (
              <div className="p-3 bg-[#FDE8E8] border border-[#C53030]/20 rounded-[8px] text-xs text-[#C53030] flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{cartError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {user && (user.id === product.sellerId || (product.seller && user.id === product.seller.id)) ? (
                <div className="p-3.5 bg-[#F0F4F8] border border-[#D9E2EC] rounded-[8px] text-xs text-[#102A43] font-semibold text-center flex items-center justify-center gap-2">
                  <ShieldCheck size={16} className="text-[#102A43]" />
                  <span>Este es tu producto publicado en el campus. Puedes gestionarlo desde tu Panel de Vendedor.</span>
                </div>
              ) : isSeller ? (
                <div className="p-3.5 bg-[#F0F4F8] border border-[#D9E2EC] rounded-[8px] text-xs text-[#627D98] font-medium text-center">
                  Tu cuenta es de tipo Vendedor. Las reservas de productos son exclusivas para cuentas de estudiantes compradores.
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                  className={`w-full h-11 px-4 font-semibold rounded-[8px] border transition-colors flex items-center justify-center gap-2 shadow-sm ${
                    justAdded
                      ? 'bg-[#EAF5EE] text-[#2F855A] border-[#2F855A]/30'
                      : 'bg-[#102A43] hover:bg-[#243B53] text-white border-[#102A43]'
                  } disabled:opacity-50`}
                >
                  {justAdded ? (
                    <>
                      <Check size={18} className="text-[#2F855A]" />
                      <span>¡Añadido a tus reservas!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Añadir a reservas de campus</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-[#627D98] justify-center">
              <ShieldCheck size={14} className="text-[#2F855A]" />
              <span>Trato seguro cara a cara entre universitarios</span>
            </div>
          </div>

          {/* Seller Profile Card */}
          {product.seller && (
            <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#627D98] uppercase tracking-wider">
                  Estudiante Vendedor
                </span>
                <span className="text-[11px] bg-[#F0F4F8] text-[#102A43] font-semibold px-2.5 py-0.5 rounded-[8px] border border-[#D9E2EC]">
                  Verificado en Campus
                </span>
              </div>

              <div className="flex items-center gap-4">
                {product.seller.avatar ? (
                  <img
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    className="w-14 h-14 rounded-[8px] object-cover border border-[#D9E2EC]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-[8px] bg-[#F0F4F8] text-[#102A43] font-bold text-xl flex items-center justify-center">
                    {product.seller.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-[#1F2933] text-base">
                    {product.seller.name}
                  </h4>
                  {product.seller.campus && (
                    <p className="text-xs text-[#627D98] flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-[#102A43]" />
                      {product.seller.campus}
                    </p>
                  )}
                </div>
              </div>

              <Link
                to={`/sellers/${product.seller.id}`}
                className="block text-center w-full py-2.5 rounded-[8px] bg-[#FFFFFF] hover:bg-[#F5F7FA] border border-[#D9E2EC] text-[#102A43] font-semibold text-xs transition-colors shadow-sm"
              >
                Ver más productos y reputación del vendedor
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1F2933] flex items-center gap-2">
            <Star size={20} className="text-[#D6A84F] fill-[#D6A84F]" />
            <span>Reseñas de compañeros compradores ({reviews.length})</span>
          </h3>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-[8px] bg-[#F5F7FA] border border-[#D9E2EC] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#F0F4F8] text-[#102A43] text-xs font-bold flex items-center justify-center">
                      {rev.buyer?.name ? rev.buyer.name.charAt(0).toUpperCase() : 'E'}
                    </div>
                    <span className="text-xs font-semibold text-[#1F2933]">
                      {rev.buyer?.name || 'Estudiante'}
                    </span>
                  </div>
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
          <div className="py-6 text-center text-[#627D98] text-xs">
            Aún no hay reseñas registradas para este producto. Sé el primero en calificar tras recibirlo.
          </div>
        )}
      </div>

    </div>
  );
};
