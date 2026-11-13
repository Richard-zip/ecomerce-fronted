import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ordersService } from '../../services/orders.service';
import { Star, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
  productId?: string;
  productTitle?: string;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  sellerId,
  sellerName,
  productId,
  productTitle,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await ordersService.createReview({
        sellerId,
        productId,
        rating,
        comment: comment.trim() || undefined,
      });

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'No se pudo guardar la calificación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Calificar a ${sellerName}`}
      maxWidth="md"
    >
      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-[#EAF5EE] text-[#2F855A] rounded-[8px] flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <h4 className="text-lg font-bold text-[#1F2933]">¡Gracias por tu opinión!</h4>
          <p className="text-xs text-[#627D98]">
            Tu reseña ayuda a toda la comunidad estudiantil a comprar con confianza.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {productTitle && (
            <div className="p-3 bg-[#F5F7FA] border border-[#D9E2EC] rounded-[8px] text-xs text-[#627D98]">
              Sobre el producto: <span className="font-semibold text-[#1F2933]">{productTitle}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-[#FDE8E8] border border-[#C53030]/20 rounded-[8px] flex items-center gap-2 text-[#C53030] text-xs">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Star selector */}
          <div className="text-center py-2">
            <label className="block text-xs font-semibold text-[#1F2933] mb-2">
              ¿Cómo calificarías la puntualidad y entrega?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1.5 focus:outline-none hover:scale-110 transition-transform"
                >
                  <Star
                    size={28}
                    className={`${
                      star <= rating
                        ? 'text-[#D6A84F] fill-[#D6A84F]'
                        : 'text-[#D9E2EC]'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-[#102A43] mt-1">
              {rating === 5 && '¡Excelente servicio!'}
              {rating === 4 && 'Muy bueno'}
              {rating === 3 && 'Aceptable'}
              {rating === 2 && 'Pudo ser mejor'}
              {rating === 1 && 'Mala experiencia'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Comentario para el perfil del estudiante (opcional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ej: Puntual en la cafetería, el libro estaba exactamente como se describió. 100% recomendado."
              className="w-full p-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#627D98] hover:text-[#1F2933] hover:bg-[#F5F7FA] rounded-[8px] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#102A43] hover:bg-[#243B53] text-white font-semibold text-xs rounded-[8px] shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send size={13} />
              {isSubmitting ? 'Publicando...' : 'Publicar Calificación'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
