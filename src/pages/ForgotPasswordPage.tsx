import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ShoppingBag,
  Store,
  RefreshCw,
} from 'lucide-react';
import { authService } from '../services/auth.service';
import { Role } from '../types';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  // Paso actual: 1 = Enviar código, 2 = Validar código y cambiar contraseña, 3 = Éxito
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Formulario
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role | undefined>(undefined);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Ver/Ocultar contraseñas
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Paso 1: Solicitar código de recuperación
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authService.forgotPassword({
        email: email.trim(),
        role: role,
      });

      setSuccessInfo(res.message || 'Código enviado exitosamente a tu correo.');
      setStep(2);
    } catch (err: any) {
      console.error('Error al solicitar código:', err);
      const msg = err.response?.data?.message || 'No fue posible enviar el código. Verifica tu correo e intenta nuevamente.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar código
  const handleResendCode = async () => {
    setError(null);
    setIsResending(true);
    try {
      const res = await authService.forgotPassword({
        email: email.trim(),
        role: role,
      });
      setSuccessInfo(`Nuevo código enviado: ${res.message || 'Revisa tu bandeja de entrada.'}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al reenviar el código.';
      setError(msg);
    } finally {
      setIsResending(false);
    }
  };

  // Paso 2: Restablecer contraseña con el código
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim().replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      setError('El código de verificación debe contener exactamente 6 dígitos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        email: email.trim(),
        code: cleanCode,
        newPassword,
        role: role,
      });

      setStep(3);
    } catch (err: any) {
      console.error('Error al restablecer contraseña:', err);
      const msg = err.response?.data?.message || 'Error al restablecer la contraseña. El código puede ser incorrecto o haber expirado.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 py-12 bg-[#F5F7FA]">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#D9E2EC] rounded-[12px] p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Encabezado Institucional */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-[8px] bg-[#102A43] border border-[#243B53] flex items-center justify-center text-[#D6A84F] mx-auto shadow-sm">
            <KeyRound size={26} />
          </div>
          <span className="block text-xs font-bold uppercase tracking-wider text-[#627D98]">
            Campus<span className="text-[#D6A84F]">Market</span> • Cereté
          </span>
          <h2 className="text-2xl font-bold text-[#102A43] tracking-tight">
            Recuperar Contraseña
          </h2>
          <p className="text-xs text-[#627D98] leading-relaxed">
            {step === 1 && 'Ingresa tu correo institucional para recibir un código de recuperación de 6 dígitos.'}
            {step === 2 && 'Ingresa el código que te enviamos por correo y tu nueva contraseña.'}
            {step === 3 && 'Tu contraseña ha sido actualizada satisfactoriamente.'}
          </p>
        </div>

        {/* Indicador de Pasos */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-2 py-1">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              step === 1 ? 'bg-[#102A43] text-[#FFFFFF]' : 'bg-[#F0F4F8] text-[#102A43]'
            }`}>
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
              <span>Solicitar</span>
            </div>
            <div className="w-6 h-[2px] bg-[#D9E2EC]" />
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              step === 2 ? 'bg-[#102A43] text-[#FFFFFF]' : 'bg-[#F0F4F8] text-[#627D98]'
            }`}>
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
              <span>Restablecer</span>
            </div>
          </div>
        )}

        {/* Mensajes de Error y Éxito */}
        {error && (
          <div className="p-3 bg-[#FDE8E8] border border-[#F8B4B4] rounded-[8px] text-xs text-[#C53030] flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#C53030]" />
            <div className="space-y-1">
              <span className="leading-tight block">{error}</span>
              {error.toLowerCase().includes('no se encontró') && (
                <Link
                  to="/register"
                  className="font-bold underline text-[#9B2C2C] hover:text-[#742A2A] inline-block pt-0.5"
                >
                  ¿No tienes cuenta aún? Crear cuenta con este correo →
                </Link>
              )}
            </div>
          </div>
        )}

        {successInfo && step === 2 && (
          <div className="p-3 bg-[#DEF7EC] border border-[#BCF0DA] rounded-[8px] text-xs text-[#03543F] flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#0E9F6E]" />
            <span className="leading-tight">{successInfo}</span>
          </div>
        )}

        {/* PASO 1: Ingreso de correo y rol */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
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

            {/* Modalidad opcional */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1.5 flex items-center justify-between">
                <span>Modalidad de cuenta (opcional):</span>
                <span className="text-[10px] text-[#627D98]">Si tienes ambas cuentas</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole(role === 'CLIENTE' ? undefined : 'CLIENTE')}
                  className={`p-2 rounded-[8px] border text-left transition-all ${
                    role === 'CLIENTE'
                      ? 'border-[#102A43] bg-[#F0F4F8] text-[#102A43] ring-1 ring-[#102A43]'
                      : 'border-[#D9E2EC] bg-[#FFFFFF] text-[#627D98] hover:bg-[#F5F7FA]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <ShoppingBag size={14} className={role === 'CLIENTE' ? 'text-[#102A43]' : 'text-[#627D98]'} />
                    <span>Comprador</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole(role === 'VENDEDOR' ? undefined : 'VENDEDOR')}
                  className={`p-2 rounded-[8px] border text-left transition-all ${
                    role === 'VENDEDOR'
                      ? 'border-[#102A43] bg-[#F0F4F8] text-[#102A43] ring-1 ring-[#102A43]'
                      : 'border-[#D9E2EC] bg-[#FFFFFF] text-[#627D98] hover:bg-[#F5F7FA]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Store size={14} className={role === 'VENDEDOR' ? 'text-[#D6A84F]' : 'text-[#627D98]'} />
                    <span>Vendedor</span>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-11 bg-[#102A43] hover:bg-[#243B53] text-[#FFFFFF] font-semibold text-sm rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#102A43]"
            >
              <span>{isLoading ? 'Enviando código...' : 'Enviar código de recuperación'}</span>
              <ArrowRight size={16} className="text-[#D6A84F]" />
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#627D98] hover:text-[#102A43] transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Volver a Iniciar Sesión</span>
              </Link>
            </div>
          </form>
        )}

        {/* PASO 2: Código de 6 dígitos y Nueva Contraseña */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-[#F0F4F8] border border-[#D9E2EC] rounded-[8px] text-xs text-[#334E68] space-y-1">
              <div className="font-semibold text-[#102A43] flex items-center justify-between">
                <span>Destinatario: {email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                    setSuccessInfo(null);
                  }}
                  className="text-[11px] text-[#102A43] underline hover:text-[#243B53]"
                >
                  Cambiar correo
                </button>
              </div>
              <p className="text-[11px] text-[#627D98]">
                Introduce el código numérico de 6 dígitos que llegó a tu bandeja de entrada o spam.
              </p>
            </div>

            {/* Código de verificación */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1.5 flex items-center justify-between">
                <span>Código de Verificación (6 dígitos)</span>
                <span className="text-[10px] text-[#D6A84F] font-bold">15 min de validez</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full h-12 text-center text-2xl font-bold tracking-[8px] font-mono bg-[#FFFFFF] border-2 border-[#D9E2EC] focus:border-[#102A43] rounded-[8px] text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#102A43] transition-all"
                  required
                />
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1.5">
                Nueva Contraseña (mínimo 6 caracteres)
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627D98]" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-11 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627D98] hover:text-[#102A43] p-1 rounded transition-colors focus:outline-none"
                  title={showNewPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showNewPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1.5">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627D98]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-11 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] text-sm text-[#1F2933] placeholder-[#9FB3C8] focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627D98] hover:text-[#102A43] p-1 rounded transition-colors focus:outline-none"
                  title={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6 || newPassword.length < 6}
              className="w-full h-11 bg-[#102A43] hover:bg-[#243B53] text-[#FFFFFF] font-semibold text-sm rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#102A43]"
            >
              <span>{isLoading ? 'Actualizando...' : 'Restablecer Contraseña'}</span>
              <CheckCircle2 size={16} className="text-[#D6A84F]" />
            </button>

            <div className="pt-2 flex items-center justify-between text-xs text-[#627D98]">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="inline-flex items-center gap-1 hover:text-[#102A43] font-medium disabled:opacity-50"
              >
                <RefreshCw size={12} className={isResending ? 'animate-spin' : ''} />
                <span>{isResending ? 'Reenviando...' : 'Reenviar código'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:text-[#102A43] font-medium"
              >
                Volver al paso 1
              </button>
            </div>
          </form>
        )}

        {/* PASO 3: Confirmación de Éxito */}
        {step === 3 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#DEF7EC] border border-[#BCF0DA] flex items-center justify-center text-[#0E9F6E] mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#102A43]">
                ¡Contraseña Actualizada!
              </h3>
              <p className="text-xs text-[#627D98] max-w-xs mx-auto leading-relaxed">
                Tu clave ha sido restablecida correctamente. Ya puedes ingresar con tu nueva contraseña.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full h-11 bg-[#102A43] hover:bg-[#243B53] text-[#FFFFFF] font-semibold text-sm rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Iniciar Sesión Ahora</span>
              <ArrowRight size={16} className="text-[#D6A84F]" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
