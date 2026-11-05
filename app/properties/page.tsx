import type { Metadata } from 'next';
import { fallbackProperties, loadHomeData } from '@/src/lib/homeData';
import PropertiesList from '@/src/components/PropertiesList';
import { PublicHeader } from '@/src/components/PublicChrome';
import RecommendedProperties from '@/src/components/RecommendedProperties';
import SiteFooter from '@/src/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Propiedades | Coastal',
  description: 'Recorra todas las residencias de la colección Coastal y filtre por ubicación, dormitorios y precio.',
};

// Rebuilt at most once a minute, like the homepage.
export const revalidate = 60;

type Props = { searchParams: Promise<{ q?: string | string[]; advanced?: string | string[] }> };

const parsePrice = (price: string) => Number(price.replace(/[^0-9]/g, ''));

export default async function PropertiesPage({ searchParams }: Props) {
  const { q, advanced } = await searchParams;
  const { properties } = await loadHomeData();
  const all = properties.length ? properties : fallbackProperties;
  // Spotlight the priciest listings; the inventory grid above already shows everything.
  const recommended = [...all]
    .sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans antialiased">
      <PublicHeader />
      <main className="pt-28 pb-32 px-6 max-w-7xl mx-auto">
        <div className="max-w-xl mb-10">
          <h1 className="text-xs uppercase tracking-widest text-[#515154] font-semibold mb-3">Propiedades</h1>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">Todas las propiedades</p>
        </div>
        <PropertiesList
          properties={all}
          initialQuery={typeof q === 'string' ? q : ''}
          initialFiltersOpen={advanced !== undefined}
        />
      </main>
      <RecommendedProperties properties={recommended} />
      <SiteFooter />
    </div>
  );
}
