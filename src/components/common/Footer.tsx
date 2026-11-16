import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#102A43] text-[#D9E2EC] mt-16 border-t border-[#243B53]">
      {/* Sección superior: Tres columnas informativas equilibradas */}
      <div id="como-funciona" className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Columna 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-[8px] bg-[#243B53] border border-[#334E68] flex items-center justify-center text-[#D6A84F] shrink-0">
                <MapPin size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-semibold text-sm leading-snug">
                  Entregas en el campus
                </h4>
                <p className="text-xs text-[#9FB3C8] leading-relaxed">
                  Coordina la entrega en un punto del Centro Tutorial Cereté.
                </p>
              </div>
            </div>

            {/* Columna 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-[8px] bg-[#243B53] border border-[#334E68] flex items-center justify-center text-[#D6A84F] shrink-0">
                <MessageSquare size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-semibold text-sm leading-snug">
                  Coordina directamente
                </h4>
                <p className="text-xs text-[#9FB3C8] leading-relaxed">
                  Acuerda horario y lugar con el vendedor por WhatsApp.
                </p>
              </div>
            </div>

            {/* Columna 3 */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-[8px] bg-[#243B53] border border-[#334E68] flex items-center justify-center text-[#D6A84F] shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-semibold text-sm leading-snug">
                  Compra con confianza
                </h4>
                <p className="text-xs text-[#9FB3C8] leading-relaxed">
                  Revisa la información del vendedor antes de concretar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Franja inferior separada por borde sutil */}
      <div className="border-t border-[#243B53] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Identidad institucional izquierda */}
            <div>
              <span className="font-bold text-base tracking-tight text-white block">
                Campus<span className="text-[#D6A84F]">Market</span>
              </span>
              <p className="text-xs text-[#9FB3C8] mt-0.5">
                Compra y venta entre estudiantes del Centro Tutorial Cereté.
              </p>
            </div>

            {/* Enlaces compactos derecha (rutas y acciones existentes) */}
            <nav className="flex items-center gap-5 text-xs text-[#9FB3C8]">
              <Link
                to="/"
                onClick={() => {
                  if (window.location.pathname === '/') {
                    document.getElementById('catalogo-productos')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="hover:text-white transition-colors"
              >
                Explorar productos
              </Link>
              <Link
                to="/requests"
                className="hover:text-white transition-colors"
              >
                Mural Estudiantil
              </Link>
              <a
                href="#como-funciona"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors"
              >
                Cómo funciona
              </a>
            </nav>
          </div>

          {/* Línea final de derechos reservados */}
          <div className="pt-4 border-t border-[#243B53]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#9FB3C8]">
            <p>© {currentYear} CampusMarket · Centro Tutorial Cereté. Todos los derechos reservados.</p>
            <p className="text-[#829AB1]">Comunidad universitaria</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
