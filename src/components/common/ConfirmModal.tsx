import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, Trash2, CheckCircle, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      icon: <Trash2 size={24} className="text-[#C53030]" />,
      bg: 'bg-[#FDE8E8]',
      border: 'border-[#F8B4B4]',
      confirmButton: 'bg-[#C53030] hover:bg-[#9B2C2C] text-white',
    },
    warning: {
      icon: <AlertTriangle size={24} className="text-[#8C6517]" />,
      bg: 'bg-[#FBF5EA]',
      border: 'border-[#D6A84F]',
      confirmButton: 'bg-[#102A43] hover:bg-[#243B53] text-white',
    },
    info: {
      icon: <Info size={24} className="text-[#102A43]" />,
      bg: 'bg-[#F0F4F8]',
      border: 'border-[#D9E2EC]',
      confirmButton: 'bg-[#102A43] hover:bg-[#243B53] text-white',
    },
    success: {
      icon: <CheckCircle size={24} className="text-[#2F855A]" />,
      bg: 'bg-[#EAF5EE]',
      border: 'border-[#9AE6B4]',
      confirmButton: 'bg-[#2F855A] hover:bg-[#276749] text-white',
    },
  }[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102A43]/60 backdrop-blur-sm transition-all"
      onClick={() => !isLoading && onClose()}
    >
      <div
        className="bg-[#FFFFFF] rounded-[16px] shadow-2xl w-full max-w-md overflow-hidden border border-[#D9E2EC] relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative top bar */}
        <div
          className={`h-1 w-full ${
            type === 'danger'
              ? 'bg-[#C53030]'
              : type === 'warning'
              ? 'bg-[#D6A84F]'
              : 'bg-[#102A43]'
          }`}
        />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-[12px] ${iconConfig.bg} border ${iconConfig.border} flex items-center justify-center shrink-0 shadow-sm`}
            >
              {iconConfig.icon}
            </div>

            <div className="flex-1 space-y-1">
              <h3 className="text-base font-bold text-[#1F2933]">{title}</h3>
              <p className="text-xs text-[#627D98] leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-[#D9E2EC]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-10 px-4 rounded-[8px] border border-[#D9E2EC] bg-[#FFFFFF] hover:bg-[#F5F7FA] text-xs font-semibold text-[#627D98] hover:text-[#1F2933] transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`h-10 px-5 rounded-[8px] text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 ${iconConfig.confirmButton}`}
            >
              {isLoading ? 'Procesando...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
