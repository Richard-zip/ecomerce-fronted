import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsService } from '../services/products.service';
import { categoriesService } from '../services/categories.service';
import { Product, Category, ProductCondition } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilter } from '../components/products/ProductFilter';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { parseCOP } from '../utils/format';
import {
  Sparkles,
  ShoppingBag,
  Plus,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Laptop,
  PenTool,
  Utensils,
  Shirt,
  Printer,
  Backpack,
  RotateCcw,
  Layers,
} from 'lucide-react';

const getCategoryIcon = (nameOrSlug: string, isSelected: boolean) => {
  const s = nameOrSlug.toLowerCase();
  const iconProps = {
    size: 20,
    className: isSelected ? 'text-[#D6A84F]' : 'text-[#102A43]',
  };
  if (s.includes('libro')) return <BookOpen {...iconProps} />;
  if (s.includes('tecno') || s.includes('calcula')) return <Laptop {...iconProps} />;
  if (s.includes('papel') || s.includes('útil')) return <PenTool {...iconProps} />;
  if (s.includes('snack') || s.includes('comida')) return <Utensils {...iconProps} />;
  if (s.includes('ropa') || s.includes('merch')) return <Shirt {...iconProps} />;
  if (s.includes('servici') || s.includes('impresi')) return <Printer {...iconProps} />;
  return <Backpack {...iconProps} />;
};

export const HomePage: React.FC = () => {
  const { isAuthenticated, isSeller } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [condition, setCondition] = useState<ProductCondition | ''>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Cargar categorías universitarias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesService.getCategories();
        setCategories(data);
      } catch (err) {
        console.warn('Error al cargar categorías:', err);
      }
    };
    fetchCategories();
  }, []);

  // Cargar catálogo de productos
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const parsedMin = minPrice ? parseCOP(minPrice) : undefined;
      const parsedMax = maxPrice ? parseCOP(maxPrice) : undefined;

      const res = await productsService.getProducts({
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        condition: condition || undefined,
        minPrice: parsedMin && parsedMin > 0 ? parsedMin : undefined,
        maxPrice: parsedMax && parsedMax > 0 ? parsedMax : undefined,
        page,
        limit: 12,
      });

      setProducts(Array.isArray(res?.products) ? res.products : []);
      setTotalPages(res?.pagination?.totalPages || 1);
      setTotalProducts(res?.pagination?.total || 0);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setProducts([]);
      setError(
        err.message ||
          'No se pudo conectar con el servidor.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, condition, minPrice, maxPrice, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Restablecer filtros
  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <div className="min-w-0 pb-16">
      {/* Hero Banner Universitario */}
      <section className="relative overflow-hidden bg-[#102A43] text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-[#243B53]">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[#243B53] border border-[#D6A84F]/40 text-[#D6A84F] text-xs font-semibold mb-3">
              <Sparkles size={13} className="text-[#D6A84F] shrink-0" />
              <span>Compra local · Centro Tutorial Cereté</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight max-w-xl">
              Lo que necesitas, <span className="text-[#D6A84F]">entre estudiantes.</span>
            </h1>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-[#D9E2EC] leading-relaxed font-normal max-w-xl">
              Compra y vende en el Centro Tutorial Cereté. Fácil, cerca y entre compañeros.
            </p>
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href="#catalogo-productos"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('catalogo-productos')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#D6A84F] hover:bg-[#C99A40] text-[#102A43] font-bold text-xs sm:text-sm shadow-xs transition-colors"
              >
                <ShoppingBag size={16} />
                <span>Explorar productos</span>
              </a>
              <Link
                to={isAuthenticated && isSeller ? '/seller?action=new' : isAuthenticated ? '/seller' : '/login'}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#243B53] hover:bg-[#1B2D3F] border border-[#334E68] hover:border-[#D6A84F] text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
              >
                <Plus size={16} className="text-[#D6A84F]" />
                <span>Publicar producto</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div id="catalogo-productos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 space-y-6">
        {/* Showcase Visual de Categorías Universitarias */}
        {categories.length > 0 && (
          <section className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-[12px] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#102A43] tracking-tight flex items-center gap-2">
                  <Layers size={16} className="text-[#D6A84F]" />
                  <span>Explorar por Categoría</span>
                </h2>
                <p className="text-xs text-[#627D98]">
                 Haz clic en una categoría para filtrar el catálogo
                </p>
              </div>
              {selectedCategory && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setPage(1);
                  }}
                  className="text-xs font-semibold text-[#102A43] hover:text-[#243B53] flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#F0F4F8] hover:bg-[#E2E8F0] transition-colors"
                >
                  <RotateCcw size={12} className="text-[#D6A84F]" />
                  <span>Ver todas</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(isSelected ? '' : cat.id);
                      setPage(1);
                    }}
                    className={`p-3 rounded-[10px] border text-center transition-all flex flex-col items-center justify-center gap-2 group ${
                      isSelected
                        ? 'border-[#102A43] bg-[#102A43] text-white shadow-sm ring-2 ring-[#D6A84F]'
                        : 'border-[#D9E2EC] bg-[#F8FAFC] text-[#1F2933] hover:border-[#102A43] hover:bg-[#FFFFFF] hover:shadow-xs'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-[8px] flex items-center justify-center transition-transform group-hover:scale-110 ${
                        isSelected ? 'bg-[#243B53]' : 'bg-[#E2E8F0]'
                      }`}
                    >
                      {getCategoryIcon(cat.name, isSelected)}
                    </div>
                    <div className="w-full">
                      <span className="block text-xs font-bold leading-tight truncate">
                        {cat.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Filters and Search Bar */}
        <ProductFilter
          categories={categories}
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          selectedCategory={selectedCategory}
          onCategoryChange={(id) => {
            setSelectedCategory(id);
            setPage(1);
          }}
          condition={condition}
          onConditionChange={(cond) => {
            setCondition(cond);
            setPage(1);
          }}
          minPrice={minPrice}
          onMinPriceChange={(val) => {
            setMinPrice(val);
            setPage(1);
          }}
          maxPrice={maxPrice}
          onMaxPriceChange={(val) => {
            setMaxPrice(val);
            setPage(1);
          }}
          onReset={handleResetFilters}
          totalProducts={totalProducts}
        />

        {/* Backend offline or error alert */}
        {error && (
          <div className="bg-[#FDE8E8] border border-[#C53030]/20 rounded-[12px] p-6 text-[#C53030] flex items-start gap-4">
            <AlertCircle size={24} className="shrink-0 mt-0.5 text-[#C53030]" />
            <div className="space-y-2">
              <h4 className="font-bold text-base">No se pudo cargar el catálogo de productos</h4>
              <p className="text-xs text-[#C53030] leading-relaxed">{error}</p>
              <div className="pt-1 flex items-center gap-3">
                <button
                  onClick={fetchProducts}
                  className="px-4 py-2 bg-[#C53030] hover:bg-[#9B2C2C] text-white text-xs font-semibold rounded-[8px] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw size={13} /> Reintentar conexión
                </button>
                <span className="text-xs text-[#627D98] font-medium">
                  Tip: Inicia el backend ejecutando <code className="bg-[#FFFFFF] border border-[#D9E2EC] px-1.5 py-0.5 rounded font-mono text-[#1F2933]">npm run dev</code> en la carpeta del backend.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (products && products.length > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : !error ? (
          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-10 text-center max-w-lg mx-auto my-8 space-y-4 shadow-sm">
            <div className="w-14 h-14 bg-[#F5F7FA] text-[#102A43] rounded-[8px] flex items-center justify-center mx-auto border border-[#D9E2EC]">
              <ShoppingBag size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1F2933]">
                {search || selectedCategory || condition || minPrice || maxPrice
                  ? 'No se encontraron productos'
                  : 'Aún no hay productos publicados en el campus'}
              </h3>
              <p className="text-xs text-[#627D98] mt-1.5 leading-relaxed">
                {search || selectedCategory || condition || minPrice || maxPrice
                  ? 'Intenta ajustar o limpiar tus filtros de búsqueda para encontrar publicaciones universitarias.'
                  : 'Sé el primero en publicar libros, apuntes, tecnología o útiles académicos para la comunidad del Centro Tutorial Cereté.'}
              </p>
            </div>
            {search || selectedCategory || condition || minPrice || maxPrice ? (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#102A43] hover:bg-[#243B53] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm"
              >
                Restablecer filtros
              </button>
            ) : (
              <Link
                to={isAuthenticated && isSeller ? '/seller?action=new' : isAuthenticated ? '/seller' : '/login'}
                className="inline-block px-4 py-2 bg-[#102A43] hover:bg-[#243B53] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm"
              >
                {isAuthenticated && isSeller ? 'Publicar un producto' : 'Iniciar sesión para publicar'}
              </Link>
            )}
          </div>
        ) : null}

        {/* Pagination controls */}
        {totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-center gap-3 pt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3.5 py-2 rounded-[8px] border border-[#D9E2EC] bg-[#FFFFFF] text-[#102A43] hover:bg-[#F5F7FA] disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="text-xs font-semibold text-[#627D98] px-3">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3.5 py-2 rounded-[8px] border border-[#D9E2EC] bg-[#FFFFFF] text-[#102A43] hover:bg-[#F5F7FA] disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
