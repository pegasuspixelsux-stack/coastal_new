'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bath, Bed, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import PropertyImage from './PropertyImage';
import type { HomeProperty } from '../lib/homeData';

/** Swipeable slider of recommended listings, shown above the footer on the properties page. */
export default function RecommendedProperties({ properties }: { properties: HomeProperty[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update, properties.length]);

  const scroll = (direction: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  if (!properties.length) return null;

  return (
    <section aria-label="Propiedades similares" className="max-w-7xl mx-auto px-6 pb-28 md:pb-40">
      <div className="flex items-end justify-between gap-4 mb-10">
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[#515154] font-semibold mb-3">También le puede interesar</h2>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">Propiedades similares</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canPrev}
            aria-label="Propiedades anteriores"
            className="w-11 h-11 rounded-full bg-white border border-[#000000]/5 flex items-center justify-center hover:bg-[#F5F5F7] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canNext}
            aria-label="Propiedades siguientes"
            className="w-11 h-11 rounded-full bg-white border border-[#000000]/5 flex items-center justify-center hover:bg-[#F5F5F7] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <ul
        ref={track}
        onScroll={update}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6 scroll-px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {properties.map((p) => {
          const cardClass =
            'group relative aspect-square rounded-2xl overflow-hidden bg-[#E5E5EA] flex flex-col justify-end p-4 transition-transform duration-500 hover:-translate-y-1';
          const content = (
            <>
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                <PropertyImage
                  src={p.image}
                  alt={`${p.title}, ${p.location}`}
                  variant="card"
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 58vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <span className="bg-white/90 backdrop-blur-md text-black text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                  {p.price}
                </span>
                <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="relative z-10 text-white">
                <p className="text-[10px] text-white/70 font-medium tracking-wide uppercase mb-1">{p.location}</p>
                <h3 className="text-base font-semibold tracking-tight mb-2 leading-snug">{p.title}</h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 border-t border-white/20 text-[10px] text-white/80 font-medium">
                  <div className="flex items-center space-x-1">
                    <Bed className="w-3 h-3" />
                    <span>{p.beds} Dorm.</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bath className="w-3 h-3" />
                    <span>{p.baths} Baños</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Maximize className="w-3 h-3" />
                    <span>{p.area}</span>
                  </div>
                </div>
              </div>
            </>
          );
          return (
            <li key={p.id} className="snap-start shrink-0 w-[58%] sm:w-[calc(33.333%-16px)] lg:w-[calc(20%-19.2px)]">
              {p.href ? (
                // Plain anchor on purpose: a full page load works on every browser, including iPhones.
                <a href={p.href} aria-label={`Ver ${p.title}`} className={cardClass}>
                  {content}
                </a>
              ) : (
                <div className={cardClass}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
