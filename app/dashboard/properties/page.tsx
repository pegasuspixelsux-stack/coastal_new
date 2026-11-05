'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, LayoutGrid, Plus, Rows3 } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useProperties } from '@/src/hooks/useProperties';
import { MAX_FEATURED } from '@/src/lib/featured';
import { countFeaturedProperties, seedSampleProperties } from '@/src/services/dbService';
import { PropertyGrid, PropertyTable } from '@/src/components/dashboard/PropertyViews';
import { PageHeader, cardClass } from '@/src/components/dashboard/ui';
import { operationLabels, statusLabels, typeLabels } from '@/src/utils/format';
import type { Property, PropertyOperation, PropertyStatus, PropertyType } from '@/src/types/firestore';

const selectClass =
  'bg-white border border-[#000000]/5 rounded-full px-4 py-2.5 text-xs outline-none cursor-pointer';

type View = 'grid' | 'table';
const VIEW_KEY = 'dashboard-properties-view';
const VIEW_EVENT = 'dashboard-properties-view-change';
const DEFAULT_VIEW: View = 'table'; // list is the default layout

// The chosen layout is remembered on this device. Storage can be unavailable, so it is optional.
function getView(): View {
  try {
    const saved = localStorage.getItem(VIEW_KEY);
    return saved === 'grid' || saved === 'table' ? saved : DEFAULT_VIEW;
  } catch {
    return DEFAULT_VIEW;
  }
}
function subscribeView(onChange: () => void) {
  window.addEventListener(VIEW_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(VIEW_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}
function setView(v: View) {
  try {
    localStorage.setItem(VIEW_KEY, v);
  } catch {}
  window.dispatchEvent(new Event(VIEW_EVENT));
}

export default function PropertiesPage() {
  const { agent } = useAuth();
  const { items, loading, loadingMore, error, hasMore, loadMore, reload, update, remove } = useProperties();
  const [importing, setImporting] = useState(false);
  const view = useSyncExternalStore(subscribeView, getView, () => DEFAULT_VIEW);
  const [operation, setOperation] = useState<PropertyOperation | 'all'>('all');
  const [type, setType] = useState<PropertyType | 'all'>('all');
  const [neighborhood, setNeighborhood] = useState('all');
  const [status, setStatus] = useState<PropertyStatus | 'all'>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const neighborhoods = useMemo(
    () =>
      Array.from(new Set(items.map((p) => p.location.neighborhood).filter(Boolean) as string[])).sort(),
    [items]
  );

  const filtered = items.filter(
    (p) =>
      (operation === 'all' || p.operation === operation) &&
      (type === 'all' || p.type === type) &&
      (status === 'all' || p.status === status) &&
      (neighborhood === 'all' || p.location.neighborhood === neighborhood) &&
      (!featuredOnly || p.featured)
  );
  const featuredCount = items.filter((p) => p.featured).length;
  const hasFilters = operation !== 'all' || type !== 'all' || status !== 'all' || neighborhood !== 'all' || featuredOnly;

  const importSamples = async () => {
    if (!agent) return;
    setImporting(true);
    setActionError(null);
    try {
      await seedSampleProperties(agent.id, { name: agent.name, phone: agent.phone });
      await reload();
    } catch {
      setActionError('Could not import the sample properties. Check that the Firestore rules are published.');
    } finally {
      setImporting(false);
    }
  };

  const onToggleFeatured = async (p: Property) => {
    setActionError(null);
    try {
      if (!p.featured && (await countFeaturedProperties(p.id)) >= MAX_FEATURED) {
        setActionError(`Only ${MAX_FEATURED} listings can be featured on the homepage. Remove the star from another listing first.`);
        return;
      }
      await update(p, { featured: !p.featured });
    } catch {
      setActionError('Could not update the property. You can only change your own listings.');
    }
  };

  const onDelete = async (p: Property) => {
    if (!window.confirm(`Delete “${p.title}”? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await remove(p);
    } catch {
      setActionError('Could not delete the property. You can only delete your own listings.');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Properties"
        description={`${items.length} listing${items.length === 1 ? '' : 's'} loaded`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/properties/import"
              className="inline-flex items-center gap-2 bg-white border border-[#1D1D1F] text-[#1D1D1F] text-xs font-medium px-5 py-3 rounded-full hover:bg-[#1D1D1F] hover:text-white transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" /> Import from Excel
            </Link>
          <Link
              href="/dashboard/properties/new"
              className="inline-flex items-center gap-2 bg-[#1D1D1F] text-white text-xs font-medium px-5 py-3 rounded-full hover:bg-[#333336] transition-all"
            >
              <Plus className="w-4 h-4" /> Add listing
            </Link>
          </div>
        }
      />

      {/* Filters + view toggle */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select value={operation} onChange={(e) => setOperation(e.target.value as PropertyOperation | 'all')} aria-label="Filter by operation" className={selectClass}>
          <option value="all">All operations</option>
          {Object.entries(operationLabels).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as PropertyType | 'all')} aria-label="Filter by property type" className={selectClass}>
          <option value="all">All types</option>
          {Object.entries(typeLabels).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} aria-label="Filter by neighborhood" className={selectClass}>
          <option value="all">All neighborhoods</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus | 'all')} aria-label="Filter by status" className={selectClass}>
          <option value="all">All statuses</option>
          {Object.entries(statusLabels).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 bg-white border border-[#000000]/5 rounded-full px-4 py-2.5 text-xs cursor-pointer">
          <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
          Featured only
        </label>
        {hasFilters && (
          <button
            onClick={() => {
              setFeaturedOnly(false);
              setOperation('all');
              setType('all');
              setStatus('all');
              setNeighborhood('all');
            }}
            className="text-xs underline underline-offset-2 text-[#515154] hover:text-[#1D1D1F]"
          >
            Reset
          </button>
        )}

        <div className="ml-auto inline-flex rounded-full bg-white border border-[#000000]/5 p-1" role="group" aria-label="View">
          {([
            ['grid', LayoutGrid, 'Grid'],
            ['table', Rows3, 'List'],
          ] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              aria-pressed={view === key}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full transition-colors ${
                view === key ? 'bg-[#1D1D1F] text-white' : 'text-[#515154] hover:bg-[#F5F5F7]'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {featuredCount > MAX_FEATURED && (
        <p className="mb-4 rounded-2xl bg-[#F5F5F7] px-5 py-3 text-sm">
          {featuredCount} listings are featured, but only {MAX_FEATURED} are allowed. Remove the star from {featuredCount - MAX_FEATURED} of them; until then the hero shows the {MAX_FEATURED} most recent.
        </p>
      )}

      {(error || actionError) && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error ?? actionError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[#515154]">Loading properties…</p>
      ) : filtered.length === 0 ? (
        <div className={`${cardClass} p-10 text-center`}>
          <p className="text-sm text-[#515154]">
            {items.length === 0
              ? 'No properties yet. Add your first listing, or start with the nine sample properties from the website.'
              : 'No properties match these filters.'}
          </p>
          {items.length === 0 && (
            <button
              onClick={importSamples}
              disabled={importing}
              className="mt-5 bg-[#1D1D1F] text-white text-xs font-medium px-6 py-3 rounded-full hover:bg-[#333336] transition-all disabled:opacity-50"
            >
              {importing ? 'Importing…' : 'Import sample properties'}
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        <PropertyGrid properties={filtered} onDelete={onDelete} onToggleFeatured={onToggleFeatured} />
      ) : (
        <PropertyTable properties={filtered} onDelete={onDelete} onToggleFeatured={onToggleFeatured} />
      )}

      {hasMore && !loading && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="text-xs font-medium px-6 py-3 rounded-full bg-white border border-[#000000]/5 hover:bg-[#F5F5F7] disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
      {hasFilters && hasMore && (
        <p className="text-center text-xs text-[#515154] mt-3">Filters apply to the listings loaded so far.</p>
      )}
    </>
  );
}
