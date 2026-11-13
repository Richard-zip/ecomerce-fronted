import React, { useState } from 'react';
import { Product } from '../../types';
import { productsService } from '../../services/products.service';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { MessageCircle, MapPin, User, FileText, Send, AlertCircle } from 'lucide-react';
import { formatCOP, OFFICIAL_CAMPUS } from '../../utils/format';

interface WhatsAppModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [meetingPoint, setMeetingPoint] = useState(product.meetingPoint || OFFICIAL_CAMPUS);
  const [clientName, setClientName] = useState(user?.name || '');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await productsService.getWhatsAppCheckout(product.id, {
        quantity,
        meetingPoint: meetingPoint || undefined,
        clientName: clientName || undefined,
        notes: notes || undefined,
      });

      // Abrir enlace en pestaña nueva
      window.open(result.whatsappUrl, '_blank');
      onClose();
    } catch (err: any) {
      setError(
        err.message ||
          'No se pudo generar el enlace. Asegúrate de que el vendedor tenga un número de WhatsApp registrado.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprar directo por WhatsApp" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product summary */}
        <div className="flex items-center gap-3 p-3 bg-[#F5F7FA] rounded-[8px] border border-[#D9E2EC]">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200'}
            alt={product.title}
            className="w-16 h-16 rounded-[8px] object-cover border border-[#D9E2EC]"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-[#1F2933] text-sm line-clamp-1">{product.title}</h4>
            <p className="text-xs text-[#627D98]">
              Vendido por: <span className="font-medium text-[#1F2933]">{product.seller?.name || 'Estudiante'}</span>
            </p>
            <p className="text-sm font-bold text-[#102A43] mt-0.5">
              {formatCOP(product.price)} c/u
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#FDE8E8] border border-[#C53030]/20 rounded-[8px] flex items-start gap-2 text-[#C53030] text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Cantidad (Stock: {product.stock})
            </label>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
              className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] focus:outline-none"
              required
            />
          </div>

          {/* Total calculation */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">Total a pagar (COP)</label>
            <div className="h-11 px-3 flex items-center bg-[#F0F4F8] border border-[#D9E2EC] rounded-[8px] text-sm font-bold text-[#102A43]">
              {formatCOP(product.price * quantity)}
            </div>
          </div>
        </div>

        {/* Client Name */}
        <div>
          <label className="block text-xs font-semibold text-[#1F2933] mb-1 flex items-center gap-1">
            <User size={13} className="text-[#627D98]" /> Tu nombre para que el vendedor te reconozca
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ej: Daniel - Estudiante Cereté"
            className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] focus:outline-none"
            required
          />
        </div>

        {/* Meeting point */}
        <div>
          <label className="block text-xs font-semibold text-[#1F2933] mb-1 flex items-center gap-1">
            <MapPin size={13} className="text-[#102A43]" /> Lugar de entrega en campus (Centro Tutorial Cereté)
          </label>
          <input
            type="text"
            value={meetingPoint}
            onChange={(e) => setMeetingPoint(e.target.value)}
            placeholder="Centro Tutorial Cereté - Cafetería, Portería o Biblioteca"
            className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] focus:outline-none"
          />
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#1F2933] mb-1 flex items-center gap-1">
            <FileText size={13} className="text-[#627D98]" /> Horario preferido o nota adicional (opcional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Estoy libre de 2:00 a 4:00 pm después de clases."
            className="w-full p-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] focus:outline-none resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-[#627D98] hover:text-[#1F2933] hover:bg-[#F5F7FA] rounded-[8px] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-[#102A43] hover:bg-[#243B53] text-white font-semibold rounded-[8px] shadow-sm transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <MessageCircle size={18} />
            {isLoading ? 'Generando...' : 'Abrir WhatsApp'}
            <Send size={14} />
          </button>
        </div>
      </form>
    </Modal>
  );
};
