import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Plus, MessageSquare, Clock, GraduationCap, DollarSign, Sparkles } from 'lucide-react';
import { requestsService } from '../../services/requests.service';
import { StudentRequest } from '../../types';
import { formatCOP } from '../../utils/format';

export const MuralShowcase: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [recentRequests, setRecentRequests] = useState<StudentRequest[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    requestsService
      .getRequests({ limit: 3, status: 'OPEN' })
      .then((res) => {
        if (isMounted) {
          setRecentRequests(res.requests || []);
          setTotalCount(res.pagination?.total || (res.requests ? res.requests.length : 0));
        }
      })
      .catch(() => {
        if (isMounted) {
          setRecentRequests([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      aria-labelledby="mural-showcase-title"
      className={`bg-[#FFFFFF] dark:bg-[#102438] rounded-[16px] border border-[#D9E2EC] dark:border-[#243B53] p-5 sm:p-6 shadow-xs transition-colors space-y-5 ${className}`}
    >
      {/* Encabezado del Mural */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0F4F8] dark:border-[#243B53] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[#243B53] border border-[#334E68] flex items-center justify-center text-[#D6A84F] shrink-0">
              <Compass size={16} />
            </div>
            <h2
              id="mural-showcase-title"
              className="text-base sm:text-lg font-bold text-[#102A43] dark:text-white tracking-tight"
            >
              Mural Estudiantil <span className="text-[#D6A84F]">· Se Busca</span>
            </h2>
            {totalCount > 0 && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F4EA] text-[#2F855A] dark:bg-emerald-950/40 dark:text-emerald-300 border border-[#C6F6D5] dark:border-emerald-800">
                {totalCount} {totalCount === 1 ? 'petición activa' : 'peticiones activas'}
              </span>
            )}
          </div>
          <p className="text-xs text-[#627D98] dark:text-[#9FB3C8] leading-relaxed max-w-2xl">
            ¿No encuentras lo que buscas en el catálogo? Pídelo a tus compañeros o responde a quienes buscan materiales académicos en el Centro Tutorial Cereté.
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/requests?action=new"
            className="h-9 px-3.5 bg-[#D6A84F] hover:bg-[#C99A40] text-[#102A43] font-bold text-xs rounded-[8px] shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Publicar lo que busco</span>
          </Link>
          <Link
            to="/requests"
            className="h-9 px-3.5 bg-[#F0F4F8] dark:bg-[#152E46] hover:bg-[#E2E8F0] dark:hover:bg-[#1D3D5D] text-[#102A43] dark:text-white font-semibold text-xs rounded-[8px] border border-[#D9E2EC] dark:border-[#243B53] transition-colors flex items-center gap-1"
          >
            <span>Ver todo el mural</span>
            <ArrowRight size={13} className="text-[#D6A84F]" />
          </Link>
        </div>
      </div>

      {/* Grid de Peticiones Recientes */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#F8FAFC] dark:bg-[#152E46] rounded-[12px] p-4 border border-[#D9E2EC] dark:border-[#243B53] animate-pulse space-y-3"
            >
              <div className="h-3.5 bg-[#E2E8F0] dark:bg-[#243B53] rounded w-2/3" />
              <div className="h-5 bg-[#E2E8F0] dark:bg-[#243B53] rounded w-4/5" />
              <div className="h-3 bg-[#E2E8F0] dark:bg-[#243B53] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : recentRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {recentRequests.map((req) => (
            <Link
              key={req.id}
              to="/requests"
              className="group bg-[#F8FAFC] dark:bg-[#152E46] hover:bg-[#FFFFFF] dark:hover:bg-[#1A3654] rounded-[12px] p-4 border border-[#D9E2EC] dark:border-[#243B53] hover:border-[#D6A84F] transition-all flex flex-col justify-between space-y-3 shadow-xs hover:shadow-sm"
            >
              <div className="space-y-2">
                {/* Meta de solicitante */}
                <div className="flex items-center justify-between text-[11px] text-[#627D98] dark:text-[#9FB3C8]">
                  <span className="flex items-center gap-1 truncate font-medium max-w-[170px]">
                    <GraduationCap size={12} className="text-[#D6A84F] shrink-0" />
                    <span className="truncate">{req.career || req.user.name}</span>
                  </span>
                  <span className="shrink-0 flex items-center gap-0.5 text-[#9FB3C8]">
                    <Clock size={11} />
                    {new Date(req.createdAt).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                {/* Título y descripción */}
                <div>
                  <h3 className="text-sm font-bold text-[#102A43] dark:text-white leading-snug line-clamp-1 group-hover:text-[#D6A84F] transition-colors">
                    {req.title}
                  </h3>
                  <p className="text-xs text-[#486581] dark:text-[#D9E2EC] line-clamp-2 mt-1 leading-relaxed">
                    {req.description}
                  </p>
                </div>
              </div>

              {/* Presupuesto y ofertas */}
              <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#243B53] flex items-center justify-between text-xs">
                {req.maxBudget ? (
                  <span className="font-bold text-[#8C6517] dark:text-[#F6E05E] text-[11px] bg-[#FBF5EA] dark:bg-[#D6A84F]/15 px-2 py-0.5 rounded-[6px] border border-[#D6A84F]/30">
                    Máx: {formatCOP(req.maxBudget)}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#627D98] dark:text-[#9FB3C8] font-medium">
                    A convenir
                  </span>
                )}

                <span className="text-[11px] font-semibold text-[#102A43] dark:text-[#D6A84F] flex items-center gap-1">
                  <MessageSquare size={12} />
                  <span>{req.offers?.length || 0} {req.offers?.length === 1 ? 'oferta' : 'ofertas'}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Tarjetas ilustrativas para motivar peticiones si no hay */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#152E46] border border-[#D9E2EC] dark:border-[#243B53] space-y-1.5">
            <div className="w-7 h-7 rounded-[6px] bg-[#E2E8F0] dark:bg-[#243B53] text-[#102A43] dark:text-[#D6A84F] flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="text-xs font-bold text-[#102A43] dark:text-white">
              Libros y calculadoras
            </h4>
            <p className="text-[11px] text-[#627D98] dark:text-[#9FB3C8] leading-relaxed">
              Pide libros de cálculo, física, calculadoras científicas y apuntes de semestres anteriores.
            </p>
          </div>

          <div className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#152E46] border border-[#D9E2EC] dark:border-[#243B53] space-y-1.5">
            <div className="w-7 h-7 rounded-[6px] bg-[#E2E8F0] dark:bg-[#243B53] text-[#102A43] dark:text-[#D6A84F] flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="text-xs font-bold text-[#102A43] dark:text-white">
              Batas y materiales
            </h4>
            <p className="text-[11px] text-[#627D98] dark:text-[#9FB3C8] leading-relaxed">
              Consigue equipo de laboratorio, útiles de dibujo técnico y herramientas para tus clases.
            </p>
          </div>

          <div className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#152E46] border border-[#D9E2EC] dark:border-[#243B53] space-y-1.5">
            <div className="w-7 h-7 rounded-[6px] bg-[#E2E8F0] dark:bg-[#243B53] text-[#102A43] dark:text-[#D6A84F] flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="text-xs font-bold text-[#102A43] dark:text-white">
              Responde y coordina
            </h4>
            <p className="text-[11px] text-[#627D98] dark:text-[#9FB3C8] leading-relaxed">
              Si tienes artículos que no utilizas, propón una oferta y coordina la entrega en el campus Cereté.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
