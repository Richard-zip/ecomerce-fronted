import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Camera,
  Search,
  Sparkles,
} from 'lucide-react';

interface Product360ViewerProps {
  images: string[];
  title?: string;
  className?: string;
  badge?: React.ReactNode;
  isSoldOut?: boolean;
}

export const Product360Viewer: React.FC<Product360ViewerProps> = ({
  images,
  title = 'Producto',
  className = '',
  badge,
  isSoldOut = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Hover Zoom States (Zoom automático al pasar el cursor)
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [zoomScale, setZoomScale] = useState(2.3);

  // Fullscreen modal state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenHovered, setIsFullscreenHovered] = useState(false);
  const [fullscreenMousePos, setFullscreenMousePos] = useState({ x: 50, y: 50 });

  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  const activeImages =
    images && images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'];
  const totalImages = activeImages.length;
  const hasMultiple = totalImages > 1;

  // Manejo del movimiento del mouse sobre la imagen principal
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Manejo táctil para móviles (deslizar el dedo para hacer zoom)
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      setMousePos({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
      setIsHovered(true);
    }
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
  };

  // Manejadores para el modo pantalla completa
  const handleFullscreenMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFullscreenMousePos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  // Cambiar foto / ángulo
  const handleSelectIndex = (idx: number) => {
    setCurrentIndex(idx);
    setIsHovered(false);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
    setIsHovered(false);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % totalImages);
    setIsHovered(false);
  };

  // Navegación por teclado (Flechas para pasar fotos)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && hasMultiple) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && hasMultiple) {
        handlePrev();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultiple, totalImages, isFullscreen]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Contenedor Principal de la Foto con Zoom al pasar el cursor */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative aspect-4/3 w-full rounded-[14px] overflow-hidden bg-[#F5F7FA] border border-[#D9E2EC] shadow-sm select-none group/viewer flex items-center justify-center ${
          isHovered ? 'cursor-crosshair' : 'cursor-zoom-in'
        }`}
      >
        {/* Imagen con Zoom Automático centrado en la posición del cursor */}
        <div
          className="w-full h-full flex items-center justify-center overflow-hidden"
          style={{
            transform: isHovered ? `scale(${zoomScale})` : 'scale(1)',
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            transition: isHovered
              ? 'transform-origin 0.05s ease-out, transform 0.15s ease-out'
              : 'transform 0.25s ease-out, transform-origin 0.25s ease-out',
          }}
        >
          <img
            src={activeImages[currentIndex]}
            alt={`${title} - Foto ${currentIndex + 1}`}
            className="w-full h-full object-contain pointer-events-none"
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800';
            }}
          />
        </div>

        {/* Badge Indicador de Foto Actual y Condición (Superior Izquierdo) */}
        <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none flex items-center gap-2">
          {badge}
          {hasMultiple && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#102A43]/90 text-white backdrop-blur-xs text-xs font-bold shadow-sm border border-white/20">
              <Camera size={13} className="text-[#D6A84F]" />
              <span>Foto {currentIndex + 1} de {totalImages}</span>
            </span>
          )}
        </div>

        {/* Indicador de Zoom y Botón Pantalla Completa (Superior Derecho) */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-[10px] border border-[#D9E2EC] shadow-sm pointer-events-auto">
          {isHovered ? (
            <span className="text-[11px] font-bold text-[#102A43] flex items-center gap-1">
              <Search size={13} className="text-[#D6A84F]" />
              <span>Zoom {zoomScale}x</span>
            </span>
          ) : (
            <span className="text-[11px] font-medium text-[#627D98] flex items-center gap-1">
              <Search size={13} className="text-[#102A43]" />
              <span>Pasa el cursor para zoom</span>
            </span>
          )}

          <div className="w-px h-3.5 bg-[#D9E2EC] mx-1" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            className="p-1 rounded-[6px] text-[#102A43] hover:bg-[#F5F7FA] transition-colors"
            title="Ver en pantalla completa"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Overlay Producto Agotado */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-[#102A43]/50 backdrop-blur-xs flex items-center justify-center z-20 pointer-events-none">
            <span className="bg-[#C53030] text-white font-bold px-4 py-2 rounded-[8px] uppercase tracking-wider text-sm shadow-sm">
              Producto Agotado
            </span>
          </div>
        )}

        {/* Flechas Laterales de Navegación (Pasan a la foto anterior / siguiente) */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#102A43] border border-[#D9E2EC] flex items-center justify-center shadow-md transition-all hover:scale-105 z-20"
              aria-label="Ver foto anterior"
              title="Foto anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#102A43] border border-[#D9E2EC] flex items-center justify-center shadow-md transition-all hover:scale-105 z-20"
              aria-label="Ver foto siguiente"
              title="Foto siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas de Fotos desde Diferentes Ángulos */}
      {hasMultiple && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 overflow-x-auto py-1">
            {activeImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectIndex(idx)}
                className={`relative w-20 h-20 rounded-[10px] overflow-hidden border-2 transition-all shrink-0 bg-[#FFFFFF] ${
                  currentIndex === idx
                    ? 'border-[#102A43] ring-2 ring-[#102A43]/20 shadow-sm scale-102'
                    : 'border-[#D9E2EC] hover:border-[#102A43]/60 opacity-70 hover:opacity-100'
                }`}
                title={`Ver foto ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-[#102A43]/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] backdrop-blur-xs">
                  #{idx + 1}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#627D98] flex items-center gap-1.5 pt-0.5">
            <Sparkles size={12} className="text-[#D6A84F]" />
            <span>Pasa el cursor sobre la foto para ampliar detalles con la lupa automática.</span>
          </p>
        </div>
      )}

      {/* MODAL PANTALLA COMPLETA CON ZOOM AL PASAR EL CURSOR */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#102A43]/90 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="bg-[#FFFFFF] rounded-[20px] max-w-5xl w-full p-5 sm:p-6 shadow-2xl border border-white/20 relative space-y-4 max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-[8px] bg-[#102A43] text-[#D6A84F]">
                  <Camera size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#102A43] leading-tight">
                    {title}
                  </h3>
                  <p className="text-xs text-[#627D98]">
                    Foto {currentIndex + 1} de {totalImages} • Pasa el cursor para ver en máxima definición
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-[8px] bg-[#F5F7FA] hover:bg-[#D9E2EC] text-[#102A43] transition-colors"
                title="Cerrar (Esc)"
              >
                <Minimize2 size={18} />
              </button>
            </div>

            {/* Lienzo Grande del Producto con Zoom al pasar el cursor */}
            <div
              ref={fullscreenContainerRef}
              onMouseMove={handleFullscreenMouseMove}
              onMouseEnter={() => setIsFullscreenHovered(true)}
              onMouseLeave={() => setIsFullscreenHovered(false)}
              className={`relative flex-1 min-h-[50vh] max-h-[70vh] w-full rounded-[14px] overflow-hidden bg-[#F5F7FA] flex items-center justify-center border border-[#D9E2EC] ${
                isFullscreenHovered ? 'cursor-crosshair' : 'cursor-zoom-in'
              }`}
            >
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden"
                style={{
                  transform: isFullscreenHovered ? `scale(${zoomScale + 0.5})` : 'scale(1)',
                  transformOrigin: `${fullscreenMousePos.x}% ${fullscreenMousePos.y}%`,
                  transition: isFullscreenHovered
                    ? 'transform-origin 0.05s ease-out, transform 0.15s ease-out'
                    : 'transform 0.25s ease-out, transform-origin 0.25s ease-out',
                }}
              >
                <img
                  src={activeImages[currentIndex]}
                  alt={`${title} - Foto ${currentIndex + 1}`}
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>

              {/* Badge Informativo en Fullscreen */}
              <div className="absolute top-4 left-4 bg-[#102A43]/90 text-white px-3 py-1.5 rounded-[8px] text-xs font-bold backdrop-blur-xs flex items-center gap-2 border border-white/20 pointer-events-none">
                <Search size={13} className="text-[#D6A84F]" />
                <span>
                  {isFullscreenHovered ? `Lupa activa (${zoomScale + 0.5}x)` : 'Mueve el cursor para ampliar detalles'}
                </span>
              </div>

              {/* Flechas de Navegación en Pantalla Completa */}
              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-[#102A43] border border-[#D9E2EC] flex items-center justify-center shadow-lg transition-all hover:scale-105 z-20"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-[#102A43] border border-[#D9E2EC] flex items-center justify-center shadow-lg transition-all hover:scale-105 z-20"
                    aria-label="Foto siguiente"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas en Pantalla Completa */}
            {hasMultiple && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0 justify-center">
                {activeImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectIndex(idx)}
                    className={`w-16 h-16 rounded-[8px] overflow-hidden border-2 transition-all shrink-0 bg-white ${
                      currentIndex === idx
                        ? 'border-[#102A43] ring-2 ring-[#102A43]/20 shadow-sm'
                        : 'border-[#D9E2EC] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
