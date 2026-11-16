import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestsService, CreateRequestPayload, CreateOfferPayload } from '../services/requests.service';
import { productsService } from '../services/products.service';
import { StudentRequest, RequestStatus, Product } from '../types';
import { formatCOP, formatCOPInput, parseCOP, toWhatsAppClean } from '../utils/format';
import { Modal } from '../components/common/Modal';
import {
  Compass,
  Search,
  Plus,
  MessageSquare,
  CheckCircle2,
  Clock,
  Trash2,
  Send,
  MessageCircle,
  ExternalLink,
  DollarSign,
  AlertCircle,
  GraduationCap,
  Sparkles,
  RefreshCw,
  ChevronDown,
  X,
  MapPin,
  ShieldCheck,
  Check,
} from 'lucide-react';

const CAREER_OPTIONS = [
  'Todas las carreras',
  'Administración de Empresas',
  'Contaduría Pública',
  'Ingeniería de Sistemas',
  'Licenciatura en Educación',
  'Salud y Enfermería',
  'Otras carreras',
];

export const RequestsPage: React.FC = () => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const [searchParams] = useSearchParams();

  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'OPEN' | 'RESOLVED'>('OPEN');
  const [careerFilter, setCareerFilter] = useState('all');

  // Modal nueva petición
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newCareer, setNewCareer] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Modal responder oferta
  const [activeRequestForOffer, setActiveRequestForOffer] = useState<StudentRequest | null>(null);
  const [offerMessage, setOfferMessage] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  // Estados de ofertas expandidas
  const [expandedRequests, setExpandedRequests] = useState<Record<string, boolean>>({});

  // Abrir modal automáticamente si la URL contiene ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      if (isAuthenticated) {
        setIsCreateModalOpen(true);
      }
    }
  }, [searchParams, isAuthenticated]);

  const toggleExpand = (id: string) => {
    setExpandedRequests((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Cargar peticiones
  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await requestsService.getRequests({
        status: statusFilter === 'all' ? undefined : (statusFilter as RequestStatus),
        career: careerFilter === 'all' ? undefined : careerFilter,
        search: searchQuery.trim() || undefined,
      });
      setRequests(data.requests || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las peticiones del campus');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, careerFilter, searchQuery]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Cargar productos del vendedor para vincular ofertas
  useEffect(() => {
    if (isAuthenticated && isSeller) {
      productsService
        .getMyProducts()
        .then((prods) => setMyProducts(Array.isArray(prods) ? prods.filter((p) => p.status === 'AVAILABLE') : []))
        .catch(() => setMyProducts([]));
    }
  }, [isAuthenticated, isSeller]);

  // Manejar creación de petición
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (newTitle.trim().length < 3) {
      setCreateError('El título debe tener al menos 3 caracteres.');
      return;
    }
    if (newDescription.trim().length < 10) {
      setCreateError('Describe detalladamente lo que buscas (mínimo 10 caracteres).');
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const payload: CreateRequestPayload = {
        title: newTitle.trim(),
        description: newDescription.trim(),
        maxBudget: newBudget ? parseCOP(newBudget) : null,
        career: newCareer.trim() || user?.career || null,
      };

      await requestsService.createRequest(payload);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewBudget('');
      setNewCareer('');
      await loadRequests();
    } catch (err: any) {
      setCreateError(err.message || 'Error al publicar la petición.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Cambiar estado de la petición (autor)
  const handleToggleStatus = async (request: StudentRequest) => {
    const nextStatus: RequestStatus = request.status === 'OPEN' ? 'RESOLVED' : 'OPEN';
    try {
      await requestsService.updateStatus(request.id, nextStatus);
      await loadRequests();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado.');
    }
  };

  // Eliminar petición
  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta petición del mural?')) return;
    try {
      await requestsService.deleteRequest(requestId);
      await loadRequests();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar petición.');
    }
  };

  // Abrir modal de oferta
  const handleOpenOfferModal = (req: StudentRequest) => {
    setActiveRequestForOffer(req);
    setOfferMessage('');
    setOfferPrice('');
    setSelectedProductId('');
    setOfferError(null);
  };

  // Enviar oferta
  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequestForOffer) return;
    setOfferError(null);

    if (offerMessage.trim().length < 5) {
      setOfferError('Por favor redacta un mensaje claro sobre el artículo que ofreces.');
      return;
    }

    setIsSubmittingOffer(true);
    try {
      const payload: CreateOfferPayload = {
        message: offerMessage.trim(),
        price: offerPrice ? parseCOP(offerPrice) : null,
        productId: selectedProductId || null,
      };

      await requestsService.createOffer(activeRequestForOffer.id, payload);
      setExpandedRequests((prev) => ({ ...prev, [activeRequestForOffer.id]: true }));
      setActiveRequestForOffer(null);
      await loadRequests();
    } catch (err: any) {
      setOfferError(err.message || 'Error al enviar la oferta.');
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  // Eliminar oferta
  const handleDeleteOffer = async (offerId: string) => {
    if (!window.confirm('¿Seguro que deseas retirar tu oferta?')) return;
    try {
      await requestsService.deleteOffer(offerId);
      await loadRequests();
    } catch (err: any) {
      alert(err.message || 'Error al retirar la oferta.');
    }
  };

  const openCount = requests.filter((r) => r.status === 'OPEN').length;
  const resolvedCount = requests.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="min-h-[85vh] bg-[#F5F7FA] dark:bg-[#0B1523] py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* HERO BANNER EDITORIAL MURAL ESTUDIANTIL */}
        <section className="bg-[#102A43] dark:bg-[#102438] rounded-[16px] p-6 sm:p-8 text-white relative overflow-hidden border border-[#243B53] shadow-sm">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[8px] bg-[#243B53] border border-[#334E68] flex items-center justify-center text-[#D6A84F] shrink-0">
                  <Compass size={18} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Mural Estudiantil <span className="text-[#D6A84F]">· Centro Tutorial Cereté</span>
                </h1>
              </div>

              <p className="text-sm text-[#D9E2EC] leading-relaxed font-normal">
                Tablón colaborativo universitario. Publica los libros, útiles o herramientas académicas que necesitas para tu semestre, o propón ofertas directamente a compañeros sin intermediarios ni comisiones.
              </p>

              {/* Puntos de valor universitarios */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#9FB3C8]">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#D6A84F] shrink-0" />
                  <span>Entregas en campus Cereté</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle size={13} className="text-[#D6A84F] shrink-0" />
                  <span>Trato directo por WhatsApp</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#D6A84F] shrink-0" />
                  <span>Comunidad de estudiantes</span>
                </div>
              </div>
            </div>

            {/* Acción de publicar */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-11 px-5 bg-[#D6A84F] hover:bg-[#C99A40] text-[#102A43] font-bold text-xs sm:text-sm rounded-[8px] shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  <span>Publicar lo que busco</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="h-11 px-5 bg-[#D6A84F] hover:bg-[#C99A40] text-[#102A43] font-bold text-xs sm:text-sm rounded-[8px] shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Inicia sesión para publicar</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* BARRA DE FILTROS Y BÚSQUEDA */}
        <section aria-label="Filtros del mural" className="bg-[#FFFFFF] dark:bg-[#102438] rounded-[14px] p-4 border border-[#D9E2EC] dark:border-[#243B53] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627D98]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por libro, material, bata de laboratorio..."
              className="w-full h-10 pl-10 pr-9 bg-[#F5F7FA] dark:bg-[#152E46] border border-[#D9E2EC] dark:border-[#243B53] rounded-[8px] text-xs text-[#1F2933] dark:text-white placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627D98] hover:text-[#102A43]"
                title="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro por Carrera */}
            <select
              value={careerFilter}
              onChange={(e) => setCareerFilter(e.target.value)}
              className="h-10 px-3 bg-[#F5F7FA] dark:bg-[#152E46] border border-[#D9E2EC] dark:border-[#243B53] rounded-[8px] text-xs font-medium text-[#1F2933] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#102A43]"
            >
              {CAREER_OPTIONS.map((c) => (
                <option key={c} value={c === 'Todas las carreras' ? 'all' : c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Pestañas de Estado */}
            <div className="flex items-center gap-1 bg-[#F5F7FA] dark:bg-[#152E46] p-1 rounded-[8px] border border-[#D9E2EC] dark:border-[#243B53]">
              <button
                type="button"
                onClick={() => setStatusFilter('OPEN')}
                className={`h-8 px-3 rounded-[6px] text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  statusFilter === 'OPEN'
                    ? 'bg-[#102A43] text-white dark:bg-[#D6A84F] dark:text-[#102A43] shadow-xs'
                    : 'text-[#627D98] dark:text-[#9FB3C8] hover:text-[#1F2933] hover:bg-[#E2E8F0] dark:hover:bg-[#1D3D5D]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Buscando</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('RESOLVED')}
                className={`h-8 px-3 rounded-[6px] text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  statusFilter === 'RESOLVED'
                    ? 'bg-[#102A43] text-white dark:bg-[#D6A84F] dark:text-[#102A43] shadow-xs'
                    : 'text-[#627D98] dark:text-[#9FB3C8] hover:text-[#1F2933] hover:bg-[#E2E8F0] dark:hover:bg-[#1D3D5D]'
                }`}
              >
                <Check size={12} />
                <span>Conseguidas</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`h-8 px-3 rounded-[6px] text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-[#102A43] text-white dark:bg-[#D6A84F] dark:text-[#102A43] shadow-xs'
                    : 'text-[#627D98] dark:text-[#9FB3C8] hover:text-[#1F2933] hover:bg-[#E2E8F0] dark:hover:bg-[#1D3D5D]'
                }`}
              >
                Todas
              </button>
            </div>

            {/* Refrescar */}
            <button
              type="button"
              onClick={loadRequests}
              className="h-10 w-10 bg-[#F5F7FA] dark:bg-[#152E46] border border-[#D9E2EC] dark:border-[#243B53] text-[#627D98] dark:text-[#9FB3C8] hover:text-[#102A43] dark:hover:text-white rounded-[8px] flex items-center justify-center shrink-0 transition-colors"
              title="Actualizar peticiones"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-[#D6A84F]' : ''} />
            </button>
          </div>
        </section>

        {/* MENSAJES DE ERROR */}
        {error && (
          <div className="p-4 bg-[#FDE8E8] dark:bg-red-950/40 border border-[#F8B4B4] dark:border-red-800 rounded-[10px] text-xs text-[#C53030] dark:text-red-300 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LISTADO DE PETICIONES */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#102438] rounded-[14px] p-6 border border-[#D9E2EC] dark:border-[#243B53] animate-pulse space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-[#E2E8F0] dark:bg-[#243B53] rounded w-1/4" />
                  <div className="h-5 bg-[#E2E8F0] dark:bg-[#243B53] rounded w-20" />
                </div>
                <div className="h-6 bg-[#E2E8F0] dark:bg-[#243B53] rounded w-3/4" />
                <div className="h-4 bg-[#E2E8F0] dark:bg-[#243B53] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-[#FFFFFF] dark:bg-[#102438] rounded-[16px] border border-[#D9E2EC] dark:border-[#243B53] p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#F0F4F8] dark:bg-[#152E46] text-[#102A43] dark:text-[#D6A84F] flex items-center justify-center mx-auto border border-[#D9E2EC] dark:border-[#243B53]">
              <Compass size={28} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#102A43] dark:text-white">
                No hay peticiones registradas con estos filtros
              </h2>
              <p className="text-xs text-[#627D98] dark:text-[#9FB3C8] max-w-md mx-auto mt-1 leading-relaxed">
                Sé el primero en solicitar lo que necesitas para tus clases en el Centro Tutorial Cereté.
              </p>
            </div>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 bg-[#102A43] hover:bg-[#243B53] text-white dark:bg-[#D6A84F] dark:text-[#102A43] text-xs font-bold rounded-[8px] transition-all inline-flex items-center gap-1.5"
              >
                <Plus size={15} />
                <span>Publicar mi solicitud ahora</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2.5 bg-[#102A43] hover:bg-[#243B53] text-white dark:bg-[#D6A84F] dark:text-[#102A43] text-xs font-bold rounded-[8px] transition-all inline-flex items-center gap-1.5"
              >
                <Sparkles size={15} />
                <span>Inicia sesión para publicar</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const isOwner = user?.id === req.userId;
              const hasOffers = req.offers && req.offers.length > 0;
              const isExpanded = !!expandedRequests[req.id];

              return (
                <article
                  key={req.id}
                  className={`bg-[#FFFFFF] dark:bg-[#102438] rounded-[16px] border transition-all shadow-xs ${
                    req.status === 'RESOLVED'
                      ? 'border-[#D9E2EC] dark:border-[#243B53] opacity-85'
                      : 'border-[#D9E2EC] dark:border-[#243B53] hover:border-[#D6A84F] dark:hover:border-[#D6A84F]'
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Encabezado: Solicitante, Estado y Fecha */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F4F8] dark:border-[#243B53] pb-3.5">
                      <div className="flex items-center gap-2.5">
                        {req.user.avatar ? (
                          <img
                            src={req.user.avatar}
                            alt={req.user.name}
                            className="w-9 h-9 rounded-full object-cover border border-[#D9E2EC] dark:border-[#334E68] shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#102A43] text-[#D6A84F] font-bold text-xs flex items-center justify-center border border-[#334E68] shrink-0">
                            {req.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-bold text-[#1F2933] dark:text-white block leading-tight">
                            {req.user.name}
                          </span>
                          <span className="text-[11px] text-[#627D98] dark:text-[#9FB3C8] flex items-center gap-1 mt-0.5">
                            <GraduationCap size={12} className="text-[#D6A84F]" />
                            {req.career || 'Estudiante Cereté'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {req.status === 'OPEN' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E6F4EA] text-[#2F855A] border border-[#C6F6D5] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Buscando
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F0F4F8] text-[#102A43] border border-[#D9E2EC] dark:bg-[#152E46] dark:text-[#D6A84F] dark:border-[#334E68]">
                            <CheckCircle2 size={12} />
                            Conseguido
                          </span>
                        )}

                        <span className="text-[11px] text-[#9FB3C8] flex items-center gap-1 shrink-0">
                          <Clock size={11} />
                          {new Date(req.createdAt).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Contenido: Título, Presupuesto y Descripción */}
                    <div className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-[#102A43] dark:text-white leading-snug">
                          {req.title}
                        </h2>
                        {req.maxBudget ? (
                          <div className="shrink-0 bg-[#FBF5EA] dark:bg-[#D6A84F]/15 border border-[#D6A84F]/40 text-[#8C6517] dark:text-[#F6E05E] px-3 py-1 rounded-[8px] text-xs font-bold flex items-center gap-1">
                            <DollarSign size={13} />
                            <span>Presupuesto máx: {formatCOP(req.maxBudget)}</span>
                          </div>
                        ) : (
                          <div className="shrink-0 bg-[#F0F4F8] dark:bg-[#152E46] text-[#627D98] dark:text-[#9FB3C8] px-3 py-1 rounded-[8px] text-xs font-medium">
                            Presupuesto a convenir
                          </div>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#486581] dark:text-[#D9E2EC] leading-relaxed whitespace-pre-line">
                        {req.description}
                      </p>
                    </div>

                    {/* Acciones y Ofertas */}
                    <div className="pt-3 border-t border-[#F0F4F8] dark:border-[#243B53] flex flex-wrap items-center justify-between gap-3">
                      {/* Botón expandir ofertas */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(req.id)}
                        className="text-xs font-bold text-[#102A43] dark:text-[#D6A84F] hover:underline flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102A43] rounded"
                      >
                        <MessageSquare size={14} />
                        <span>
                          {req.offers?.length || 0} {req.offers?.length === 1 ? 'oferta recibida' : 'ofertas recibidas'}
                        </span>
                        <ChevronDown
                          size={13}
                          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>

                      <div className="flex items-center gap-2">
                        {/* Responder oferta para compañeros */}
                        {!isOwner && req.status === 'OPEN' && isAuthenticated && (
                          <button
                            type="button"
                            onClick={() => handleOpenOfferModal(req)}
                            className="h-8 px-3.5 bg-[#102A43] hover:bg-[#243B53] text-white dark:bg-[#D6A84F] dark:text-[#102A43] font-bold text-xs rounded-[6px] shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <Send size={12} />
                            <span>Tengo este artículo (Hacer oferta)</span>
                          </button>
                        )}

                        {/* Controles de autor */}
                        {isOwner && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(req)}
                              className={`h-8 px-3 rounded-[6px] text-xs font-bold border transition-colors flex items-center gap-1 ${
                                req.status === 'OPEN'
                                  ? 'border-[#2F855A] text-[#2F855A] hover:bg-[#E6F4EA]'
                                  : 'border-[#102A43] text-[#102A43] dark:border-[#D6A84F] dark:text-[#D6A84F] hover:bg-[#F0F4F8] dark:hover:bg-[#152E46]'
                              }`}
                            >
                              <CheckCircle2 size={13} />
                              <span>{req.status === 'OPEN' ? 'Marcar conseguido' : 'Reabrir'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(req.id)}
                              className="h-8 px-2.5 text-[#C53030] hover:bg-[#FDE8E8] dark:hover:bg-red-950/40 rounded-[6px] text-xs font-medium transition-colors"
                              title="Eliminar petición"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DESPLIEGUE DE OFERTAS EXPANDIDAS */}
                  {isExpanded && (
                    <div className="bg-[#F8FAFC] dark:bg-[#0B1523] p-5 sm:p-6 rounded-b-[16px] border-t border-[#D9E2EC] dark:border-[#243B53] space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#102A43] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare size={13} className="text-[#D6A84F]" />
                          <span>Propuestas de compañeros ({req.offers?.length || 0})</span>
                        </h3>
                      </div>

                      {!hasOffers ? (
                        <p className="text-xs text-[#627D98] dark:text-[#9FB3C8] italic py-2">
                          Aún no hay propuestas registradas para esta petición. Si tienes este artículo o material, ¡sé el primero en responderle al compañero!
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {req.offers.map((offer) => {
                            const isOfferOwner = user?.id === offer.sellerId;
                            const whatsappNum = offer.seller.whatsapp || offer.seller.phone;
                            const whatsappUrl = whatsappNum
                              ? `https://wa.me/${toWhatsAppClean(whatsappNum)}?text=${encodeURIComponent(
                                  `Hola ${offer.seller.name}, vi tu oferta en CampusMarket para mi solicitud de "${req.title}". Me interesa coordinar contigo en el campus.`
                                )}`
                              : null;

                            return (
                              <div
                                key={offer.id}
                                className="bg-[#FFFFFF] dark:bg-[#102438] rounded-[12px] p-4 border border-[#D9E2EC] dark:border-[#243B53] shadow-xs space-y-3"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F4F8] dark:border-[#243B53] pb-2.5">
                                  <div className="flex items-center gap-2">
                                    {offer.seller.avatar ? (
                                      <img
                                        src={offer.seller.avatar}
                                        alt={offer.seller.name}
                                        className="w-7 h-7 rounded-full object-cover border border-[#D9E2EC] dark:border-[#334E68] shrink-0"
                                      />
                                    ) : (
                                      <div className="w-7 h-7 rounded-full bg-[#102A43] text-[#D6A84F] text-[10px] font-bold flex items-center justify-center shrink-0">
                                        {offer.seller.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="text-xs font-bold text-[#1F2933] dark:text-white">
                                      {offer.seller.name}
                                    </span>
                                    {offer.seller.career && (
                                      <span className="text-[10px] text-[#627D98] dark:text-[#9FB3C8]">
                                        • {offer.seller.career}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {offer.price && (
                                      <span className="text-xs font-bold text-[#2F855A] dark:text-emerald-300 bg-[#E6F4EA] dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-[6px] border border-[#C6F6D5] dark:border-emerald-800">
                                        Ofrece: {formatCOP(offer.price)}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-[#9FB3C8]">
                                      {new Date(offer.createdAt).toLocaleDateString('es-CO', {
                                        day: 'numeric',
                                        month: 'short',
                                      })}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-xs text-[#334E68] dark:text-[#D9E2EC] leading-relaxed">
                                  {offer.message}
                                </p>

                                {/* Producto vinculado si existe */}
                                {offer.product && (
                                  <div className="flex items-center gap-3 p-2.5 bg-[#F0F4F8] dark:bg-[#152E46] rounded-[8px] border border-[#D9E2EC] dark:border-[#243B53]">
                                    {offer.product.images?.[0] ? (
                                      <img
                                        src={offer.product.images[0]}
                                        alt={offer.product.title}
                                        className="w-12 h-12 object-cover rounded-[6px] shrink-0"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-[#102A43] text-[#D6A84F] rounded-[6px] flex items-center justify-center font-bold text-xs shrink-0">
                                        CMP
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-[#102A43] dark:text-white truncate">
                                        {offer.product.title}
                                      </p>
                                      <p className="text-[11px] font-bold text-[#D6A84F]">
                                        {formatCOP(offer.product.price)}
                                      </p>
                                    </div>
                                    <Link
                                      to={`/products/${offer.product.id}`}
                                      className="h-7 px-2.5 bg-[#FFFFFF] dark:bg-[#102438] border border-[#D9E2EC] dark:border-[#243B53] text-[#102A43] dark:text-white text-[11px] font-bold rounded-[6px] flex items-center gap-1 hover:bg-[#E2E8F0] dark:hover:bg-[#1D3D5D] shrink-0 transition-colors"
                                    >
                                      <span>Ver artículo</span>
                                      <ExternalLink size={10} />
                                    </Link>
                                  </div>
                                )}

                                {/* Botón de contacto para el autor de la petición */}
                                <div className="flex items-center justify-between pt-1">
                                  {whatsappUrl ? (
                                    <a
                                      href={whatsappUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:text-[#1EBE5D] transition-colors"
                                    >
                                      <MessageCircle size={14} />
                                      <span>Hablar por WhatsApp con el compañero</span>
                                    </a>
                                  ) : (
                                    <span className="text-[11px] text-[#9FB3C8]">Contacto mediante perfil de campus</span>
                                  )}

                                  {isOfferOwner && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOffer(offer.id)}
                                      className="text-[11px] text-[#C53030] hover:underline flex items-center gap-1 ml-auto"
                                    >
                                      <Trash2 size={11} />
                                      <span>Retirar mi oferta</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL: PUBLICAR NUEVA PETICIÓN */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Publicar lo que buscas en el Campus"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <p className="text-xs text-[#627D98] dark:text-[#9FB3C8]">
            Detalla claramente el artículo, libro, calculadora o material que requieres para tus clases en el Centro Tutorial Cereté.
          </p>

          {createError && (
            <div className="p-3 bg-[#FDE8E8] dark:bg-red-950/40 border border-[#F8B4B4] dark:border-red-800 rounded-[8px] text-xs text-[#C53030] dark:text-red-300 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] dark:text-[#D9E2EC] mb-1">
              ¿Qué estás buscando? *
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ej: Libro de Cálculo Stewart 7ma edición o Bata de laboratorio blanca"
              className="w-full h-10 px-3 bg-[#FFFFFF] dark:bg-[#152E46] border border-[#D9E2EC] dark:border-[#243B53] rounded-[8px] text-xs text-[#1F2933] dark:text-white placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] dark:text-[#D9E2EC] mb-1">
              Descripción y detalles *
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              placeholder="Especifica edición, estado aceptable (usado o nuevo), talla o semestre en que lo requieres..."
              className="w-full p-3 bg-[#FFFFFF] dark:bg-[#152E46] border border-[#D9E2EC] dark:border-[#243B53] rounded-[8px] text-xs text-[#1F2933] dark:text-white placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] dark:text-[#D9E2EC] mb-1">
                Presupuesto Máximo (COP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#627D98]">$</span>
                <input
                  type="text"
                  value={newBudget}
                  onChange={(e) => setNewBudget(formatCOPInput(e.target.value))}
                  placeholder="35.000"
                  className="w-full h-10 pl-7 pr-3 bg-[#FFFFFF] dark:bg-[#152E46] border border-[#D9E2EC] dark:border-[#243B53] rounded-[8px] text-xs text-[#1F2933] dark:text-white placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                />
              </div>
              <span className="text-[10px] text-[#627D98] mt-1 block">Opcional (déjalo vacío si es a convenir)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] dark:text-[#D9E2EC] mb-1">
                Carrera / Programa
              </label>
              <input
                type="text"
                value={newCareer}
                onChange={(e) => setNewCareer(e.target.value)}
                placeholder={user?.career || 'Ej: Ingeniería de Sistemas'}
                className="w-full h-10 px-3 bg-[#FFFFFF] dark:bg-[#152E46] border border-[#D9E2EC] dark:border-[#243B53] rounded-[8px] text-xs text-[#1F2933] dark:text-white placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              />
              <span className="text-[10px] text-[#627D98] mt-1 block">Para identificar tu facultad</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#D9E2EC] dark:border-[#243B53]">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="h-10 px-4 rounded-[8px] text-xs font-semibold text-[#627D98] hover:bg-[#F5F7FA] dark:hover:bg-[#152E46] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingRequest}
              className="h-10 px-5 bg-[#102A43] hover:bg-[#243B53] text-white dark:bg-[#D6A84F] dark:text-[#102A43] font-bold text-xs rounded-[8px] shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{isSubmittingRequest ? 'Publicando...' : 'Publicar Solicitud'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RESPONDER OFERTA A PETICIÓN */}
      <Modal
        isOpen={!!activeRequestForOffer}
        onClose={() => setActiveRequestForOffer(null)}
        title={`Hacer oferta a: ${activeRequestForOffer?.title || ''}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitOffer} className="space-y-4">
          <p className="text-xs text-[#627D98] dark:text-[#9FB3C8]">
            Proponle tu artículo al compañero. Puedes adjuntar un precio propuesto y vincular una publicación existente.
          </p>

          {offerError && (
            <div className="p-3 bg-[#FDE8E8] dark:bg-red-950/40 border border-[#F8B4B4] dark:border-red-800 rounded-[8px] text-xs text-[#C53030] dark:text-red-300 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{offerError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] dark:text-[#D9E2EC] mb-1">
              Mensaje de tu oferta *
            </label>
            <textarea
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              rows={3}
              placeholder="Ej: Tengo el libro en excelente estado, con portada forrada. Te lo puedo llevar mañana a la biblioteca..."
              className="w-full p-3 bg-[#FFFFFF] dark:bg-[#152E46] border border-[#D9E2EC] dark:border-[#243B53] rounded-[8px] text-xs text-[#1F2933] dark:text-white placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] dark:text-[#D9E2EC] mb-1">
              Precio que le ofreces (COP)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#627D98]">$</span>
              <input
                type="text"
                value={offerPrice}
                onChange={(e) => setOfferPrice(formatCOPInput(e.target.value))}
                placeholder="Ej: 30.000"
                className="w-full h-10 pl-7 pr-3 bg-[#FFFFFF] dark:bg-[#152E46] border border-[#D9E2EC] dark:border-[#243B53] rounded-[8px] text-xs text-[#1F2933] dark:text-white placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              />
            </div>
          </div>

          {/* Selector de producto publicado si es vendedor */}
          {myProducts.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] dark:text-[#D9E2EC] mb-1">
                Vincular publicación existente (opcional)
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-10 px-3 bg-[#FFFFFF] dark:bg-[#152E46] border border-[#D9E2EC] dark:border-[#243B53] rounded-[8px] text-xs text-[#1F2933] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              >
                <option value="">-- No vincular producto --</option>
                {myProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({formatCOP(p.price)})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-[#627D98] mt-1 block">
                Permite al solicitante ver tus fotos y comprar con 1 clic
              </span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#D9E2EC] dark:border-[#243B53]">
            <button
              type="button"
              onClick={() => setActiveRequestForOffer(null)}
              className="h-10 px-4 rounded-[8px] text-xs font-semibold text-[#627D98] hover:bg-[#F5F7FA] dark:hover:bg-[#152E46] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingOffer}
              className="h-10 px-5 bg-[#102A43] hover:bg-[#243B53] text-white dark:bg-[#D6A84F] dark:text-[#102A43] font-bold text-xs rounded-[8px] shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{isSubmittingOffer ? 'Enviando...' : 'Enviar Propuesta'}</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
