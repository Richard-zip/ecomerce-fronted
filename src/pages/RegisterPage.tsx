import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import {
  OFFICIAL_CAMPUS,
  formatColombianPhone,
  displayColombianPhone,
  isValidColombianPhone,
} from '../utils/format';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle,
  Store,
  ShoppingBag,
  Upload,
  Camera,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('CLIENTE');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [campus] = useState(OFFICIAL_CAMPUS);
  const [avatar, setAvatar] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manejar selección de foto desde el ordenador
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (.jpg, .png, .webp).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setAvatar(canvas.toDataURL('image/jpeg', 0.85));
          setError(null);
        }
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validación de nombre
    if (!name.trim() || name.trim().length < 2) {
      setError('Por favor ingresa tu nombre y apellido (mínimo 2 caracteres).');
      setIsLoading(false);
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor ingresa una dirección de correo electrónico válida.');
      setIsLoading(false);
      return;
    }

    // Validación de contraseña
    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    // Validación obligatoria de celular colombiano
    if (!phone.trim()) {
      setError('El número de teléfono celular es obligatorio para estudiantes en campus.');
      setIsLoading(false);
      return;
    }

    if (!isValidColombianPhone(phone)) {
      setError('El teléfono debe ser un número celular colombiano válido de 10 dígitos que inicie por 3 (ej: +57 300 123 4567).');
      setIsLoading(false);
      return;
    }

    // Validación de WhatsApp si se especificó
    if (whatsapp.trim() && !isValidColombianPhone(whatsapp)) {
      setError('El número de WhatsApp debe ser un celular colombiano válido de 10 dígitos que inicie por 3.');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        phone: displayColombianPhone(phone),
        whatsapp: whatsapp.trim() ? displayColombianPhone(whatsapp) : displayColombianPhone(phone),
        campus: OFFICIAL_CAMPUS,
        avatar: avatar || undefined,
      });
      if (role === 'VENDEDOR') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F5F7FA]">
      <div className="w-full max-w-[500px] bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-[8px] bg-[#102A43] border border-[#243B53] flex items-center justify-center text-[#D6A84F] mx-auto shadow-sm">
            <GraduationCap size={26} />
          </div>
          <span className="block text-xs font-bold uppercase tracking-wider text-[#627D98]">
            Campus<span className="text-[#D6A84F]">Market</span> • Cereté
          </span>
          <h2 className="text-2xl font-bold text-[#102A43] tracking-tight">
            Crear Cuenta 
          </h2>
          <p className="text-sm text-[#627D98] leading-relaxed">
            Regístrate en CampusMarket Cereté con tu correo y datos de contacto.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[#FDE8E8] border border-[#F8B4B4] rounded-[8px] text-xs text-[#C53030] flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#1F2933]">
                Tipo de Cuenta Universitaria
              </label>
              <span className="text-[10px] text-[#627D98] font-medium">
                Selecciona tu rol
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CLIENTE')}
                className={`p-3 rounded-[8px] border text-left transition-all ${
                  role === 'CLIENTE'
                    ? 'border-[#102A43] bg-[#F0F4F8] text-[#102A43] ring-1 ring-[#102A43]'
                    : 'border-[#D9E2EC] bg-[#FFFFFF] text-[#627D98] hover:bg-[#F5F7FA]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShoppingBag size={14} className={role === 'CLIENTE' ? 'text-[#102A43]' : 'text-[#627D98]'} />
                  <span>Estudiante Comprador</span>
                </div>
                <span className="text-[10px] text-[#627D98] mt-1 block">
                  Reservar libros y materiales.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('VENDEDOR')}
                className={`p-3 rounded-[8px] border text-left transition-all ${
                  role === 'VENDEDOR'
                    ? 'border-[#102A43] bg-[#F0F4F8] text-[#102A43] ring-1 ring-[#102A43]'
                    : 'border-[#D9E2EC] bg-[#FFFFFF] text-[#627D98] hover:bg-[#F5F7FA]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Store size={14} className={role === 'VENDEDOR' ? 'text-[#D6A84F]' : 'text-[#627D98]'} />
                  <span>Estudiante Vendedor</span>
                </div>
                <span className="text-[10px] text-[#627D98] mt-1 block">
                  Publicar artículos y ventas.
                </span>
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Nombre y Apellidos
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627D98]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Daniel Castillo"
                className="w-full h-11 pl-10 pr-4 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
                required
              />
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627D98]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alumno@universidad.edu"
                  className="w-full h-11 pl-10 pr-4 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Contraseña (mín. 6)
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627D98]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-11 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
                  required
                  minLength={6}
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
          </div>

          {/* Campus */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Sede Oficial Universitaria
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#102A43]" />
              <input
                type="text"
                value={OFFICIAL_CAMPUS}
                readOnly
                className="w-full h-11 pl-10 pr-4 bg-[#F5F7FA] border border-[#D9E2EC] rounded-[8px] text-sm font-semibold text-[#102A43] cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Phone / WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Celular (Colombia) *
              </label>
              <div className="flex h-11 rounded-[8px] border border-[#D9E2EC] bg-[#FFFFFF] overflow-hidden focus-within:ring-2 focus-within:ring-[#102A43] focus-within:border-[#102A43] transition-colors">
                <div className="flex items-center gap-1 px-2.5 bg-[#F0F4F8] border-r border-[#D9E2EC] text-[#102A43] font-semibold text-xs select-none shrink-0">
                  <span className="text-sm">🇨🇴</span>
                  <span>+57</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(formatColombianPhone(e.target.value))}
                  placeholder="300 123 4567"
                  maxLength={12}
                  className="w-full h-full px-3 text-sm text-[#1F2933] placeholder-[#9FB3C8] focus:outline-none bg-transparent"
                  required
                />
              </div>
              <span className="text-[10px] text-[#627D98] mt-1 block">
                10 dígitos iniciando en 3 (ej: 300 123 4567)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                WhatsApp de Contacto
              </label>
              <div className="flex h-11 rounded-[8px] border border-[#D9E2EC] bg-[#FFFFFF] overflow-hidden focus-within:ring-2 focus-within:ring-[#102A43] focus-within:border-[#102A43] transition-colors">
                <div className="flex items-center gap-1 px-2.5 bg-[#F0F4F8] border-r border-[#D9E2EC] text-[#102A43] font-semibold text-xs select-none shrink-0">
                  <span className="text-sm">🇨🇴</span>
                  <span>+57</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatColombianPhone(e.target.value))}
                  placeholder="300 123 4567"
                  maxLength={12}
                  className="w-full h-full px-3 text-sm text-[#1F2933] placeholder-[#9FB3C8] focus:outline-none bg-transparent"
                />
              </div>
              <span className="text-[10px] text-[#627D98] mt-1 block">
                Opcional si es el mismo celular
              </span>
            </div>
          </div>

          {/* Foto de Perfil desde el Ordenador (Opcional) */}
          <div className="p-3 bg-[#F5F7FA] rounded-[8px] border border-[#D9E2EC] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Vista previa"
                  className="w-12 h-12 rounded-[8px] object-cover border border-[#D9E2EC]"
                />
              ) : (
                <div className="w-12 h-12 rounded-[8px] bg-[#FFFFFF] text-[#627D98] flex items-center justify-center border border-[#D9E2EC]">
                  <Camera size={18} />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-[#1F2933]">Foto de perfil (opcional)</p>
                <p className="text-[10px] text-[#627D98]">Elige una imagen desde tu ordenador</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 px-2.5 bg-[#FFFFFF] hover:bg-[#E2E8F0] border border-[#D9E2EC] text-[#102A43] rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Upload size={12} />
                <span>{avatar ? 'Cambiar' : 'Examinar'}</span>
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="h-8 px-2 text-[#C53030] hover:bg-[#FDE8E8] rounded-[6px] text-xs transition-colors"
                  title="Eliminar foto"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 bg-[#102A43] hover:bg-[#243B53] text-[#FFFFFF] font-semibold text-sm rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Registrando cuenta...' : 'Crear Cuenta Estudiantil'}</span>
            <ArrowRight size={16} className="text-[#D6A84F]" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#D9E2EC] text-center text-xs text-[#627D98]">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-bold text-[#102A43] hover:text-[#243B53] underline decoration-[#D6A84F] underline-offset-2">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};
