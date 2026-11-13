import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersService } from '../services/users.service';
import { RoleBadge } from '../components/common/Badge';
import {
  OFFICIAL_CAMPUS,
  formatColombianPhone,
  displayColombianPhone,
  isValidColombianPhone,
} from '../utils/format';
import {
  User as UserIcon,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Camera,
  CheckCircle,
  AlertCircle,
  Save,
  Upload,
  Trash2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(formatColombianPhone(user?.phone || ''));
  const [whatsapp, setWhatsapp] = useState(formatColombianPhone(user?.whatsapp || ''));
  const [campus] = useState(OFFICIAL_CAMPUS);
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] text-center space-y-4 shadow-sm">
        <UserIcon size={40} className="text-[#102A43] mx-auto" />
        <h3 className="text-lg font-bold text-[#1F2933]">Inicia sesión</h3>
        <p className="text-xs text-[#627D98]">Debes iniciar sesión para editar tu perfil universitario.</p>
      </div>
    );
  }

  // Manejar selección de imagen desde el ordenador
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('El archivo seleccionado debe ser una imagen válida (.jpg, .png, .webp).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La imagen seleccionada no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar suavemente en canvas para optimizar peso (máx 500x500 px)
        const canvas = document.createElement('canvas');
        const maxDim = 500;
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressedDataUrl);
          setErrorMsg(null);
        }
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validación de nombre
    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Por favor ingresa tu nombre completo (mínimo 2 caracteres).');
      setIsLoading(false);
      return;
    }

    // Validación obligatoria de número de teléfono colombiano
    if (!phone.trim()) {
      setErrorMsg('El número de teléfono celular es obligatorio.');
      setIsLoading(false);
      return;
    }

    if (!isValidColombianPhone(phone)) {
      setErrorMsg('El teléfono celular debe ser un número colombiano válido de 10 dígitos que inicie por 3 (ej: +57 300 123 4567).');
      setIsLoading(false);
      return;
    }

    // Validación de WhatsApp si se ingresa
    if (whatsapp.trim() && !isValidColombianPhone(whatsapp)) {
      setErrorMsg('El número de WhatsApp debe ser un número celular colombiano válido de 10 dígitos que inicie por 3 (ej: +57 300 123 4567).');
      setIsLoading(false);
      return;
    }

    try {
      const updated = await usersService.updateProfile({
        name: name.trim(),
        phone: displayColombianPhone(phone),
        whatsapp: whatsapp.trim() ? displayColombianPhone(whatsapp) : displayColombianPhone(phone),
        campus: OFFICIAL_CAMPUS,
        avatar: avatar || undefined,
      });

      updateUser(updated);
      setSuccessMsg('¡Perfil universitario actualizado con éxito!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2933] tracking-tight">
          Mi Perfil Universitario
        </h1>
        <p className="text-xs text-[#627D98] mt-0.5">
          Esta información permite que tus compañeros te contacten para coordinar pedidos y entregas en el campus.
        </p>
      </div>

      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E2EC] p-6 sm:p-8 shadow-sm space-y-6">
        {/* User Card Header con selección de foto desde el ordenador */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E2EC] pb-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-[12px] object-cover border-2 border-[#D9E2EC] shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-[12px] bg-[#F0F4F8] text-[#102A43] font-bold text-2xl flex items-center justify-center border-2 border-[#D9E2EC]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#1F2933]">{user.name}</h2>
              <p className="text-xs text-[#627D98] flex items-center gap-1.5">
                <Mail size={12} /> {user.email}
              </p>
              <div className="pt-1">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>

          {/* Botones para seleccionar foto desde el ordenador */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
              className="h-10 px-3.5 bg-[#F5F7FA] hover:bg-[#E2E8F0] border border-[#D9E2EC] text-[#102A43] rounded-[8px] text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Upload size={14} className="text-[#102A43]" />
              <span>Escoger foto de perfil</span>
            </button>

            {avatar && (
              <button
                type="button"
                onClick={() => setAvatar('')}
                className="h-10 px-3 bg-[#FFFFFF] hover:bg-[#FDE8E8] border border-[#D9E2EC] hover:border-[#C53030]/40 text-[#C53030] rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                title="Eliminar foto actual"
              >
                <Trash2 size={13} />
                <span>Quitar</span>
              </button>
            )}
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-[#EAF5EE] border border-[#2F855A]/20 rounded-[8px] text-xs text-[#2F855A] flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-[#FDE8E8] border border-[#C53030]/20 rounded-[8px] text-xs text-[#C53030] flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1 flex items-center gap-1">
                <UserIcon size={12} className="text-[#627D98]" /> Nombre Completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-xs text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-[#102A43]" /> Sede Universitaria Oficial
              </label>
              <input
                type="text"
                value={OFFICIAL_CAMPUS}
                readOnly
                className="w-full h-11 px-3 bg-[#F5F7FA] border border-[#D9E2EC] rounded-[8px] text-xs font-semibold text-[#102A43] cursor-not-allowed select-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1 flex items-center gap-1">
                <Phone size={12} className="text-[#102A43]" /> Teléfono Celular (Colombia) *
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
                  className="w-full h-full px-3 text-xs font-semibold text-[#1F2933] placeholder-[#627D98] focus:outline-none bg-transparent"
                  required
                />
              </div>
              <span className="text-[10px] text-[#627D98] mt-1 block">
                Formato colombiano obligatorio: 10 dígitos iniciando en 3
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1 flex items-center gap-1">
                <Phone size={12} className="text-[#2F855A]" /> WhatsApp para Coordinación
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
                  className="w-full h-full px-3 text-xs font-semibold text-[#1F2933] placeholder-[#627D98] focus:outline-none bg-transparent"
                />
              </div>
              <span className="text-[10px] text-[#627D98] mt-1 block">
                Si se deja vacío, se utilizará el teléfono celular registrado
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1 flex items-center gap-1">
              <MapPin size={12} className="text-[#102A43]" /> Sede Oficial
            </label>
            <input
              type="text"
              value={OFFICIAL_CAMPUS}
              readOnly
              className="w-full h-11 px-3 bg-[#F5F7FA] border border-[#D9E2EC] rounded-[8px] text-xs font-semibold text-[#627D98] cursor-not-allowed select-none"
            />
            <span className="text-[10px] text-[#627D98] mt-0.5 block">
              Sede única del Centro Tutorial Cereté
            </span>
          </div>

          <div className="pt-4 border-t border-[#D9E2EC] flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#102A43] hover:bg-[#243B53] text-white font-semibold text-xs rounded-[8px] shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isLoading ? 'Guardando cambios...' : 'Guardar Información'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
