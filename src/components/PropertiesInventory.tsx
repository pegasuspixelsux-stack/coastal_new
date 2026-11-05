'use client';

import { useState } from 'react';
import { ArrowUpRight, Bath, Bed, Maximize, Search, SlidersHorizontal } from 'lucide-react';
import type { HomeProperty } from '@/src/lib/homeData';
import PropertyImage from '@/src/components/PropertyImage';

const parsePrice = (price: string) => Number(price.replace(/[^0-9]/g, ''));
const priceOptions = [8_000_000, 10_000_000, 12_000_000, 15_000_000];

/** Full inventory: search, filters and the property grid. */
export default function PropertiesInventory({
  properties,
  initialQuery = '',
  initialFiltersOpen = false,
}: {
  properties: HomeProperty[];
  initialQuery?: string;
  /** Opens the filter row on mobile (it is always visible on md+). */
  initialFiltersOpen?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [filtersOpen, setFiltersOpen] = useState(initialFiltersOpen);
  const [locationFilter, setLocationFilter] = useState('all');
  const [minBeds, setMinBeds] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0); // 0 = any

  const locations = Array.from(new Set(properties.map((p) => p.location)));
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProperties = properties.filter((p) => {
    const matchesQuery =
      !normalizedQuery || `${p.title} ${p.location}`.toLowerCase().includes(normalizedQuery);
    const matchesLocation = locationFilter === 'all' || p.location === locationFilter;
    const matchesBeds = p.beds >= minBeds;
    const matchesPrice = maxPrice === 0 || parsePrice(p.price) <= maxPrice;
    return matchesQuery && matchesLocation && matchesBeds && matchesPrice;
  });
  const hasActiveFilters =
    normalizedQuery !== '' || locationFilter !== 'all' || minBeds !== 0 || maxPrice !== 0;
  const resetFilters = () => {
    setQuery('');
    setLocationFilter('all');
    setMinBeds(0);
    setMaxPrice(0);
  };

  return (
    <>
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="bg-white rounded-2xl shadow-lg border border-[#000000]/5 p-3 flex flex-col gap-3"
      >
        <div className="flex items-center gap-2 pl-3">
          <Search className="hidden md:block w-5 h-5 text-[#515154] shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or location…"
            aria-label="Search properties"
            className="min-w-0 flex-1 bg-transparent px-2 md:px-4 py-3 text-sm text-[#1D1D1F] placeholder:text-[#86868B] outline-none"
          />
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-label="Toggle filters"
            aria-expanded={filtersOpen}
            aria-controls="search-filters"
            className={`md:hidden relative shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              filtersOpen ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveFilters && !filtersOpen && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#1D1D1F] ring-2 ring-white" />
            )}
          </button>
        </div>

        <div
          id="search-filters"
          className={`${filtersOpen ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-3 px-3 pb-1 pt-3 border-t border-[#000000]/5 text-xs`}
        >
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            aria-label="Filter by location"
            className="bg-[#F5F5F7] rounded-full px-4 py-2.5 text-[#1D1D1F] outline-none cursor-pointer"
          >
            <option value="all">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <select
            value={minBeds}
            onChange={(e) => setMinBeds(Number(e.target.value))}
            aria-label="Minimum bedrooms"
            className="bg-[#F5F5F7] rounded-full px-4 py-2.5 text-[#1D1D1F] outline-none cursor-pointer"
          >
            <option value={0}>Any beds</option>
            {[3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n}+ beds</option>
            ))}
          </select>
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            aria-label="Maximum price"
            className="bg-[#F5F5F7] rounded-full px-4 py-2.5 text-[#1D1D1F] outline-none cursor-pointer"
          >
            <option value={0}>Any price</option>
            {priceOptions.map((n) => (
              <option key={n} value={n}>Up to ${n / 1_000_000}M</option>
            ))}
          </select>
          <span className="text-[#515154] ml-auto">
            {filteredProperties.length} of {properties.length} residences
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[#1D1D1F] underline underline-offset-2 hover:text-[#515154]"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProperties.length === 0 && (
          <p className="col-span-full text-center text-[#515154] text-sm">
            No residences match your search and filters.
          </p>
        )}
        {filteredProperties.map((prop) => {
          const cardClass =
            'group relative aspect-square rounded-2xl overflow-hidden bg-[#E5E5EA] flex flex-col justify-end p-8 transition-transform duration-500 hover:-translate-y-1';
          const content = (
            <>
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                <PropertyImage
                  src={prop.image}
                  alt={`${prop.title}, ${prop.location}`}
                  variant="card"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                <span className="bg-white/90 backdrop-blur-md text-black text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
                  {prop.price}
                </span>
                <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <div className="relative z-10 text-white">
                <p className="text-xs text-white/70 font-medium tracking-wide uppercase mb-1">{prop.location}</p>
                <h3 className="text-2xl font-semibold tracking-tight mb-4">{prop.title}</h3>
                <div className="flex items-center space-x-6 pt-4 border-t border-white/20 text-xs text-white/80 font-medium">
                  <div className="flex items-center space-x-1.5">
                    <Bed className="w-4 h-4" />
                    <span>{prop.beds} Beds</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Bath className="w-4 h-4" />
                    <span>{prop.baths} Baths</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Maximize className="w-4 h-4" />
                    <span>{prop.area}</span>
                  </div>
                </div>
              </div>
            </>
          );
          return prop.href ? (
            // Plain anchor on purpose: a full page load works on every browser, including iPhones.
            <a key={prop.id} href={prop.href} className={cardClass} aria-label={`View ${prop.title}`}>
              {content}
            </a>
          ) : (
            <div key={prop.id} className={cardClass}>
              {content}
            </div>
          );
        })}
      </div>
    </>
  );
}
