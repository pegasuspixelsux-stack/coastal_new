import { getActiveProperties } from '../services/dbService';
import type { Property } from '../types/firestore';
import { formatMoney, operationLabels, typeLabels } from '../utils/format';
import { ikUrl } from '../utils/imagekit';
import { MAX_FEATURED } from './featured';

export type HeroSlide = {
  id: number | string;
  title: string;
  location: string;
  price: string;
  tagline: string;
  image: string;
  /** Property detail page; only set for slides built from Firestore properties. */
  href?: string;
};

export type HomeProperty = {
  id: number | string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  area: string;
  image: string;
  /** Detail page; only set for properties stored in Firestore. */
  href?: string;
};

const place = (p: Property) => [p.location.city, p.location.state].filter(Boolean).join(', ');

function toSlide(p: Property): HeroSlide {
  const sentence = p.description.split(/(?<=[.!?])\s/)[0].trim();
  const tagline = sentence
    ? sentence.length > 110
      ? `${sentence.slice(0, 107).trimEnd()}…`
      : sentence
    : `${operationLabels[p.operation]} · ${typeLabels[p.type]}`;
  return {
    id: p.id,
    href: `/properties/${p.id}`,
    title: p.title,
    location: place(p),
    price: formatMoney(p.price, p.currency),
    tagline,
    image: ikUrl(p.photos[0]?.url ?? '', 'w-2000,q-80,f-auto'),
  };
}

function toHomeProperty(p: Property): HomeProperty {
  return {
    id: p.id,
    href: `/properties/${p.id}`,
    title: p.title,
    location: place(p),
    price: formatMoney(p.price, p.currency),
    beds: p.specs.bedrooms,
    baths: p.specs.bathrooms,
    area: `${p.specs.areaM2.toLocaleString('es-UY')} m²`,
    image: p.photos[0]?.url ?? '',
  };
}

/**
 * Homepage data, loaded on the server so the links to each property page are in the
 * HTML that reaches the browser (no client-side database request needed).
 * Hero: MAX_FEATURED slides — the featured properties (newest first), then the newest others to fill the gaps.
 */
export async function loadHomeData(): Promise<{ properties: HomeProperty[]; slides: HeroSlide[] }> {
  try {
    const active = await getActiveProperties();
    const featured = active.filter((p) => p.featured);
    // Always 5 slides: the featured listings first, topped up with the newest others if fewer are featured.
    const others = active.filter((p) => !p.featured);
    const hero = [...featured.slice(0, MAX_FEATURED), ...others].slice(0, MAX_FEATURED);
    return { properties: active.map(toHomeProperty), slides: hero.map(toSlide) };
  } catch {
    return { properties: [], slides: [] }; // the page falls back to its built-in samples
  }
}

// --- PROPIEDADES DE EJEMPLO (se muestran si no hay datos) ---
export const fallbackProperties: HomeProperty[] = [
  {
    id: 1,
    title: "Villa Horizonte",
    location: "José Ignacio, Maldonado",
    price: "USD 14.500.000",
    beds: 5,
    baths: 6,
    area: "575 m²",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Santuario de la Barra",
    location: "La Barra, Maldonado",
    price: "USD 9.800.000",
    beds: 4,
    baths: 4.5,
    area: "418 m²",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Pabellón de Cristal",
    location: "Manantiales, Maldonado",
    price: "USD 11.200.000",
    beds: 3,
    baths: 3.5,
    area: "362 m²",
    image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Estancia Azul Océano",
    location: "Punta Ballena, Maldonado",
    price: "USD 18.500.000",
    beds: 6,
    baths: 7,
    area: "752 m²",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "La Casa de las Dunas",
    location: "José Ignacio, Maldonado",
    price: "USD 7.400.000",
    beds: 3,
    baths: 3,
    area: "297 m²",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Horizonte Atlántico",
    location: "Punta del Este, Maldonado",
    price: "USD 12.900.000",
    beds: 4,
    baths: 5,
    area: "474 m²",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 7,
    title: "Terraza de los Eucaliptos",
    location: "Laguna Garzón, Maldonado",
    price: "USD 6.900.000",
    beds: 4,
    baths: 4,
    area: "381 m²",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 8,
    title: "Casa de la Marea",
    location: "La Barra, Maldonado",
    price: "USD 10.600.000",
    beds: 5,
    baths: 5.5,
    area: "502 m²",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 9,
    title: "Refugio Madera de Mar",
    location: "Punta Ballena, Maldonado",
    price: "USD 13.400.000",
    beds: 5,
    baths: 6,
    area: "539 m²",
    image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=800&auto=format&fit=crop",
  },
];
