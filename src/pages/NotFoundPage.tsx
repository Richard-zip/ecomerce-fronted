import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-center">
      <div className="max-w-md space-y-5 bg-[#FFFFFF] p-8 rounded-[12px] border border-[#D9E2EC] shadow-sm">
        <div className="w-16 h-16 bg-[#F0F4F8] text-[#102A43] rounded-[8px] flex items-center justify-center mx-auto border border-[#D9E2EC]">
          <GraduationCap size={36} />
        </div>
        <h1 className="text-4xl font-bold text-[#102A43]">404</h1>
        <h2 className="text-lg font-bold text-[#1F2933]">Página no encontrada en el campus</h2>
        <p className="text-xs text-[#627D98]">
          La ruta a la que intentas ingresar no existe o fue movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#102A43] hover:bg-[#243B53] text-white rounded-[8px] text-xs font-semibold transition-colors shadow-sm"
        >
          <ArrowLeft size={14} /> Volver al inicio
        </Link>
      </div>
    </div>
  );
};
