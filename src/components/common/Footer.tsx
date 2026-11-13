import React from 'react';
import { ShieldCheck, MapPin, MessageSquare, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#102A43] text-[#D9E2EC] mt-16 border-t border-[#243B53]">
      {/* Campus security & tips bar */}
      <div className="border-b border-[#243B53] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-[8px] bg-[#243B53] text-[#D6A84F] shrink-0 border border-[#334E68]">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Entregas en Centro Tutorial Cereté</h4>
                <p className="text-xs text-[#9FB3C8] mt-1 leading-relaxed">
                  Todos los pedidos se recogen en las instalaciones del Centro Tutorial Cereté (cafetería, biblioteca o portería).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-[8px] bg-[#243B53] text-[#D6A84F] shrink-0 border border-[#334E68]">
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Coordinación por WhatsApp</h4>
                <p className="text-xs text-[#9FB3C8] mt-1 leading-relaxed">
                  Comunícate directamente con tu compañero vendedor para acordar horarios de entrega entre clases.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-[8px] bg-[#243B53] text-[#D6A84F] shrink-0 border border-[#334E68]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Comunidad de Confianza</h4>
                <p className="text-xs text-[#9FB3C8] mt-1 leading-relaxed">
                  Revisa las valoraciones y la carrera universitaria de cada vendedor antes de acordar una compra.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer notes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <p className="text-white font-semibold">CampusMarket 🎓 Centro Tutorial Cereté</p>
          <p className="text-[#9FB3C8] mt-0.5">
            Plataforma estudiantil para compra y venta de materiales académicos en Pesos Colombianos (COP).
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[#9FB3C8]">
          <span>Comunidad universitaria</span>
          <span className="text-[#D6A84F]">•</span>
          <span>Centro Tutorial Cereté</span>
        </div>
      </div>
    </footer>
  );
};
