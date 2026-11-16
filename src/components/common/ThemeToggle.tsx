import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, Theme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'dropdown' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'dropdown',
  className = '',
}) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click afuera o presionar Escape
  useEffect(() => {
    if (variant !== 'dropdown') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, variant]);

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Claro',
      icon: <Sun size={15} className="text-[#D6A84F]" />,
    },
    {
      value: 'dark',
      label: 'Oscuro',
      icon: <Moon size={15} className="text-[#9FB3C8]" />,
    },
    {
      value: 'system',
      label: 'Sistema',
      icon: <Monitor size={15} className="text-[#D9E2EC]" />,
    },
  ];

  // Variante Segmentada (ideal para menú móvil)
  if (variant === 'segmented') {
    return (
      <div className={`p-1 bg-[#243B53] rounded-[10px] border border-[#334E68] flex items-center gap-1 ${className}`}>
        {options.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`flex-1 py-1.5 px-2.5 rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-[#102A43] text-white shadow-xs border border-[#D6A84F]/40'
                  : 'text-[#9FB3C8] hover:text-white hover:bg-[#1B2D3F]'
              }`}
              title={`Modo ${opt.label}`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Icono dinámico según la opción seleccionada
  const currentIcon = () => {
    if (theme === 'system') {
      return <Monitor size={18} className="text-[#D9E2EC] group-hover:text-white" />;
    }
    if (theme === 'dark') {
      return <Moon size={18} className="text-[#D6A84F] group-hover:text-white" />;
    }
    return <Sun size={18} className="text-[#D6A84F] group-hover:text-white" />;
  };

  // Variante Dropdown (ideal para navbar desktop)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-2 rounded-[8px] text-[#D9E2EC] hover:text-white hover:bg-[#243B53] border border-transparent hover:border-[#334E68] transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A84F]"
        title={`Tema: ${theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Oscuro' : 'Claro'}`}
        aria-label="Cambiar tema (claro, oscuro o sistema)"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {currentIcon()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-[10px] border border-[#334E68] bg-[#102A43] shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-[#9FB3C8] border-b border-[#243B53] mb-1">
            Tema visual
          </div>
          {options.map((opt) => {
            const isActive = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#243B53] text-[#D6A84F] font-bold'
                    : 'text-[#D9E2EC] hover:bg-[#1B2D3F] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {isActive && <Check size={14} className="text-[#D6A84F]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
