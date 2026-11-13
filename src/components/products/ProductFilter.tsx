import React from 'react';
import { Category, ProductCondition } from '../../types';
import {
  Search,
  Filter,
  RotateCcw,
  Layers,
  BookOpen,
  Laptop,
  PenTool,
  Utensils,
  Shirt,
  Printer,
  Backpack,
  LayoutGrid,
} from 'lucide-react';
import { formatCOPInput } from '../../utils/format';

interface ProductFilterProps {
  categories: Category[];
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  condition: ProductCondition | '';
  onConditionChange: (cond: ProductCondition | '') => void;
  minPrice: string;
  onMinPriceChange: (val: string) => void;
  maxPrice: string;
  onMaxPriceChange: (val: string) => void;
  onReset: () => void;
  totalProducts?: number;
}

const getCategoryIcon = (nameOrSlug: string, isSelected: boolean) => {
  const s = nameOrSlug.toLowerCase();
  const iconProps = {
    size: 14,
    className: isSelected ? 'text-[#D6A84F]' : 'text-[#627D98]',
  };
  if (s.includes('libro')) return <BookOpen {...iconProps} />;
  if (s.includes('tecno') || s.includes('calcula')) return <Laptop {...iconProps} />;
  if (s.includes('papel') || s.includes('útil')) return <PenTool {...iconProps} />;
  if (s.includes('snack') || s.includes('comida')) return <Utensils {...iconProps} />;
  if (s.includes('ropa') || s.includes('merch')) return <Shirt {...iconProps} />;
  if (s.includes('servici') || s.includes('impresi')) return <Printer {...iconProps} />;
  return <Backpack {...iconProps} />;
};

export const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  condition,
  onConditionChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  onReset,
  totalProducts,
}) => {
  const hasActiveFilters =
    search || selectedCategory || condition || minPrice || maxPrice;

  return (
    <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] shadow-sm p-5 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627D98]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar libros, calculadoras, útiles, snacks..."
          className="w-full pl-10 pr-16 h-11 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] placeholder-[#627D98] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] transition-colors"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627D98] hover:text-[#102A43] text-xs font-semibold"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Category Horizontal Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#1F2933] uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={13} className="text-[#D6A84F]" />
            <span>Categorías Universitarias</span>
          </span>
          {totalProducts !== undefined && (
            <span className="text-xs text-[#627D98] font-medium">
              {totalProducts} producto{totalProducts !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onCategoryChange('')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === ''
                ? 'bg-[#102A43] text-white shadow-sm'
                : 'bg-[#F5F7FA] text-[#627D98] hover:bg-[#E2E8F0] hover:text-[#1F2933] border border-[#D9E2EC]'
            }`}
          >
            <LayoutGrid size={13} className={selectedCategory === '' ? 'text-[#D6A84F]' : 'text-[#627D98]'} />
            <span>Todas</span>
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#102A43] text-white shadow-sm'
                    : 'bg-[#F5F7FA] text-[#627D98] hover:bg-[#E2E8F0] hover:text-[#1F2933] border border-[#D9E2EC]'
                }`}
              >
                {getCategoryIcon(cat.name, isSelected)}
                <span>{cat.name}</span>
                {cat._count?.products !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-[6px] ${
                      isSelected
                        ? 'bg-[#243B53] text-[#D6A84F] font-bold'
                        : 'bg-[#D9E2EC] text-[#627D98]'
                    }`}
                  >
                    {cat._count.products}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category, Condition & Price Range Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[#D9E2EC]">
        {/* Category Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-[#1F2933] mb-1.5 flex items-center gap-1">
            <Layers size={12} className="text-[#627D98]" /> Categoría
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-xs font-medium text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} {cat._count?.products !== undefined ? `(${cat._count.products})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Filter */}
        <div>
          <label className="block text-xs font-semibold text-[#1F2933] mb-1.5 flex items-center gap-1">
            <Filter size={12} className="text-[#627D98]" /> Condición
          </label>
          <select
            value={condition}
            onChange={(e) => onConditionChange(e.target.value as ProductCondition | '')}
            className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-xs font-medium text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
          >
            <option value="">Todas las condiciones</option>
            <option value="NUEVO">Nuevo</option>
            <option value="COMO_NUEVO">Como nuevo</option>
            <option value="USADO_BUENO">Usado - Buen estado</option>
            <option value="USADO_REGULAR">Usado - Regular</option>
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-xs font-semibold text-[#1F2933] mb-1.5">
            Precio Mínimo (COP)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#627D98] font-bold text-xs">$</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="10.000"
              value={minPrice}
              onChange={(e) => onMinPriceChange(formatCOPInput(e.target.value))}
              className="w-full h-10 pl-7 pr-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-xs font-semibold text-[#1F2933] placeholder-[#627D98] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
            />
          </div>
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-xs font-semibold text-[#1F2933] mb-1.5">
            Precio Máximo (COP)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#627D98] font-bold text-xs">$</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="200.000"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(formatCOPInput(e.target.value))}
              className="w-full h-10 pl-7 pr-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-xs font-semibold text-[#1F2933] placeholder-[#627D98] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
            />
          </div>
        </div>
      </div>

      {/* Reset button if active */}
      {hasActiveFilters && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onReset}
            className="text-xs text-[#627D98] hover:text-[#102A43] flex items-center gap-1.5 font-semibold py-1.5 px-3 rounded-[8px] hover:bg-[#F5F7FA] transition-colors"
          >
            <RotateCcw size={12} />
            Restablecer todos los filtros
          </button>
        </div>
      )}
    </div>
  );
};
