import type { PropertyOperation, PropertyStatus, PropertyType } from '../types/firestore';

export function formatMoney(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString('es-UY')}`;
  }
}

/** "USD 250.000" / "UYU 10.200.000": currency code plus the amount. */
export function formatPriceWithCode(price: number, currency: string): string {
  return `${currency} ${Math.round(price).toLocaleString('es-UY')}`;
}

export const operationLabels: Record<PropertyOperation, string> = {
  sale: 'Venta',
  rent: 'Alquiler',
  seasonal: 'Temporada',
};

export const typeLabels: Record<PropertyType, string> = {
  apartment: 'Apartamento',
  house: 'Casa',
  land: 'Terreno',
  commercial: 'Comercial',
};

export const statusLabels: Record<PropertyStatus, string> = {
  active: 'Activa',
  reserved: 'Reservada',
  sold: 'Vendida',
};

/** Builds a click-to-chat link. Returns null if the number has no usable digits. */
export function whatsappUrl(phone: string, text: string): string | null {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2); // 00598… -> 598…
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function timeAgo(ms: number): string {
  if (!ms) return '';
  const seconds = Math.round((Date.now() - ms) / 1000);
  if (seconds < 60) return 'ahora mismo';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `hace ${days} d`;
  return new Date(ms).toLocaleDateString('es-UY');
}
