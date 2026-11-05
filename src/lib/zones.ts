// --- ZONAS ---
// Las zonas con `more: true` se muestran en la franja superior y en "Ver más zonas", sin tarjeta propia.
export const zones: { name: string; search: string; description: string; image: string; more?: boolean }[] = [
  {
    name: "José Ignacio",
    search: "José Ignacio",
    description: "El pueblo más reservado de la costa: dunas, faro y estancias frente al mar.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Manantiales",
    search: "Manantiales",
    description: "Casas de diseño entre pinos y dunas, a pasos de la playa más elegante del verano.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "La Barra",
    search: "La Barra",
    description: "Chacras y residencias de autor sobre el arroyo Maldonado y el mar abierto.",
    image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Punta Ballena",
    search: "Punta Ballena",
    description: "Casas sobre la ladera con vistas panorámicas a la bahía y al atardecer.",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Laguna Garzón",
    search: "Laguna Garzón",
    description: "Naturaleza abierta, privacidad absoluta y terrenos frente a la laguna.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Península",
    search: "Punta del Este",
    description: "El corazón histórico de Punta del Este: residencias clásicas y puerto a pasos.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
  },
  { name: "La Brava", search: "Brava", description: "", image: "", more: true },
  { name: "La Mansa", search: "Mansa", description: "", image: "", more: true },
  { name: "Chacras y Campos", search: "Chacra", description: "", image: "", more: true },
];
