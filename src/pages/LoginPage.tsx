import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  Store,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('CLIENTE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError('Por favor ingresa una dirección de correo electrónico válida.');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Por favor ingresa tu contraseña.');
      setIsLoading(false);
      return;
    }

    try {
      await login({ email: emailTrimmed.toLowerCase(), password, role });
      if (role === 'VENDEDOR') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(
        err.message ||
          'Credenciales incorrectas o backend fuera de línea en http://localhost:4000'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F5F7FA]">
      {/* Tarjeta blanca centrada sobre fondo #F5F7FA; max-w-[420px], p-8, borde #D9E2EC, sombra sutil */}
      <div className="w-full max-w-[440px] bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-8 shadow-sm space-y-6">
        {/* Logotipo y Nombre de la tienda */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-[8px] bg-[#102A43] border border-[#243B53] flex items-center justify-center text-[#D6A84F] mx-auto shadow-sm">
            <GraduationCap size={26} />
          </div>
          <span className="block text-xs font-bold uppercase tracking-wider text-[#627D98]">
            Campus<span className="text-[#D6A84F]">Market</span> • Cereté
          </span>
          <h2 className="text-2xl font-bold text-[#102A43] tracking-tight">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-[#627D98] leading-relaxed">
            Ingresa a tu cuenta estudiantil del Centro Tutorial Cereté. Puedes tener cuenta de comprador y vendedor con tus mismos datos.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[#FDE8E8] border border-[#F8B4B4] rounded-[8px] text-xs text-[#C53030] flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Modalidad (Comprador o Vendedor) */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1.5 flex items-center justify-between">
              <span>Ingresar en modalidad:</span>
              <span className="text-[10px] text-[#627D98]">Mismos datos para ambos</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('CLIENTE')}
                className={`p-2.5 rounded-[8px] border text-left transition-all ${
                  role === 'CLIENTE'
                    ? 'border-[#102A43] bg-[#F0F4F8] text-[#102A43] ring-1 ring-[#102A43]'
                    : 'border-[#D9E2EC] bg-[#FFFFFF] text-[#627D98] hover:bg-[#F5F7FA]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShoppingBag size={14} className={role === 'CLIENTE' ? 'text-[#102A43]' : 'text-[#627D98]'} />
                  <span>Comprador</span>
                </div>
                <span className="text-[10px] text-[#627D98] mt-0.5 block leading-tight">
                  Reservar en campus
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('VENDEDOR')}
                className={`p-2.5 rounded-[8px] border text-left transition-all ${
                  role === 'VENDEDOR'
                    ? 'border-[#102A43] bg-[#F0F4F8] text-[#102A43] ring-1 ring-[#102A43]'
                    : 'border-[#D9E2EC] bg-[#FFFFFF] text-[#627D98] hover:bg-[#F5F7FA]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Store size={14} className={role === 'VENDEDOR' ? 'text-[#D6A84F]' : 'text-[#627D98]'} />
                  <span>Vendedor</span>
                </div>
                <span className="text-[10px] text-[#627D98] mt-0.5 block leading-tight">
                  Publicar artículos
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627D98]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alumno@universidad.edu"
                className="w-full h-11 pl-10 pr-4 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] transition-all"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#1F2933]">
                Contraseña
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#102A43] hover:text-[#243B53] hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627D98]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-11 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627D98] hover:text-[#102A43] p-1 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102A43]"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#102A43] hover:bg-[#243B53] text-[#FFFFFF] font-semibold text-sm rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:ring-offset-2"
          >
            <span>{isLoading ? 'Comprobando credenciales...' : `Entrar como ${role === 'VENDEDOR' ? 'Vendedor' : 'Comprador'}`}</span>
            <ArrowRight size={16} className="text-[#D6A84F]" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#D9E2EC] text-center space-y-2">
          <p className="text-xs text-[#627D98]">
            ¿No tienes cuenta de {role === 'VENDEDOR' ? 'vendedor' : 'comprador'}?{' '}
            <Link to="/register" className="font-bold text-[#102A43] hover:text-[#243B53] underline decoration-[#D6A84F] underline-offset-2">
              Crear con tus mismos datos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
