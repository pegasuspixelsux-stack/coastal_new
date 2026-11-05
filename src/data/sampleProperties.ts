import type { PropertyInput, PropertyLocation } from '../types/firestore';

type Sample = Omit<PropertyInput, 'agentId'>;

const UY = 'Uruguay';
const STATE = 'Maldonado';
const sqftToM2 = (sqft: number) => Math.round(sqft * 0.092903);
const place = (city: string): PropertyLocation => ({ city, state: STATE, country: UY });

function sample(
  title: string,
  city: string,
  price: number,
  bedrooms: number,
  bathrooms: number,
  sqft: number,
  imageId: string,
  description: string
): Sample {
  return {
    title,
    description,
    type: 'house',
    operation: 'sale',
    price,
    currency: 'USD',
    location: place(city),
    specs: { bedrooms, bathrooms, areaM2: sqftToM2(sqft) },
    photos: [
      { url: `https://images.unsplash.com/photo-${imageId}?q=80&w=1200&auto=format&fit=crop` },
    ],
    status: 'active',
  };
}

/** The nine properties from the website mockup (Punta del Este area). */
export const sampleProperties: Sample[] = [
  sample('Villa Horizonte', 'José Ignacio', 14_500_000, 5, 6, 6200, '1600585154340-be6161a56a0c',
    'Privacidad absoluta frente a un horizonte infinito.'),
  sample('Santuario de la Barra', 'La Barra', 9_800_000, 4, 4.5, 4500, '1600607687939-ce8a6c25118c',
    'Suspendida entre el cielo y el mar.'),
  sample('Pabellón de Cristal', 'Manantiales', 11_200_000, 3, 3.5, 3900, '1600566753376-12c8ab7fb75b',
    'Arquitectura que se integra a la naturaleza sin fisuras.'),
  sample('Estancia Azul Océano', 'Punta Ballena', 18_500_000, 6, 7, 8100, '1613490493576-7fde63acd811',
    'Lujo atemporal a orillas del agua.'),
  sample('La Casa de las Dunas', 'José Ignacio', 7_400_000, 3, 3, 3200, '1512917774080-9991f1c4c750',
    'Vida minimalista moldeada por el viento de la costa.'),
  sample('Horizonte Atlántico', 'Punta del Este', 12_900_000, 4, 5, 5100, '1600596542815-ffad4c1539a9',
    'Residencia con vistas abiertas al mar, a pasos de la Península.'),
  sample('Terraza de los Eucaliptos', 'Laguna Garzón', 6_900_000, 4, 4, 4100, '1600585154526-990dced4db0d',
    'Retiro tranquilo entre eucaliptos, a minutos de la costa.'),
  sample('Casa de la Marea', 'La Barra', 10_600_000, 5, 5.5, 5400, '1600047509807-ba8f99d2cdde',
    'Vida costera llena de luz, con espacio para recibir.'),
  sample('Refugio Madera de Mar', 'Punta Ballena', 13_400_000, 5, 6, 5800, '1600573472550-8090b5e0745e',
    'Residencia con vista al mar sobre la ladera de la bahía.'),
];

/**
 * Old English titles → the Spanish title, description and location from `sampleProperties`
 * (same order). Used by the dashboard's one-click "Convertir a Punta del Este" tool to fix
 * listings that were imported before the site moved to Uruguay.
 */
const LEGACY_TITLES = [
  'The Horizon Villa',
  'Cliffside Sanctuary',
  'The Glass Pavilion',
  'Ocean Blue Estate',
  'The Dune House',
  'Pacific Horizon',
  'Redwood Terrace',
  'Tidewater House',
  'Driftwood Retreat',
];

export const legacyReplacements = LEGACY_TITLES.map((legacyTitle, i) => ({
  legacyTitle,
  title: sampleProperties[i].title,
  description: sampleProperties[i].description,
  location: sampleProperties[i].location,
}));
