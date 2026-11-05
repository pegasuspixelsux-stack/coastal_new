'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { fallbackProperties, type HeroSlide, type HomeProperty } from '@/src/lib/homeData';
import { whatsappUrl } from '@/src/utils/format';
import { zones } from '@/src/lib/zones';
import SiteFooter from '@/src/components/SiteFooter';
import {
  ArrowUpRight,
  MapPin,
  Mail,
  Phone,
  Send,
  MessageCircle,
  Search,
  Home,
  Key,
  TrendingUp,
  Compass,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

// --- TEAM (placeholder people) ---
const team = [
  {
    name: "Elena Marlowe",
    role: "Fundadora y corredora principal",
    email: "elena@coastalweb.estate",
    phone: "+598 99 000 001",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Daniel Reyes",
    role: "Socio senior, adquisiciones",
    email: "daniel@coastalweb.estate",
    phone: "+598 99 000 002",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Sofia Lindqvist",
    role: "Directora de experiencia del cliente",
    email: "sofia@coastalweb.estate",
    phone: "+598 99 000 003",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "James Whitaker",
    role: "Director de estrategia de mercado",
    email: "james@coastalweb.estate",
    phone: "+598 99 000 004",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
  },
];

// --- SERVICES ---
const services = [
  {
    icon: Key,
    title: "Representación de compradores",
    description: "Acceso privado a residencias fuera de mercado en la costa, con la negociación a cargo nuestro de principio a fin.",
  },
  {
    icon: Home,
    title: "Asesoramiento a vendedores",
    description: "Posicionamiento a medida, fotografía y comercialización discreta para casas de valor arquitectónico.",
  },
  {
    icon: TrendingUp,
    title: "Tasación de mercado",
    description: "Precios basados en datos, ventas comparables y la evolución del mercado de Punta del Este.",
  },
  {
    icon: Compass,
    title: "Visitas privadas",
    description: "Visitas coordinadas y personalizadas con un especialista que conoce cada propiedad en detalle.",
  },
  {
    icon: ShieldCheck,
    title: "Debida diligencia",
    description: "Coordinación de inspecciones, normativa costera, permisos y estudio de títulos.",
  },
  {
    icon: Sparkles,
    title: "Mudanza con conserjería",
    description: "Acompañamiento en la mudanza, desde contratistas y diseñadores de confianza hasta la administración de la propiedad.",
  },
];

// --- SLIDES DEL HERO ---
// Se muestran hasta que carguen las propiedades destacadas (o si todavía no hay).
const fallbackSlides: HeroSlide[] = [
  {
    id: 1,
    title: "Villa Horizonte",
    location: "José Ignacio, Maldonado",
    price: "USD 14.500.000",
    tagline: "Privacidad absoluta frente a un horizonte infinito.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Santuario de la Barra",
    location: "La Barra, Maldonado",
    price: "USD 9.800.000",
    tagline: "Suspendida entre el cielo y el mar.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Pabellón de Cristal",
    location: "Manantiales, Maldonado",
    price: "USD 11.200.000",
    tagline: "Arquitectura que se integra a la naturaleza sin fisuras.",
    image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=2000&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Estancia Azul Océano",
    location: "Punta Ballena, Maldonado",
    price: "USD 18.500.000",
    tagline: "Lujo atemporal a orillas del agua.",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2000&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "La Casa de las Dunas",
    location: "José Ignacio, Maldonado",
    price: "USD 7.400.000",
    tagline: "Vida minimalista moldeada por el viento de la costa.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop",
  },
];

export default function CoastalWebHome({
  initialProperties = [],
  initialSlides = [],
}: {
  /** Active properties loaded on the server; the built-in samples show if there are none. */
  initialProperties?: HomeProperty[];
  initialSlides?: HeroSlide[];
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides] = useState<HeroSlide[]>(initialSlides.length ? initialSlides : fallbackSlides);
  const [properties] = useState<HomeProperty[]>(initialProperties.length ? initialProperties : fallbackProperties);
  const [showMoreZones, setShowMoreZones] = useState(false);
  const [lead, setLead] = useState({ name: '', email: '', property: '', message: '' });
  const [leadState, setLeadState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      setLeadState('error');
      return;
    }
    setLeadState('sending');
    try {
      await addDoc(collection(db, 'leads'), {
        name: lead.name.trim(),
        email: lead.email.trim(),
        property: lead.property || 'Representación general',
        message: lead.message.trim(),
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setLead({ name: '', email: '', property: '', message: '' });
      setLeadState('sent');
    } catch {
      setLeadState('error');
    }
  };

  // Auto-advance slideshow every 6 seconds
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);


  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] selection:bg-[#000000] selection:text-[#FFFFFF] font-sans antialiased">

      {/* --- NAVIGATION --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FBFBFD]/80 backdrop-blur-md border-b border-[#000000]/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight">Coastal.</span>
          <nav className="hidden md:flex items-center space-x-8 text-sm text-[#515154]">
            <Link href="/properties" className="hover:text-[#1D1D1F] transition-colors">Propiedades</Link>
            <a href="#vision" className="hover:text-[#1D1D1F] transition-colors">Nosotros</a>
            <a href="#contact" className="hover:text-[#1D1D1F] transition-colors">Contacto</a>
          </nav>
          <a
            href="#contact"
            className="bg-[#1D1D1F] text-[#FFFFFF] text-xs font-medium px-4 py-2 rounded-full hover:bg-[#333336] transition-all"
          >
            Visita privada
          </a>
        </div>
      </header>

      {/* --- ZONES STRIP (transparent, horizontally scrolling) --- */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex gap-6 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {zones.map((zone) => (
            <a
              key={zone.name}
              href={`/properties?q=${encodeURIComponent(zone.search)}`}
              className="shrink-0 whitespace-nowrap text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              {zone.name}
            </a>
          ))}
        </div>
      </div>

      {/* --- HERO SLIDESHOW (5-slide full-width) --- */}
      <section className="relative w-full h-[80vh] md:h-auto md:aspect-square lg:aspect-auto lg:h-screen overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              index === currentSlide ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Background Image with subtle zoom */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[7000ms] ease-out ${
                index === currentSlide ? 'scale-105' : 'scale-100'
              }`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Gradient Overlay for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
            </div>

            {/* Content Container */}
            <div className="relative max-w-7xl mx-auto h-full px-6 flex flex-col justify-end md:flex-row md:items-end gap-8 pb-8 md:pb-14 items-start text-left text-white">
              <div className="max-w-2xl md:mr-auto transform transition-all duration-700 translate-y-0">
                <div className="flex items-center space-x-2 text-white/80 text-sm font-medium tracking-wide mb-3 uppercase">
                  <MapPin className="w-4 h-4" />
                  <span>{slide.location}</span>
                  <span aria-hidden="true" className="text-white/40">·</span>
                  <span className="text-white">{slide.price}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-white/90 font-light">
                  {slide.tagline}
                </p>
              </div>
              <div className="hidden md:block md:pr-16">
                <a
                  href="#contact"
                  className="inline-flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-all"
                >
                  <span>Solicitar información</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Slideshow indicator: 3 vertical dots (first / middle / last slide) */}
        <div className={`absolute top-1/2 -translate-y-1/2 right-6 z-20 flex flex-col items-center gap-3 ${slides.length < 2 ? 'hidden' : ''}`}>
          {Array.from(new Set([0, Math.floor((slides.length - 1) / 2), slides.length - 1])).map((slideIndex, dot, arr) => {
            // The active dot is the one whose slide index is closest to the current slide.
            const active =
              arr.reduce((best, v, i) => (Math.abs(v - currentSlide) < Math.abs(arr[best] - currentSlide) ? i : best), 0) === dot;
            return (
              <button
                key={slideIndex}
                onClick={() => setCurrentSlide(slideIndex)}
                aria-label={`Ir a la diapositiva ${slideIndex + 1}`}
                aria-current={active ? 'true' : undefined}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  active ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>

        {/* Slide Indicators Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
      </section>

      {/* --- INTRO --- */}
      <section className="pt-28 md:pt-40 pb-12 md:pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-20 items-stretch">
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest text-[#515154] font-semibold">Vivir en Punta del Este</h2>
              <p className="text-3xl md:text-4xl font-semibold tracking-tight">
                Casas de autor, elegidas con criterio.
              </p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center space-x-2 text-sm font-medium text-[#1D1D1F] hover:text-[#515154] transition-colors"
            >
              <span>Ver todas las propiedades</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-5 text-[#515154] font-light leading-relaxed md:pt-8">
            <p>
              Desde Punta del Este hasta José Ignacio, representamos una colección acotada de
              residencias de diseño excepcional, con entorno y privacidad únicos. Cada casa se
              elige tanto por cómo se asienta en el paisaje como por su arquitectura, desde
              refugios entre las dunas hasta casas tranquilas a pasos del mar.
            </p>
            <p>
              Explore las zonas, recorra todas las propiedades o solicite una presentación
              privada. Trabajamos con un número limitado de clientes a la vez, para que cada
              búsqueda y cada venta reciba nuestra atención personal desde la primera
              conversación hasta la escritura.
            </p>
          </div>
        </div>
      </section>

      {/* --- FOCUS AREAS --- */}
      <section id="areas" className="pt-24 md:pt-32 pb-44 px-6 max-w-7xl mx-auto">
        <div className="max-w-xl mb-16">
          <h2 className="text-xs uppercase tracking-widest text-[#515154] font-semibold mb-3">Zonas en las que trabajamos</h2>
          <p className="text-3xl md:text-4xl font-semibold tracking-tight">
            Seis zonas exclusivas de la costa, conocidas a fondo.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {zones.filter((z) => !z.more).map((zone) => (
            <a
              key={zone.name}
              href={`/properties?q=${encodeURIComponent(zone.search)}`}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-[#E5E5EA] text-left p-8 flex flex-col justify-end transition-transform duration-500 hover:-translate-y-1"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${zone.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <span className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-black text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
                {(() => {
                  const count = properties.filter((p) =>
                    p.location.toLowerCase().includes(zone.search.toLowerCase())
                  ).length;
                  return `${count} ${count === 1 ? 'propiedad' : 'propiedades'}`;
                })()}
              </span>
              <span className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </span>
              <div className="relative z-10 text-white">
                <h3 className="text-2xl font-semibold tracking-tight mb-1">{zone.name}</h3>
                <p className="text-sm text-white/80 font-light">{zone.description}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Inventory links */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 items-center gap-4 text-sm">
          <Link
            href="/properties"
            className="justify-self-center md:justify-self-start inline-flex items-center space-x-2 font-medium text-[#1D1D1F] hover:text-[#515154] transition-colors"
          >
            <span>Ver todas las propiedades</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            href="/properties?advanced"
            className="justify-self-center inline-flex items-center space-x-2 bg-[#1D1D1F] text-white text-xs font-medium px-6 py-3 rounded-full hover:bg-[#333336] transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Búsqueda avanzada</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowMoreZones((o) => !o)}
            aria-expanded={showMoreZones}
            className="justify-self-center md:justify-self-end inline-flex items-center space-x-2 font-medium text-[#1D1D1F] hover:text-[#515154] transition-colors"
          >
            <span>{showMoreZones ? "Ver menos zonas" : "Ver más zonas"}</span>
            <ArrowUpRight className={`w-4 h-4 transition-transform ${showMoreZones ? "rotate-90" : ""}`} />
          </button>
        </div>

        {showMoreZones && (
          <ul className="mt-6 flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm">
            {zones.filter((z) => z.more).map((zone) => (
              <li key={zone.name}>
                <Link
                  href={`/properties?q=${encodeURIComponent(zone.search)}`}
                  className="inline-flex items-center space-x-1 text-[#515154] hover:text-[#1D1D1F] transition-colors"
                >
                  <span>{zone.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --- WHO WE ARE --- */}
      <section id="vision" className="pb-44 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-[#515154] font-semibold">Quiénes somos</h2>
            <p className="text-3xl md:text-4xl font-semibold tracking-tight">
              Una inmobiliaria boutique dedicada a Punta del Este.
            </p>
            <p className="text-[#515154] font-light leading-relaxed">
              Coastal representa una colección pequeña y cuidadosamente elegida de residencias de
              autor, de Punta del Este a José Ignacio. Trabajamos con un número limitado de
              clientes a la vez, para dedicar toda nuestra atención a cada compra y a cada venta.
            </p>
            <p className="text-[#515154] font-light leading-relaxed">
              Nuestro equipo combina un profundo conocimiento local con pasión por el diseño, y
              acompaña a cada comprador en todos los pasos con discreción, precisión y cuidado.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center space-x-2 text-sm font-medium text-[#1D1D1F] hover:text-[#515154] transition-colors"
            >
              <span>Contáctenos</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
          <div
            className="aspect-square rounded-2xl bg-cover bg-center bg-[#E5E5EA]"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1200&auto=format&fit=crop)',
            }}
          />
        </div>
      </section>

      {/* --- SERVICES --- */}
      <section id="services" className="pb-44 px-6 max-w-7xl mx-auto">
        <div className="max-w-xl mb-16">
          <h2 className="text-xs uppercase tracking-widest text-[#515154] font-semibold mb-3">Nuestros servicios</h2>
          <p className="text-3xl md:text-4xl font-semibold tracking-tight">
            Todo lo que necesita, resuelto con cuidado.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="aspect-[4/3] flex flex-col rounded-2xl bg-white border border-[#000000]/5 p-8 shadow-sm transition-transform duration-500 hover:-translate-y-1"
            >
              <span className="w-11 h-11 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-auto">
                <Icon className="w-5 h-5 text-[#1D1D1F]" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight mb-2">{title}</h3>
              <p className="text-sm text-[#515154] font-light leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- TEAM --- */}
      <section id="team" className="pb-44 px-6 max-w-7xl mx-auto">
        <div className="max-w-xl mb-16">
          <h2 className="text-xs uppercase tracking-widest text-[#515154] font-semibold mb-3">Nuestro equipo</h2>
          <p className="text-3xl md:text-4xl font-semibold tracking-tight">
            Las personas detrás de cada residencia.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((member) => (
            <div key={member.name}>
              <div
                className="aspect-square rounded-2xl bg-cover bg-center bg-[#E5E5EA] mb-4"
                style={{ backgroundImage: `url(${member.image})` }}
                role="img"
                aria-label={member.name}
              />
              <h3 className="text-base font-semibold tracking-tight">{member.name}</h3>
              <p className="text-xs text-[#515154] font-light mt-1">{member.role}</p>
              <div className="mt-3 flex flex-col gap-1 text-xs">
                <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1.5 text-[#1D1D1F] hover:text-[#515154] transition-colors break-all">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>{member.email}</span>
                </a>
                <a
                  href={whatsappUrl(member.phone, "Hola, quisiera hacer una consulta.") ?? `tel:${member.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#1D1D1F] hover:text-[#515154] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp {member.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- CALL TO ACTION & CONTACT FORM --- */}
      <section id="contact" className="py-44 px-6 bg-[#F2F2F7] border-t border-b border-[#000000]/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left Column: Company Data & Value Prop */}
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[#515154] font-semibold mb-3">Adquisición privada</h2>
            <p className="text-3xl md:text-5xl font-semibold tracking-tight mb-6">
              Comience su camino hacia una vida excepcional junto al mar.
            </p>
            <p className="text-[#515154] font-light leading-relaxed mb-12">
              Nuestros asesores trabajan con absoluta discreción y representan referentes de la arquitectura en la costa de Punta del Este. Contáctenos para coordinar una visita privada o para publicar una propiedad distinguida.
            </p>

            <div className="space-y-6 pt-6 border-t border-[#000000]/10">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1D1D1F]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-[#515154] uppercase tracking-wider font-semibold">Oficina</p>
                  <p className="text-sm font-medium">Av. Gorlero 1010, Punta del Este, Maldonado</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1D1D1F]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-[#515154] uppercase tracking-wider font-semibold">Consultas</p>
                  <p className="text-sm font-medium">concierge@coastalweb.estate</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1D1D1F]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-[#515154] uppercase tracking-wider font-semibold">Teléfono</p>
                  <p className="text-sm font-medium">+598 42 000 000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Minimalist Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-[#000000]/5">
            <form onSubmit={submitLead} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#515154] mb-2">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={lead.name}
                  onChange={(e) => setLead({ ...lead, name: e.target.value })}
                  placeholder="Juan Pérez"
                  className="w-full bg-[#FBFBFD] border border-[#000000]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1D1D1F] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#515154] mb-2">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={lead.email}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                  placeholder="juan@ejemplo.com"
                  className="w-full bg-[#FBFBFD] border border-[#000000]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1D1D1F] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#515154] mb-2">Propiedad de interés</label>
                <select
                  value={lead.property}
                  onChange={(e) => setLead({ ...lead, property: e.target.value })}
                  className="w-full bg-[#FBFBFD] border border-[#000000]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1D1D1F] transition-colors text-[#1D1D1F]"
                >
                  <option value="">Representación general</option>
                  {properties.map((p) => (
                    <option key={p.id} value={`${p.title}, ${p.location}`}>
                      {p.title}, {p.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#515154] mb-2">Mensaje</label>
                <textarea
                  rows={4}
                  value={lead.message}
                  onChange={(e) => setLead({ ...lead, message: e.target.value })}
                  placeholder="Cuéntenos sus plazos o requisitos específicos..."
                  className="w-full bg-[#FBFBFD] border border-[#000000]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1D1D1F] transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={leadState === 'sending'}
                className="w-full bg-[#1D1D1F] text-white py-3.5 rounded-xl text-sm font-medium hover:bg-[#333336] transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
              >
                <span>{leadState === 'sending' ? 'Enviando…' : 'Enviar consulta'}</span>
                <Send className="w-4 h-4" />
              </button>
              {leadState === 'sent' && (
                <p role="status" className="text-sm text-green-700 text-center">
                  Gracias: un asesor se pondrá en contacto a la brevedad.
                </p>
              )}
              {leadState === 'error' && (
                <p role="alert" className="text-sm text-red-600 text-center">
                  Algo salió mal. Inténtelo de nuevo o escríbanos directamente por correo.
                </p>
              )}
            </form>
          </div>

        </div>
      </section>

      <SiteFooter />

    </div>
  );
}
