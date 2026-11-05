import type { Metadata } from 'next';
import { fallbackProperties, loadHomeData } from '@/src/lib/homeData';
import PropertiesInventory from '@/src/components/PropertiesInventory';
import { PublicHeader } from '@/src/components/PublicChrome';
import SiteFooter from '@/src/components/SiteFooter';

export const metadata: Metadata = {
  title: 'All Properties | Coastal',
  description: 'Browse every residence in the Coastal collection and filter by location, bedrooms and price.',
};

// Rebuilt at most once a minute, like the homepage.
export const revalidate = 60;

type Props = { searchParams: Promise<{ q?: string | string[]; advanced?: string | string[] }> };

export default async function PropertiesPage({ searchParams }: Props) {
  const { q, advanced } = await searchParams;
  const { properties } = await loadHomeData();

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans antialiased">
      <PublicHeader />
      <main className="pt-28 pb-32 px-6 max-w-7xl mx-auto">
        <div className="max-w-xl mb-10">
          <h1 className="text-xs uppercase tracking-widest text-[#515154] font-semibold mb-3">Inventory</h1>
          <p className="text-3xl md:text-4xl font-semibold tracking-tight">All properties</p>
        </div>
        <PropertiesInventory
          properties={properties.length ? properties : fallbackProperties}
          initialQuery={typeof q === 'string' ? q : ''}
          initialFiltersOpen={advanced !== undefined}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
