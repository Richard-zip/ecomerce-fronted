import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsService } from '../services/products.service';
import { ordersService } from '../services/orders.service';
import { categoriesService } from '../services/categories.service';
import { usersService } from '../services/users.service';
import { Product, Order, Category, ProductCondition, OrderStatus, SellerAnalytics } from '../types';
import { ConditionBadge, OrderStatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Product360Viewer } from '../components/products/Product360Viewer';
import { formatCOP, parseCOP, formatCOPInput, OFFICIAL_CAMPUS, toWhatsAppClean } from '../utils/format';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Truck,
  Upload,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Clock,
  LayoutDashboard,
  CheckCircle,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Eye,
  LayoutGrid,
  List,
  Store,
  BarChart3,
  TrendingUp,
  Award,
  Star,
  Printer,
  PieChart,
  Coins,
  Percent,
} from 'lucide-react';

export const SellerDashboardPage: React.FC = () => {
  const { user, isSeller, switchRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isActivatingSeller, setIsActivatingSeller] = useState(false);

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics'>('products');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal create/edit product state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields for product
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState<ProductCondition>('NUEVO');
  const [meetingPoint, setMeetingPoint] = useState(OFFICIAL_CAMPUS);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [prods, ords, cats, anlyt] = await Promise.all([
        productsService.getMyProducts(),
        ordersService.getSellerOrders(),
        categoriesService.getCategories(),
        ordersService.getSellerAnalytics().catch((e) => {
          console.warn('Error fetching analytics:', e);
          return null;
        }),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setOrders(Array.isArray(ords) ? ords : []);
      setCategories(Array.isArray(cats) ? cats : []);
      if (anlyt) setAnalytics(anlyt);
      if (Array.isArray(cats) && cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar el panel de vendedor');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (isSeller) {
      loadDashboardData();
    }
  }, [isSeller, loadDashboardData]);

  // Confirm modal and feedback
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    productId: null,
    isLoading: false,
  });
  const [statusFeedback, setStatusFeedback] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [showPreview360, setShowPreview360] = useState(false);

  // Conversión y redimensión de imagen para 360°
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error('Error al decodificar la imagen'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  };

  // Manejar subida múltiple de imágenes (Visión 360° desde diferentes ángulos)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setIsUploading(true);
    setFormError(null);
    try {
      const newImages: string[] = [];
      for (const file of files) {
        try {
          const uploadRes = await usersService.uploadSingleImage(file, 'products');
          newImages.push(uploadRes.url);
        } catch {
          const base64 = await convertFileToBase64(file);
          newImages.push(base64);
        }
      }
      setUploadedImages((prev) => [...prev, ...newImages]);
    } catch {
      setFormError('Hubo un inconveniente al procesar las imágenes del ordenador.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrl.trim()) {
      setUploadedImages((prev) => [...prev, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= uploadedImages.length) return;
    setUploadedImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setStock('1');
    setCondition('NUEVO');
    setMeetingPoint(OFFICIAL_CAMPUS);
    setUploadedImages([]);
    setImageUrl('');
    setShowPreview360(false);
    setFormError(null);
    if (categories.length > 0) setCategoryId(categories[0].id);
    setIsProductModalOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('action') === 'new' || searchParams.get('new') === '1') {
      openCreateModal();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setDescription(p.description);
    setPrice(formatCOPInput(String(Math.round(p.price))));
    setStock(String(p.stock));
    setCategoryId(p.categoryId);
    setCondition(p.condition);
    setMeetingPoint(p.meetingPoint || OFFICIAL_CAMPUS);
    setUploadedImages(p.images || []);
    setImageUrl('');
    setShowPreview360(false);
    setFormError(null);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const finalImages = [...uploadedImages];
    if (imageUrl.trim()) finalImages.push(imageUrl.trim());

    if (finalImages.length === 0) {
      setFormError('Debes subir o agregar al menos una imagen para el producto.');
      return;
    }

    const numericPrice = parseCOP(price);
    if (numericPrice <= 0) {
      setFormError('Por favor ingresa un precio válido en pesos colombianos (COP).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await productsService.updateProduct(editingProduct.id, {
          title: title.trim(),
          description: description.trim(),
          price: numericPrice,
          stock: Number(stock),
          categoryId,
          condition,
          meetingPoint: meetingPoint.trim() || OFFICIAL_CAMPUS,
          images: finalImages,
        });
      } else {
        await productsService.createProduct({
          title: title.trim(),
          description: description.trim(),
          price: numericPrice,
          stock: Number(stock),
          categoryId,
          condition,
          meetingPoint: meetingPoint.trim() || OFFICIAL_CAMPUS,
          images: finalImages,
        });
      }

      setIsProductModalOpen(false);
      setStatusFeedback({
        message: editingProduct ? '¡Producto actualizado correctamente!' : '¡Producto publicado con éxito en el campus!',
        type: 'success',
      });
      setTimeout(() => setStatusFeedback(null), 4000);
      try {
        await loadDashboardData();
      } catch (loadErr) {
        console.warn('Error al recargar el panel de vendedor:', loadErr);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (id: string) => {
    setDeleteModal({
      isOpen: true,
      productId: id,
      isLoading: false,
    });
  };

  const handleConfirmDeleteProduct = async () => {
    if (!deleteModal.productId) return;
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await productsService.deleteProduct(deleteModal.productId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteModal.productId));
      setDeleteModal({ isOpen: false, productId: null, isLoading: false });
      setStatusFeedback({
        message: 'Producto eliminado definitivamente del catálogo.',
        type: 'success',
      });
      setTimeout(() => setStatusFeedback(null), 4000);
    } catch (err: any) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      setStatusFeedback({
        message: err.message || 'Error al eliminar el producto',
        type: 'error',
      });
      setTimeout(() => setStatusFeedback(null), 4000);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
      await loadDashboardData();
      setStatusFeedback({
        message: 'Estado del pedido actualizado correctamente.',
        type: 'success',
      });
      setTimeout(() => setStatusFeedback(null), 3500);
    } catch (err: any) {
      setStatusFeedback({
        message: err.message || 'Error al actualizar el estado del pedido',
        type: 'error',
      });
      setTimeout(() => setStatusFeedback(null), 4000);
    }
  };

  if (!isSeller) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-[#F5F7FA]">
        <div className="max-w-md w-full bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-8 text-center space-y-5 shadow-sm">
          <div className="w-12 h-12 rounded-[8px] bg-[#102A43] text-[#D6A84F] flex items-center justify-center mx-auto shadow-xs">
            <Store size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#102A43]">Acceso a Panel de Vendedor</h3>
            <span className="text-[11px] font-bold text-[#8C6517] bg-[#FBF5EA] border border-[#D6A84F] px-2.5 py-0.5 rounded-[6px] inline-block mt-1">
              Cuenta actual: Estudiante Comprador
            </span>
          </div>
          <p className="text-xs text-[#627D98] leading-relaxed">
            Tu cuenta estudiantil está registrada actualmente como <strong>Comprador</strong>. Para poder publicar artículos y coordinar ventas en el Centro Tutorial Cereté, puedes activar el rol de <strong>Vendedor</strong> en tu cuenta.
          </p>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={async () => {
                setIsActivatingSeller(true);
                try {
                  await switchRole('VENDEDOR');
                } catch (err) {
                  console.error('Error switching to vendor:', err);
                } finally {
                  setIsActivatingSeller(false);
                }
              }}
              disabled={isActivatingSeller}
              className="w-full h-11 bg-[#102A43] hover:bg-[#243B53] text-white font-semibold text-xs rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Store size={15} className="text-[#D6A84F]" />
              <span>{isActivatingSeller ? 'Activando rol vendedor...' : 'Cambiar mi cuenta a Modo Vendedor'}</span>
            </button>

            <Link
              to="/"
              className="w-full h-10 bg-transparent hover:bg-[#F0F4F8] text-[#627D98] hover:text-[#102A43] font-medium text-xs rounded-[8px] transition-colors border border-[#D9E2EC] flex items-center justify-center"
            >
              Regresar al catálogo estudiantil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Cálculos de métricas destacadas
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'DELIVERED').length;

  return (
    <div className="min-h-[85vh] bg-[#F5F7FA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Layout en Escritorio: Barra lateral azul marino de ancho fijo (#102A43) y área principal */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* BARRA LATERAL AZUL MARINO DE ANCHO FIJO (w-64) */}
          <aside className="w-full md:w-64 shrink-0 bg-[#102A43] text-white rounded-[12px] p-5 shadow-sm border border-[#243B53] space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutDashboard size={18} className="text-[#D6A84F]" />
                <h2 className="font-bold text-base text-white">Panel Vendedor</h2>
              </div>
              <p className="text-xs text-[#9FB3C8] truncate">{OFFICIAL_CAMPUS}</p>
              <div className="mt-3 pt-3 border-t border-[#243B53] text-xs">
                <span className="text-[#9FB3C8] block text-[11px]">Usuario:</span>
                <span className="font-semibold text-white truncate block">{user?.name}</span>
              </div>
            </div>

            {/* Navegación: Resalta la sección activa con superficie azul secundaria (#243B53) y marca dorada discreta (#D6A84F) */}
            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full text-left px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-all flex items-center justify-between ${
                  activeTab === 'products'
                    ? 'bg-[#243B53] text-[#FFFFFF] shadow-sm ring-1 ring-[#D6A84F]/30'
                    : 'text-[#D9E2EC] hover:bg-[#243B53]/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package size={16} className={activeTab === 'products' ? 'text-[#D6A84F]' : 'text-[#9FB3C8]'} />
                  <span>Mis Productos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeTab === 'products' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D6A84F]" aria-hidden="true" />
                  )}
                  <span className="text-[10px] bg-[#102A43] px-2 py-0.5 rounded-[6px] border border-[#334E68]">
                    {products.length}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-all flex items-center justify-between ${
                  activeTab === 'orders'
                    ? 'bg-[#243B53] text-[#FFFFFF] shadow-sm ring-1 ring-[#D6A84F]/30'
                    : 'text-[#D9E2EC] hover:bg-[#243B53]/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck size={16} className={activeTab === 'orders' ? 'text-[#D6A84F]' : 'text-[#9FB3C8]'} />
                  <span>Pedidos Recibidos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeTab === 'orders' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D6A84F]" aria-hidden="true" />
                  )}
                  {pendingOrdersCount > 0 ? (
                    <span className="text-[10px] bg-[#D6A84F] text-[#102A43] font-bold px-1.5 py-0.5 rounded-[6px]">
                      {pendingOrdersCount}
                    </span>
                  ) : (
                    <span className="text-[10px] bg-[#102A43] px-2 py-0.5 rounded-[6px] border border-[#334E68]">
                      {orders.length}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full text-left px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-all flex items-center justify-between ${
                  activeTab === 'analytics'
                    ? 'bg-[#243B53] text-[#FFFFFF] shadow-sm ring-1 ring-[#D6A84F]/30'
                    : 'text-[#D9E2EC] hover:bg-[#243B53]/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 size={16} className={activeTab === 'analytics' ? 'text-[#D6A84F]' : 'text-[#9FB3C8]'} />
                  <span>Analíticas & Balance</span>
                </div>
                {activeTab === 'analytics' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D6A84F]" aria-hidden="true" />
                )}
              </button>
            </nav>

            {/* Acción rápida publicar */}
            <div className="pt-2">
              <button
                onClick={openCreateModal}
                className="w-full h-10 bg-[#243B53] hover:bg-[#1B2D3F] border border-[#334E68] hover:border-[#D6A84F] text-white font-semibold text-xs rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={15} className="text-[#D6A84F]" />
                <span>Nuevo Producto</span>
              </button>
            </div>
          </aside>

          {/* ÁREA PRINCIPAL */}
          <main className="flex-1 w-full space-y-6">
            {/* Encabezado con título en azul marino (#102A43), descripción en texto secundario (#627D98) y acciones */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <h1 className="text-2xl font-bold text-[#102A43] tracking-tight">
                  {activeTab === 'products'
                    ? 'Inventario de Productos'
                    : activeTab === 'orders'
                    ? 'Pedidos y Entregas en Cereté'
                    : 'Panel de Analíticas & Balance Financiero'}
                </h1>
                <p className="text-sm text-[#627D98] mt-0.5">
                  {activeTab === 'products'
                    ? 'Gestiona tus publicaciones, precios en COP y stock para la sede.'
                    : activeTab === 'orders'
                    ? 'Supervisa y confirma los pedidos solicitados por compañeros universitarios.'
                    : 'Rendimiento en tiempo real de ingresos, rotación de artículos y efectividad en campus.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openCreateModal}
                  className="h-10 px-4 bg-[#102A43] hover:bg-[#243B53] text-[#FFFFFF] font-semibold text-xs rounded-[8px] shadow-sm transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                >
                  <Plus size={15} className="text-[#D6A84F]" />
                  <span>Publicar Producto</span>
                </button>
                <button
                  onClick={loadDashboardData}
                  className="h-10 w-10 bg-[#FFFFFF] border border-[#D9E2EC] hover:bg-[#F5F7FA] text-[#627D98] hover:text-[#102A43] rounded-[8px] shadow-sm transition-colors flex items-center justify-center"
                  title="Actualizar datos"
                >
                  <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* TARJETAS BLANCAS CON BORDE #D9E2EC PARA MÉTRICAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-5 shadow-sm space-y-1">
                <span className="text-xs font-semibold text-[#627D98]">Publicaciones Activas</span>
                <p className="text-2xl font-bold text-[#102A43] tabular-nums">{products.length}</p>
                <span className="text-[11px] text-[#627D98] block">Disponibles en catálogo</span>
              </div>

              <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-5 shadow-sm space-y-1">
                <span className="text-xs font-semibold text-[#627D98]">Pedidos Pendientes</span>
                <p className="text-2xl font-bold text-[#102A43] flex items-center gap-2">
                  <span className="tabular-nums">{pendingOrdersCount}</span>
                  {pendingOrdersCount > 0 && (
                    <span className="text-xs font-bold text-[#8C6517] bg-[#FBF5EA] border border-[#D6A84F] px-2 py-0.5 rounded-[6px]">
                      Por entregar
                    </span>
                  )}
                </p>
                <span className="text-[11px] text-[#627D98] block">Por coordinar en Cereté</span>
              </div>

              <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-5 shadow-sm space-y-1">
                <span className="text-xs font-semibold text-[#627D98]">Ventas Completadas</span>
                <p className="text-2xl font-bold text-[#2F855A] tabular-nums">{deliveredOrdersCount}</p>
                <span className="text-[11px] text-[#627D98] block">Entregadas con éxito</span>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-[#FDE8E8] border border-[#F8B4B4] rounded-[8px] text-xs text-[#C53030] flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: MIS PRODUCTOS */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                {/* Header de la sección de productos con selector de vista (Tarjetas / Lista) */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9E2EC] pb-3">
                  <div className="flex items-center gap-2">
                    <Package size={18} className="text-[#102A43]" />
                    <span className="text-sm font-bold text-[#102A43]">
                      Inventario en exhibición ({products.length})
                    </span>
                  </div>

                  {products.length > 0 && (
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
                  )}
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-56 bg-slate-200 rounded-[12px]" />
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  viewLayout === 'grid' ? (
                    /* VISTA EN TARJETAS (CARDS) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] shadow-sm overflow-hidden flex flex-col justify-between hover:border-[#102A43]/40 transition-colors"
                        >
                          <div>
                            <div className="relative aspect-16/10 bg-[#F5F7FA] overflow-hidden border-b border-[#D9E2EC]">
                              <img
                                src={
                                  p.images && p.images[0]
                                    ? p.images[0]
                                    : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'
                                }
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2.5 left-2.5">
                                <ConditionBadge condition={p.condition} />
                              </div>
                              <div className="absolute top-2.5 right-2.5 bg-[#102A43]/85 text-white text-[10px] font-bold px-2 py-0.5 rounded-[6px]">
                                Stock: {p.stock}
                              </div>
                            </div>

                            <div className="p-4 space-y-2">
                              <h4 className="font-bold text-[#1F2933] text-sm line-clamp-1">{p.title}</h4>
                              <p className="text-xs text-[#627D98] line-clamp-2 leading-relaxed">{p.description}</p>
                              <div className="flex items-center justify-between pt-2">
                                <span className="text-base font-bold text-[#102A43] tabular-nums">
                                  {formatCOP(p.price)}
                                </span>
                                <span className="text-[11px] text-[#627D98] flex items-center gap-1">
                                  <MapPin size={11} className="text-[#102A43]" />
                                  <span className="truncate max-w-[130px]">{p.meetingPoint || OFFICIAL_CAMPUS}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-[#F5F7FA] border-t border-[#D9E2EC] flex items-center gap-2">
                            <Link
                              to={`/products/${p.id}`}
                              className="h-8 px-2.5 bg-[#FFFFFF] hover:bg-[#F5F7FA] border border-[#D9E2EC] rounded-[8px] text-xs font-semibold text-[#102A43] flex items-center justify-center gap-1 transition-colors"
                              title="Ver vista pública"
                            >
                              <Eye size={13} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="flex-1 h-8 bg-[#FFFFFF] hover:bg-[#F5F7FA] border border-[#D9E2EC] rounded-[8px] text-xs font-semibold text-[#102A43] flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Edit2 size={13} /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(p.id)}
                              className="h-8 px-3 bg-[#FDE8E8] hover:bg-[#F8B4B4] text-[#C53030] rounded-[8px] text-xs font-semibold flex items-center justify-center transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* VISTA EN LISTA (HORIZONTAL ROWS) */
                    <div className="space-y-3">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-4 shadow-sm hover:border-[#102A43]/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="relative w-20 h-20 rounded-[8px] overflow-hidden bg-[#F5F7FA] border border-[#D9E2EC] shrink-0">
                              <img
                                src={
                                  p.images && p.images[0]
                                    ? p.images[0]
                                    : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300'
                                }
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <ConditionBadge condition={p.condition} />
                                {p.category && (
                                  <span className="text-[11px] font-semibold text-[#102A43] bg-[#F0F4F8] px-2 py-0.5 rounded-[4px]">
                                    {p.category.name}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-[#1F2933] text-sm truncate">{p.title}</h4>
                              <p className="text-xs text-[#627D98] line-clamp-1">{p.description}</p>
                              <div className="flex items-center gap-1 text-[11px] text-[#627D98]">
                                <MapPin size={11} className="text-[#102A43]" />
                                <span className="truncate">{p.meetingPoint || OFFICIAL_CAMPUS}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D9E2EC]">
                            <div className="text-left sm:text-right">
                              <span className="text-base font-bold text-[#102A43] tabular-nums block">
                                {formatCOP(p.price)}
                              </span>
                              <span className="text-[11px] text-[#627D98] block">
                                {p.stock <= 0 ? 'Agotado' : `Stock: ${p.stock}`}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Link
                                to={`/products/${p.id}`}
                                className="h-8 px-2.5 bg-[#FFFFFF] hover:bg-[#F5F7FA] text-[#102A43] border border-[#D9E2EC] font-semibold text-xs rounded-[6px] shadow-sm flex items-center gap-1 transition-colors shrink-0"
                                title="Ver vista pública"
                              >
                                <Eye size={13} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => openEditModal(p)}
                                className="h-8 px-3 bg-[#FFFFFF] hover:bg-[#F5F7FA] text-[#102A43] border border-[#D9E2EC] font-semibold text-xs rounded-[6px] shadow-sm flex items-center gap-1 transition-colors shrink-0"
                              >
                                <Edit2 size={13} /> Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(p.id)}
                                className="h-8 px-2.5 bg-[#FDE8E8] hover:bg-[#F8B4B4] text-[#C53030] font-semibold text-xs rounded-[6px] flex items-center justify-center transition-colors shrink-0"
                                title="Eliminar producto"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="p-10 text-center bg-[#FFFFFF] rounded-[12px] border border-dashed border-[#D9E2EC] max-w-md mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-[8px] bg-[#F0F4F8] text-[#102A43] flex items-center justify-center mx-auto">
                      <Package size={24} />
                    </div>
                    <h3 className="text-sm font-bold text-[#102A43]">No tienes productos publicados</h3>
                    <p className="text-xs text-[#627D98]">
                      Publica libros, calculadoras o materiales para vender en el Centro Tutorial Cereté.
                    </p>
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="px-4 py-2 bg-[#102A43] hover:bg-[#243B53] text-white text-xs font-semibold rounded-[8px] shadow-sm transition-all"
                    >
                      Publicar primer producto
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PEDIDOS RECIBIDOS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length > 0 ? (
                  orders.map((ord) => {
                    const buyerWhatsapp = ord.buyer?.phone;
                    const cleanNumber = buyerWhatsapp ? toWhatsAppClean(buyerWhatsapp) : '';

                    return (
                      <div
                        key={ord.id}
                        className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] shadow-sm p-5 space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9E2EC] pb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-[#102A43] text-sm">
                              Pedido #{ord.orderNumber}
                            </span>
                            <OrderStatusBadge status={ord.status} />
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-[#627D98]">
                            <Clock size={13} />
                            <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Buyer & Campus */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-[#F5F7FA] rounded-[8px] border border-[#D9E2EC] space-y-1">
                            <span className="text-[10px] font-bold text-[#627D98] uppercase">Estudiante Comprador</span>
                            <p className="font-bold text-[#1F2933] text-sm">{ord.buyer?.name}</p>
                            {cleanNumber && (
                              <a
                                href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(`¡Hola ${ord.buyer?.name}! Te contacto por tu Pedido #${ord.orderNumber} en CampusMarket para coordinar la entrega en Cereté.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#2F855A] font-bold hover:underline mt-1"
                              >
                                <MessageCircle size={13} /> WhatsApp Comprador
                              </a>
                            )}
                          </div>

                          <div className="p-3 bg-[#F5F7FA] rounded-[8px] border border-[#D9E2EC] space-y-1">
                            <span className="text-[10px] font-bold text-[#627D98] uppercase">Punto de Recogida</span>
                            <p className="font-bold text-[#1F2933] flex items-center gap-1">
                              <MapPin size={13} className="text-[#102A43]" />
                              {ord.meetingPoint || OFFICIAL_CAMPUS}
                            </p>
                            {ord.notes && (
                              <p className="text-[#627D98] italic mt-0.5">Nota: "{ord.notes}"</p>
                            )}
                          </div>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-[#D9E2EC]">
                          {ord.items.map((item) => (
                            <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                              <span className="font-medium text-[#1F2933]">
                                {item.product?.title || 'Producto'} (x{item.quantity})
                              </span>
                              <span className="font-bold text-[#102A43] tabular-nums">
                                {formatCOP(item.quantity * item.unitPrice)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Total & Action Status Changer */}
                        <div className="pt-3 border-t border-[#D9E2EC] flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <span className="text-xs text-[#627D98]">Total a cobrar al entregar:</span>
                            <span className="text-lg font-bold text-[#102A43] ml-2 tabular-nums">
                              {formatCOP(ord.totalAmount)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {ord.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.id, 'CONFIRMED')}
                                  className="h-8 px-3 bg-[#102A43] hover:bg-[#243B53] text-white font-semibold text-xs rounded-[8px] flex items-center gap-1.5 transition-colors"
                                >
                                  <CheckCircle2 size={13} className="text-[#D6A84F]" />
                                  <span>Confirmar Pedido</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.id, 'CANCELLED')}
                                  className="h-8 px-3 bg-[#FDE8E8] hover:bg-[#F8B4B4] text-[#C53030] font-semibold text-xs rounded-[8px] flex items-center gap-1 transition-colors"
                                >
                                  <XCircle size={13} />
                                  <span>Cancelar</span>
                                </button>
                              </>
                            )}

                            {ord.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'DELIVERED')}
                                className="h-8 px-3.5 bg-[#2F855A] hover:bg-[#276749] text-white font-semibold text-xs rounded-[8px] flex items-center gap-1.5 transition-colors"
                              >
                                <CheckCircle size={13} />
                                <span>Marcar como Entregado</span>
                              </button>
                            )}

                            {ord.status === 'DELIVERED' && (
                              <span className="text-xs font-semibold text-[#2F855A] bg-[#EAF5EE] border border-[#B4E0C4] px-2.5 py-1 rounded-[8px]">
                                Entrega finalizada con éxito
                              </span>
                            )}

                            {ord.status === 'CANCELLED' && (
                              <span className="text-xs font-semibold text-[#C53030] bg-[#FDE8E8] border border-[#F8B4B4] px-2.5 py-1 rounded-[8px]">
                                Pedido cancelado (stock restablecido)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-10 text-center bg-[#FFFFFF] rounded-[12px] border border-dashed border-[#D9E2EC] max-w-md mx-auto space-y-2">
                    <ShoppingBag size={26} className="text-[#627D98] mx-auto" />
                    <h4 className="text-sm font-bold text-[#102A43]">Sin pedidos recibidos aún</h4>
                    <p className="text-xs text-[#627D98]">
                      Cuando los estudiantes reserven tus productos, podrás confirmar la entrega aquí.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ANALÍTICAS Y BALANCE FINANCIERO */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Barra de Acciones del Reporte */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E2EC] pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-[#102A43]" />
                    <span className="text-sm font-bold text-[#102A43]">
                      Rendimiento de Ventas & Balance en Campus
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="h-9 px-3 bg-[#FFFFFF] border border-[#D9E2EC] hover:bg-[#F5F7FA] text-[#102A43] text-xs font-semibold rounded-[8px] shadow-2xs transition-colors flex items-center gap-1.5"
                      title="Imprimir balance o guardar como PDF"
                    >
                      <Printer size={14} className="text-[#627D98]" />
                      <span>Imprimir / PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={loadDashboardData}
                      className="h-9 px-3 bg-[#102A43] hover:bg-[#243B53] text-white text-xs font-semibold rounded-[8px] shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                      <span>Actualizar Métricas</span>
                    </button>
                  </div>
                </div>

                {/* KPI HIGHLIGHTS CARDS (4 Columnas) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Cobrado / Entregado */}
                  <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#627D98]">Ingresos Realizados</span>
                      <div className="w-7 h-7 rounded-[6px] bg-[#EAF5EE] text-[#2F855A] flex items-center justify-center">
                        <Coins size={15} />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-[#2F855A] tabular-nums tracking-tight">
                      {formatCOP(analytics?.totalDeliveredRevenue || 0)}
                    </p>
                    <span className="text-[11px] text-[#627D98] block">
                      {analytics?.ordersByStatus.DELIVERED || 0} entregas finalizadas
                    </span>
                  </div>

                  {/* En Curso / Potencial */}
                  <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#627D98]">Por Cobrar (En Curso)</span>
                      <div className="w-7 h-7 rounded-[6px] bg-[#FBF5EA] text-[#8C6517] flex items-center justify-center">
                        <Clock size={15} />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-[#102A43] tabular-nums tracking-tight">
                      {formatCOP(analytics?.potentialRevenue || 0)}
                    </p>
                    <span className="text-[11px] text-[#627D98] block">
                      {(analytics?.ordersByStatus.PENDING || 0) + (analytics?.ordersByStatus.CONFIRMED || 0)} pedidos por coordinar
                    </span>
                  </div>

                  {/* Ticket Promedio */}
                  <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#627D98]">Ticket Promedio</span>
                      <div className="w-7 h-7 rounded-[6px] bg-[#F0F4F8] text-[#102A43] flex items-center justify-center">
                        <TrendingUp size={15} />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-[#102A43] tabular-nums tracking-tight">
                      {formatCOP(analytics?.averageOrderValue || 0)}
                    </p>
                    <span className="text-[11px] text-[#627D98] block">Por pedido entregado</span>
                  </div>

                  {/* Tasa de Cumplimiento */}
                  <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#627D98]">Tasa de Efectividad</span>
                      <div className="w-7 h-7 rounded-[6px] bg-[#EAF5EE] text-[#2F855A] flex items-center justify-center">
                        <Percent size={15} />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-[#102A43] tabular-nums tracking-tight">
                      {analytics?.deliveredRate || 0}%
                    </p>
                    <span className="text-[11px] text-[#2F855A] font-semibold block">
                      Concretados en Cereté
                    </span>
                  </div>
                </div>

                {/* HISTÓRICO DE VENTAS MENSUALES (GRÁFICO DE BARRAS INTERACTIVO) */}
                <div className="bg-[#FFFFFF] rounded-[14px] border border-[#D9E2EC] p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F4F8] pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                        <TrendingUp size={16} className="text-[#D6A84F]" />
                        <span>Histórico de Ingresos (Últimos 6 meses)</span>
                      </h3>
                      <p className="text-xs text-[#627D98]">
                        Montos recaudados por pedidos completados en la sede universitaria.
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#627D98] bg-[#F0F4F8] px-2.5 py-1 rounded-[6px]">
                      Pesos Colombianos (COP)
                    </span>
                  </div>

                  {/* Área del Gráfico de Barras */}
                  <div className="pt-4">
                    {(() => {
                      const months = analytics?.salesByMonth || [];
                      const maxRevenue = Math.max(...months.map((m) => m.revenue), 1000);

                      return (
                        <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-52 sm:h-60 pt-6 pb-2 border-b border-[#D9E2EC]">
                          {months.map((m, idx) => {
                            const heightPercent = Math.max(4, Math.round((m.revenue / maxRevenue) * 100));
                            return (
                              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                                {/* Tooltip con monto */}
                                <span className="text-[10px] font-bold text-[#102A43] opacity-0 group-hover:opacity-100 transition-opacity mb-1.5 truncate max-w-full">
                                  {formatCOP(m.revenue)}
                                </span>

                                {/* Barra */}
                                <div className="w-full max-w-[48px] bg-[#F0F4F8] rounded-t-[6px] overflow-hidden flex items-end h-full">
                                  <div
                                    style={{ height: `${heightPercent}%` }}
                                    className={`w-full rounded-t-[6px] transition-all duration-500 ${
                                      m.revenue > 0
                                        ? 'bg-[#102A43] group-hover:bg-[#D6A84F]'
                                        : 'bg-[#CBD2D9]'
                                    }`}
                                  />
                                </div>

                                {/* Etiqueta de Mes */}
                                <span className="text-[11px] font-semibold text-[#627D98] mt-2 block truncate">
                                  {m.label.split(' ')[0]}
                                </span>
                                <span className="text-[9px] text-[#9FB3C8] block">
                                  {m.ordersCount} {m.ordersCount === 1 ? 'ped.' : 'peds.'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* EMBUDO Y ESTADO DE PEDIDOS */}
                <div className="bg-[#FFFFFF] rounded-[14px] border border-[#D9E2EC] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-3">
                    <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                      <PieChart size={16} className="text-[#102A43]" />
                      <span>Distribución de Estados de Pedidos ({analytics?.totalOrders || 0})</span>
                    </h3>
                    <span className="text-xs text-[#627D98]">Tasa de conversión física</span>
                  </div>

                  {/* Barra de progreso segmentada */}
                  {analytics && analytics.totalOrders > 0 ? (
                    <div className="space-y-4">
                      <div className="w-full h-3 rounded-full bg-[#F0F4F8] overflow-hidden flex">
                        {/* Entregados (Verde) */}
                        <div
                          style={{
                            width: `${Math.round((analytics.ordersByStatus.DELIVERED / analytics.totalOrders) * 100)}%`,
                          }}
                          className="bg-[#2F855A]"
                          title={`Entregados: ${analytics.ordersByStatus.DELIVERED}`}
                        />
                        {/* Confirmados (Azul) */}
                        <div
                          style={{
                            width: `${Math.round((analytics.ordersByStatus.CONFIRMED / analytics.totalOrders) * 100)}%`,
                          }}
                          className="bg-[#243B53]"
                          title={`Confirmados: ${analytics.ordersByStatus.CONFIRMED}`}
                        />
                        {/* Pendientes (Dorado) */}
                        <div
                          style={{
                            width: `${Math.round((analytics.ordersByStatus.PENDING / analytics.totalOrders) * 100)}%`,
                          }}
                          className="bg-[#D6A84F]"
                          title={`Pendientes: ${analytics.ordersByStatus.PENDING}`}
                        />
                        {/* Cancelados (Rojo) */}
                        <div
                          style={{
                            width: `${Math.round((analytics.ordersByStatus.CANCELLED / analytics.totalOrders) * 100)}%`,
                          }}
                          className="bg-[#C53030]"
                          title={`Cancelados: ${analytics.ordersByStatus.CANCELLED}`}
                        />
                      </div>

                      {/* Tarjetas informativas de los 4 estados */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <div className="p-3 rounded-[8px] bg-[#EAF5EE] border border-[#B4E0C4] text-center">
                          <span className="text-[11px] font-bold text-[#2F855A] block">Entregados</span>
                          <span className="text-lg font-black text-[#2F855A]">
                            {analytics.ordersByStatus.DELIVERED}
                          </span>
                        </div>

                        <div className="p-3 rounded-[8px] bg-[#F0F4F8] border border-[#D9E2EC] text-center">
                          <span className="text-[11px] font-bold text-[#102A43] block">Confirmados</span>
                          <span className="text-lg font-black text-[#102A43]">
                            {analytics.ordersByStatus.CONFIRMED}
                          </span>
                        </div>

                        <div className="p-3 rounded-[8px] bg-[#FBF5EA] border border-[#D6A84F]/40 text-center">
                          <span className="text-[11px] font-bold text-[#8C6517] block">Pendientes</span>
                          <span className="text-lg font-black text-[#8C6517]">
                            {analytics.ordersByStatus.PENDING}
                          </span>
                        </div>

                        <div className="p-3 rounded-[8px] bg-[#FDE8E8] border border-[#F8B4B4] text-center">
                          <span className="text-[11px] font-bold text-[#C53030] block">Cancelados</span>
                          <span className="text-lg font-black text-[#C53030]">
                            {analytics.ordersByStatus.CANCELLED}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#627D98] text-center py-4">
                      No hay pedidos registrados para calcular la distribución.
                    </p>
                  )}
                </div>

                {/* TOP PRODUCTOS MÁS VENDIDOS & SALUD DE INVENTARIO (2 Columnas) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top 5 Productos */}
                  <div className="bg-[#FFFFFF] rounded-[14px] border border-[#D9E2EC] p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-3">
                      <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                        <Award size={16} className="text-[#D6A84F]" />
                        <span>Artículos Más Demandados</span>
                      </h3>
                      <span className="text-[11px] font-semibold text-[#627D98]">Top Ventas</span>
                    </div>

                    {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.topProducts.map((p, index) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-3 p-3 rounded-[10px] bg-[#F8FAFC] border border-[#D9E2EC] hover:border-[#D6A84F] transition-colors"
                          >
                            <span className="w-6 text-center font-black text-sm text-[#102A43]">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}°`}
                            </span>

                            {p.images?.[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.title}
                                className="w-11 h-11 object-cover rounded-[8px] border border-[#D9E2EC]"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-[8px] bg-[#102A43] text-[#D6A84F] font-bold text-xs flex items-center justify-center">
                                CMP
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#102A43] truncate">{p.title}</p>
                              <p className="text-[11px] text-[#627D98]">
                                {p.unitsSold} {p.unitsSold === 1 ? 'unidad vendida' : 'unidades vendidas'}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-[#2F855A] block">
                                {formatCOP(p.revenue)}
                              </span>
                              <span className="text-[10px] text-[#627D98]">Stock: {p.currentStock}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-xs text-[#627D98] space-y-1">
                        <Package size={24} className="text-[#CBD2D9] mx-auto" />
                        <p>Aún no se han completado pedidos para rankear productos.</p>
                      </div>
                    )}
                  </div>

                  {/* Salud de Inventario y Satisfacción */}
                  <div className="space-y-6">
                    {/* Salud de Inventario */}
                    <div className="bg-[#FFFFFF] rounded-[14px] border border-[#D9E2EC] p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-3">
                        <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                          <Package size={16} className="text-[#102A43]" />
                          <span>Salud de Inventario en Campus</span>
                        </h3>
                        <span className="text-[11px] font-bold text-[#102A43] bg-[#F0F4F8] px-2 py-0.5 rounded-[6px]">
                          {analytics?.inventoryHealth.totalStockUnits || 0} unidades físicas
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-[8px] bg-[#EAF5EE] border border-[#B4E0C4]">
                          <span className="text-[11px] font-bold text-[#2F855A] block">Disponibles</span>
                          <span className="text-xl font-black text-[#2F855A]">
                            {analytics?.inventoryHealth.available || 0}
                          </span>
                        </div>

                        <div className="p-3 rounded-[8px] bg-[#FDE8E8] border border-[#F8B4B4]">
                          <span className="text-[11px] font-bold text-[#C53030] block">Agotados</span>
                          <span className="text-xl font-black text-[#C53030]">
                            {analytics?.inventoryHealth.soldOut || 0}
                          </span>
                        </div>

                        <div className="p-3 rounded-[8px] bg-[#F0F4F8] border border-[#D9E2EC]">
                          <span className="text-[11px] font-bold text-[#627D98] block">Pausados</span>
                          <span className="text-xl font-black text-[#102A43]">
                            {analytics?.inventoryHealth.paused || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reseñas y Reputación */}
                    <div className="bg-[#FFFFFF] rounded-[14px] border border-[#D9E2EC] p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-3">
                        <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                          <Star size={16} className="text-[#D6A84F] fill-[#D6A84F]" />
                          <span>Reputación del Vendedor</span>
                        </h3>
                        <span className="text-xs text-[#627D98]">
                          {analytics?.reviewsStats.totalReviews || 0} reseñas recibidas
                        </span>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="text-center space-y-1 shrink-0">
                          <p className="text-3xl font-black text-[#102A43]">
                            {analytics?.reviewsStats.averageRating || '5.0'}
                          </p>
                          <div className="flex items-center justify-center gap-0.5 text-[#D6A84F]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} size={14} className="fill-[#D6A84F]" />
                            ))}
                          </div>
                          <span className="text-[10px] text-[#627D98] block">Calificación general</span>
                        </div>

                        <div className="flex-1 space-y-1.5 text-xs">
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const count =
                              (analytics?.reviewsStats.ratingBreakdown as any)?.[stars] || 0;
                            const total = analytics?.reviewsStats.totalReviews || 0;
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                            return (
                              <div key={stars} className="flex items-center gap-2">
                                <span className="w-5 text-[11px] font-semibold text-[#627D98]">{stars}★</span>
                                <div className="flex-1 h-2 rounded-full bg-[#F0F4F8] overflow-hidden">
                                  <div
                                    style={{ width: `${pct}%` }}
                                    className="h-full bg-[#D6A84F] rounded-full"
                                  />
                                </div>
                                <span className="w-6 text-[10px] text-[#9FB3C8] text-right">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Editar Producto' : 'Publicar Producto en Centro Tutorial Cereté'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          {formError && (
            <div className="p-3 bg-[#FDE8E8] border border-[#F8B4B4] rounded-[8px] text-xs text-[#C53030] flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Título del Producto
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Calculadora Científica Casio FX-991LAX"
              className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Descripción
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Estado del producto, notas del curso o detalles de uso..."
              className="w-full p-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] resize-none"
              required
              minLength={10}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1 flex items-center justify-between">
                <span>Precio (COP)</span>
                {price && (
                  <span className="text-[10px] text-[#2F855A] font-bold">
                    {formatCOP(parseCOP(price))}
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#627D98] font-bold text-xs">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(formatCOPInput(e.target.value))}
                  placeholder="20.000"
                  className="w-full h-11 pl-7 pr-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm font-semibold text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Stock Disponible
              </label>
              <input
                type="number"
                min="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">Categoría</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-xs font-semibold text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                required
              >
                <option value="" disabled>
                  {categories.length === 0 ? 'Cargando categorías...' : 'Selecciona una categoría...'}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">Condición</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ProductCondition)}
                className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-xs font-semibold text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              >
                <option value="NUEVO">Nuevo</option>
                <option value="COMO_NUEVO">Como nuevo</option>
                <option value="USADO_BUENO">Usado - Buen estado</option>
                <option value="USADO_REGULAR">Usado - Regular</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1 flex items-center gap-1">
              <MapPin size={12} className="text-[#102A43]" /> Lugar de recogida (Centro Tutorial Cereté)
            </label>
            <input
              type="text"
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              placeholder="Centro Tutorial Cereté - Cafetería, Portería o Biblioteca"
              className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              required
            />
          </div>

          {/* Image Uploader & URL fallback */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#1F2933]">
                Fotos del Producto ({uploadedImages.length} cargadas)
              </label>
              {uploadedImages.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowPreview360((p) => !p)}
                  className="text-xs font-bold text-[#102A43] hover:text-[#243B53] flex items-center gap-1.5 transition-colors bg-[#F0F4F8] hover:bg-[#D9E2EC] px-2.5 py-1 rounded-[6px] border border-[#D9E2EC]"
                >
                  <Eye size={12} className="text-[#102A43]" />
                  <span>{showPreview360 ? 'Ocultar fotos' : 'Ver fotos'}</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <label className="cursor-pointer h-10 px-3 bg-[#F0F4F8] hover:bg-[#D9E2EC] text-[#102A43] border border-[#D9E2EC] rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0">
                <Upload size={14} />
                <span>{isUploading ? 'Procesando fotos...' : 'Subir fotos del ordenador (múltiples)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              <div className="flex-1 flex gap-1.5">
                <input
                  type="url"
                  placeholder="o pega una URL de imagen..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-xs text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="h-10 px-3 bg-[#F5F7FA] hover:bg-[#D9E2EC] border border-[#D9E2EC] text-[#102A43] rounded-[8px] text-xs font-bold transition-colors"
                >
                  Añadir
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#627D98] flex items-center gap-1.5 leading-tight">
              <Sparkles size={13} className="text-[#D6A84F] shrink-0" />
              <span>
                Sube fotos desde diferentes ángulos (frente, lados, atrás, detalles) para que los compañeros puedan apreciar bien tu producto.
              </span>
            </p>

            {/* Live Gallery Preview inside modal */}
            {showPreview360 && uploadedImages.length > 1 && (
              <div className="p-3 bg-[#F5F7FA] rounded-[12px] border border-[#D9E2EC] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#102A43] flex items-center gap-1">
                    <Eye size={13} className="text-[#102A43]" /> Vista previa de fotos y ángulos
                  </span>
                  <span className="text-[10px] text-[#627D98]">Zoom y navegación activa</span>
                </div>
                <Product360Viewer images={uploadedImages} title={title || 'Vista previa'} className="max-w-sm mx-auto" />
              </div>
            )}

            {/* Photos Reordering & Management */}
            {uploadedImages.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#627D98]">Fotos seleccionadas (la primera será la foto principal):</span>
                <div className="flex items-center gap-2 overflow-x-auto py-2">
                  {uploadedImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative w-20 rounded-[8px] overflow-hidden border border-[#D9E2EC] bg-white shrink-0 shadow-xs flex flex-col"
                    >
                      <div className="relative w-full h-16">
                        <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 bg-[#102A43]/85 text-white text-[9px] font-bold px-1 py-0.5 rounded-[4px] backdrop-blur-xs">
                          {i === 0 ? 'Principal' : `#${i + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-1 right-1 bg-[#C53030] text-white rounded-full p-0.5 shadow-xs hover:bg-[#9B2C2C] transition-colors"
                          title="Eliminar foto"
                        >
                          <XCircle size={12} />
                        </button>
                      </div>

                      {/* Reorder buttons */}
                      <div className="flex items-center justify-between p-1 bg-[#F5F7FA] border-t border-[#D9E2EC]">
                        <button
                          type="button"
                          onClick={() => moveImage(i, i - 1)}
                          disabled={i === 0}
                          className="p-1 hover:bg-[#D9E2EC] rounded text-[#102A43] disabled:opacity-20 transition-colors"
                          title="Mover a la izquierda"
                        >
                          <ArrowLeft size={11} />
                        </button>
                        <span className="text-[9px] font-bold text-[#627D98]">#{i + 1}</span>
                        <button
                          type="button"
                          onClick={() => moveImage(i, i + 1)}
                          disabled={i === uploadedImages.length - 1}
                          className="p-1 hover:bg-[#D9E2EC] rounded text-[#102A43] disabled:opacity-20 transition-colors"
                          title="Mover a la derecha"
                        >
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#D9E2EC]">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="h-10 px-4 text-xs font-semibold text-[#627D98] hover:bg-[#F5F7FA] rounded-[8px] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="h-10 px-5 bg-[#102A43] hover:bg-[#243B53] text-white font-semibold text-xs rounded-[8px] shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Publicar Producto'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Styled Delete Product Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null, isLoading: false })}
        onConfirm={handleConfirmDeleteProduct}
        title="¿Eliminar producto definitivamente?"
        message="Esta acción no se puede deshacer. El producto será retirado inmediatamente del catálogo oficial de Centro Tutorial Cereté."
        confirmText="Sí, eliminar producto"
        cancelText="Conservar producto"
        type="danger"
        isLoading={deleteModal.isLoading}
      />

      {/* Floating Status Notification Toast */}
      {statusFeedback && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`px-4 py-3 rounded-[12px] shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
              statusFeedback.type === 'success'
                ? 'bg-[#FFFFFF] text-[#2F855A] border-[#9AE6B4]'
                : 'bg-[#FFFFFF] text-[#C53030] border-[#F8B4B4]'
            }`}
          >
            {statusFeedback.type === 'success' ? (
              <CheckCircle size={16} className="text-[#2F855A]" />
            ) : (
              <AlertCircle size={16} className="text-[#C53030]" />
            )}
            <span>{statusFeedback.message}</span>
            <button
              onClick={() => setStatusFeedback(null)}
              className="ml-2 text-[#627D98] hover:text-[#1F2933] p-0.5"
            >
              <XCircle size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
