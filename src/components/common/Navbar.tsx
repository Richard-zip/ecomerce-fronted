import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  GraduationCap,
  ShoppingBag,
  User as UserIcon,
  LogOut,
  PackageCheck,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  Store,
  Plus,
  ArrowLeftRight,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isSeller, logout, switchRole } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSwitchMode = async (targetRole: 'CLIENTE' | 'VENDEDOR') => {
    setIsSwitching(true);
    try {
      await switchRole(targetRole);
      setIsProfileDropdownOpen(false);
      setIsMenuOpen(false);
      if (targetRole === 'VENDEDOR') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Error al cambiar de modalidad:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileDropdownOpen]);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#102A43] border-b border-[#243B53] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-[8px] bg-[#243B53] border border-[#334E68] flex items-center justify-center text-[#D6A84F] transition-colors group-hover:border-[#D6A84F]">
              <GraduationCap size={20} />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#FFFFFF]">
                Campus<span className="text-[#D6A84F]">Market</span>
              </span>
              <span className="block text-[10px] font-medium tracking-wide text-[#9FB3C8] -mt-1">
                Centro Tutorial Cereté
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-4">
            {isAuthenticated && isSeller && (
              <>
                <Link
                  to="/seller"
                  className="text-xs font-bold text-[#FFFFFF] bg-[#243B53] hover:bg-[#1B2D3F] px-3 py-1.5 rounded-[8px] border border-[#334E68] hover:border-[#D6A84F] transition-all flex items-center gap-1.5"
                >
                  <Store size={14} className="text-[#D6A84F]" />
                  Panel Vendedor
                </Link>
                <Link
                  to="/seller?action=new"
                  className="text-xs font-bold text-[#102A43] bg-[#D6A84F] hover:bg-[#C99A40] px-3 py-1.5 rounded-[8px] shadow-xs transition-all flex items-center gap-1"
                >
                  <Plus size={14} />
                  Publicar Producto
                </Link>
              </>
            )}

            {isAuthenticated && !isSeller && (
              <Link
                to="/orders"
                className="text-sm font-semibold text-[#D9E2EC] hover:text-[#FFFFFF] transition-colors flex items-center gap-1.5"
              >
                <PackageCheck size={16} />
                Mis Pedidos
              </Link>
            )}
          </nav>

          {/* Actions & Profile */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart Button (excluido para perfiles de vendedor) */}
            {!isSeller && (
              <Link
                to="/cart"
                className="relative p-2 rounded-[8px] text-[#D9E2EC] hover:text-white hover:bg-[#243B53] transition-colors"
                title="Carrito de compras"
              >
                <ShoppingBag size={20} />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D6A84F] text-[#102A43] font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {totalCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Section */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-[8px] border border-[#334E68] hover:border-[#D6A84F] bg-[#243B53] text-[#FFFFFF] transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A84F]"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-[6px] object-cover border border-[#334E68]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-[6px] bg-[#102A43] text-[#D6A84F] font-bold flex items-center justify-center text-xs border border-[#334E68]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#FFFFFF] leading-tight max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-[#9FB3C8] font-medium">
                      {user.role === 'VENDEDOR' ? 'Vendedor' : 'Estudiante'}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-[#9FB3C8] transition-transform duration-200 ${
                      isProfileDropdownOpen ? 'rotate-180 text-[#D6A84F]' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-[#D9E2EC] bg-white shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    {/* Encabezado: Avatar, nombre y rol juntos en una sola fila */}
                    <div className="p-3.5 border-b border-[#D9E2EC] bg-white">
                      <div className="flex items-center gap-2.5">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#D9E2EC] shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#102A43] text-[#D6A84F] font-bold flex items-center justify-center text-xs shrink-0 border border-[#D9E2EC]">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
                          <span className="font-bold text-sm text-[#102A43] truncate leading-tight">
                            {user.name}
                          </span>
                          <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0F4F8] text-[#102A43] border border-[#D9E2EC]">
                            {user.role === 'VENDEDOR' ? 'Vendedor' : 'Estudiante'}
                          </span>
                        </div>
                      </div>

                      {/* Correo en una sola línea con truncado */}
                      <div className="mt-2 pt-2 border-t border-[#F0F4F8] flex items-center gap-1.5 text-xs text-[#627D98] overflow-hidden">
                        <span className="shrink-0 text-[11px] font-medium text-[#627D98]">Conectado como:</span>
                        <span className="truncate text-[11px] font-semibold text-[#1F2933]" title={user.email}>
                          {user.email}
                        </span>
                      </div>
                    </div>

                    {/* Accesos: filas con min-h-11, px-4, texto #243B53 y hover #F5F7FA */}
                    <div className="py-1">
                      {isSeller && (
                        <>
                          <Link
                            to="/seller"
                            className="flex min-h-11 items-center gap-3 px-4 text-sm font-medium text-[#243B53] hover:bg-[#F5F7FA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102A43] focus-visible:ring-inset"
                          >
                            <div className="w-5 flex justify-center shrink-0">
                              <LayoutDashboard size={18} className="text-[#102A43]" />
                            </div>
                            <span>Panel de Ventas</span>
                          </Link>

                          <Link
                            to="/seller?action=new"
                            className="flex min-h-11 items-center gap-3 px-4 text-sm font-semibold text-[#102A43] hover:bg-[#F5F7FA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102A43] focus-visible:ring-inset"
                          >
                            <div className="w-5 flex justify-center shrink-0">
                              <Plus size={18} className="text-[#D6A84F]" />
                            </div>
                            <span>Publicar Nuevo Producto</span>
                          </Link>
                        </>
                      )}

                      {!isSeller && (
                        <Link
                          to="/orders"
                          className="flex min-h-11 items-center gap-3 px-4 text-sm font-medium text-[#243B53] hover:bg-[#F5F7FA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102A43] focus-visible:ring-inset"
                        >
                          <div className="w-5 flex justify-center shrink-0">
                            <PackageCheck size={18} className="text-[#102A43]" />
                          </div>
                          <span>Mis Compras / Reservas</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex min-h-11 items-center gap-3 px-4 text-sm font-medium text-[#243B53] hover:bg-[#F5F7FA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102A43] focus-visible:ring-inset"
                      >
                        <div className="w-5 flex justify-center shrink-0">
                          <UserIcon size={18} className="text-[#102A43]" />
                        </div>
                        <span>Mi Perfil Cereté</span>
                      </Link>
                    </div>

                    {/* Cambio rápido de perfil (Mismos datos para Vendedor y Comprador) */}
                    <div className="border-t border-[#D9E2EC] py-1 bg-[#F8FAFC]">
                      {isSeller ? (
                        <button
                          type="button"
                          onClick={() => handleSwitchMode('CLIENTE')}
                          disabled={isSwitching}
                          className="w-full flex min-h-11 items-center gap-3 px-4 text-xs font-semibold text-[#102A43] hover:bg-[#F0F4F8] transition-colors text-left"
                        >
                          <div className="w-5 flex justify-center shrink-0">
                            <ShoppingBag size={16} className="text-[#102A43]" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span>{isSwitching ? 'Cambiando de cuenta...' : 'Cambiar a Estudiante Comprador'}</span>
                            <span className="text-[10px] text-[#627D98] font-normal truncate">Mismo correo y datos</span>
                          </div>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSwitchMode('VENDEDOR')}
                          disabled={isSwitching}
                          className="w-full flex min-h-11 items-center gap-3 px-4 text-xs font-semibold text-[#102A43] hover:bg-[#F0F4F8] transition-colors text-left"
                        >
                          <div className="w-5 flex justify-center shrink-0">
                            <Store size={16} className="text-[#D6A84F]" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span>{isSwitching ? 'Cambiando de cuenta...' : 'Cambiar a Estudiante Vendedor'}</span>
                            <span className="text-[10px] text-[#627D98] font-normal truncate">Mismo correo y datos</span>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Separación y Cierre de Sesión con rojo reservado */}
                    <div className="border-t border-[#D9E2EC] py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex min-h-11 items-center gap-3 px-4 text-sm font-semibold text-[#C53030] hover:bg-[#FDE8E8]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C53030] focus-visible:ring-inset text-left"
                      >
                        <div className="w-5 flex justify-center shrink-0">
                          <LogOut size={18} className="text-[#C53030]" />
                        </div>
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-semibold text-[#D9E2EC] hover:text-[#FFFFFF] transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#243B53] hover:bg-[#1B2D3F] border border-[#334E68] hover:border-[#D6A84F] rounded-[8px] transition-all"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger & cart button */}
          <div className="flex md:hidden items-center gap-2">
            {!isSeller && (
              <Link
                to="/cart"
                className="relative p-2 text-[#D9E2EC]"
                title="Carrito"
              >
                <ShoppingBag size={20} />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D6A84F] text-[#102A43] font-bold text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {totalCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-[#D9E2EC] hover:text-white"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#243B53] bg-[#102A43] px-4 pt-3 pb-6 space-y-3">
          {isAuthenticated && user && (
            <div className="p-3 bg-[#243B53] rounded-[10px] border border-[#334E68] space-y-2">
              <div className="flex items-center gap-2.5">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#334E68] shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#102A43] text-[#D6A84F] font-bold flex items-center justify-center text-xs shrink-0 border border-[#334E68]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
                  <p className="font-bold text-white text-sm truncate">{user.name}</p>
                  <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#102A43] text-[#D6A84F] border border-[#334E68]">
                    {user.role === 'VENDEDOR' ? 'Vendedor' : 'Estudiante'}
                  </span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-[#334E68]/60 flex items-center gap-1.5 text-xs text-[#9FB3C8]">
                <span className="shrink-0 text-[11px] font-medium text-[#9FB3C8]">Conectado como:</span>
                <span className="truncate text-[11px] font-medium text-[#D9E2EC]" title={user.email}>
                  {user.email}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {isAuthenticated && isSeller && (
              <>
                <Link
                  to="/seller"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-[8px] text-sm font-semibold text-white bg-[#243B53] border border-[#334E68]"
                >
                  Panel Vendedor
                </Link>
                <Link
                  to="/seller?action=new"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-[8px] text-sm font-bold text-[#102A43] bg-[#D6A84F]"
                >
                  + Publicar Nuevo Producto
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                {!isSeller && (
                  <Link
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-[8px] text-sm font-semibold text-[#D9E2EC] hover:bg-[#243B53]"
                  >
                    Mis Pedidos / Compras
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-[8px] text-sm font-semibold text-[#D9E2EC] hover:bg-[#243B53]"
                >
                  Mi Perfil Universitario
                </Link>
                {/* Botón cambiar modalidad en móvil */}
                <button
                  type="button"
                  onClick={() => handleSwitchMode(isSeller ? 'CLIENTE' : 'VENDEDOR')}
                  disabled={isSwitching}
                  className="w-full text-left px-3 py-2 rounded-[8px] text-xs font-bold text-[#D6A84F] bg-[#102A43] border border-[#334E68] flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowLeftRight size={14} />
                    <span>{isSeller ? 'Cambiar a Estudiante Comprador' : 'Cambiar a Estudiante Vendedor'}</span>
                  </span>
                  <span className="text-[10px] text-[#9FB3C8] font-normal">Mismos datos</span>
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-[8px] text-sm font-semibold text-[#F8B4B4] hover:bg-[#243B53] flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </>
            )}

            {!isAuthenticated && (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-[8px] border border-[#334E68] text-white font-semibold text-xs hover:bg-[#243B53]"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-[8px] bg-[#243B53] text-[#FFFFFF] font-bold text-xs border border-[#D6A84F]"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
