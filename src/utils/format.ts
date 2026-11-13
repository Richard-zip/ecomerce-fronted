/**
 * Utilidades de formato para la moneda oficial de la plataforma: Pesos Colombianos (COP)
 */

export const formatCOP = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null) return '$ 0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$ 0';

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Formatea un número con separadores de miles de Colombia (puntos) sin símbolo de moneda
 * Ej: 25000 -> "25.000"
 */
export const formatCOPNumber = (amount: number): string => {
  if (isNaN(amount)) return '0';
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Convierte una entrada de texto formateada (ej: "25.000") a número entero limpio
 */
export const parseCOP = (val: string): number => {
  const digits = val.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

/**
 * Formatea el texto en vivo a medida que el usuario escribe el precio
 * Ej: "2" -> "2", "20" -> "20", "2000" -> "2.000", "20000" -> "20.000"
 */
export const formatCOPInput = (val: string): string => {
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Campus oficial único de la institución
 */
export const OFFICIAL_CAMPUS = 'Centro Tutorial Cereté';

/**
 * Limpia y extrae los 10 dígitos locales de un número celular colombiano.
 * En Colombia los celulares constan de 10 dígitos y siempre inician por 3 (ej: 300 123 4567).
 * Remueve el prefijo de país 57 si está presente (evitando duplicaciones al formatear).
 */
export const extractColombianDigits = (phone: string): string => {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');

  // Si contiene el prefijo de país 57 al inicio:
  // (ya sea porque viene con +57, tiene más de 10 dígitos, o inicia por 57 seguido de 3)
  if (digits.startsWith('57') && (digits.length > 10 || digits.slice(2).startsWith('3') || digits.length === 2)) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 10);
};

/**
 * Valida si un número es estrictamente un celular colombiano válido:
 * - Debe tener exactamente 10 dígitos
 * - Debe iniciar por 3 (3XX XXX XXXX)
 */
export const isValidColombianPhone = (phone: string): boolean => {
  const digits = extractColombianDigits(phone);
  return digits.length === 10 && digits.startsWith('3');
};

/**
 * Formatea automáticamente a medida que el usuario escribe los 10 dígitos locales:
 * 3XX XXX XXXX (sin prefijo +57 repetido, ideal para inputs con badge de país)
 */
export const formatColombianPhone = (phone: string): string => {
  const digits = extractColombianDigits(phone);
  if (!digits) return '';
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
};

/**
 * Retorna el teléfono formateado con el prefijo internacional para visualización pública:
 * +57 3XX XXX XXXX
 */
export const displayColombianPhone = (phone: string): string => {
  const digits = extractColombianDigits(phone);
  if (!digits) return '';
  if (digits.length <= 3) {
    return `+57 ${digits}`;
  }
  if (digits.length <= 6) {
    return `+57 ${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  return `+57 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
};

/**
 * Retorna el número en formato internacional limpio para WhatsApp (ej: 573001234567)
 */
export const toWhatsAppClean = (phone: string): string => {
  const digits = extractColombianDigits(phone);
  return digits ? `57${digits}` : '';
};
