import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102A43]/60 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className={`bg-[#FFFFFF] rounded-[16px] shadow-2xl w-full ${maxWidthClasses} overflow-hidden border border-[#D9E2EC] relative animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Institutional decorative top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#102A43] via-[#D6A84F] to-[#243B53]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D9E2EC] bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-9 h-9 rounded-[8px] bg-[#F0F4F8] text-[#102A43] flex items-center justify-center border border-[#D9E2EC] shrink-0">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-[#102A43] leading-snug">{title}</h3>
              {subtitle && <p className="text-xs text-[#627D98] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-[#627D98] hover:text-[#102A43] hover:bg-[#F5F7FA] border border-transparent hover:border-[#D9E2EC] transition-all"
            aria-label="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[82vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
