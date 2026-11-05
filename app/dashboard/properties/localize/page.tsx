'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProperties } from '@/src/hooks/useProperties';
import { updateProperty } from '@/src/services/dbService';
import { legacyReplacements } from '@/src/data/sampleProperties';
import { PageHeader, cardClass } from '@/src/components/dashboard/ui';

/** One-click fix: renames the imported English sample listings to the Punta del Este ones. */
export default function LocalizePage() {
  const { items, loading, error, reload } = useProperties();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const matches = items.flatMap((p) => {
    const rep = legacyReplacements.find((r) => r.legacyTitle === p.title);
    return rep ? [{ property: p, rep }] : [];
  });

  const apply = async () => {
    setRunning(true);
    setFailed(null);
    try {
      for (const { property, rep } of matches) {
        await updateProperty(property.id, {
          title: rep.title,
          description: rep.description,
          location: rep.location,
        });
      }
      setDone(matches.length);
      await reload();
    } catch (err) {
      setFailed(err instanceof Error ? err.message : 'No se pudo actualizar.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Herramientas"
        title="Convertir a Punta del Este"
        description="Reemplaza títulos, descripciones y ubicaciones de las propiedades de ejemplo en inglés. No cambia precios, fotos ni medidas."
      />

      <div className={`${cardClass} p-6 space-y-5`}>
        {loading ? (
          <p className="text-sm text-[#515154]">Cargando propiedades…</p>
        ) : error ? (
          <p role="alert" className="text-sm text-red-600">{error}</p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-[#515154]">
            {done ? `Listo: se actualizaron ${done} propiedades.` : 'No hay propiedades con los títulos antiguos.'}
          </p>
        ) : (
          <>
            <ul className="divide-y divide-[#000000]/5 text-sm">
              {matches.map(({ property, rep }) => (
                <li key={property.id} className="py-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[#515154]">
                    {property.title}, {property.location.city}
                  </span>
                  <span aria-hidden="true">→</span>
                  <span className="font-medium">
                    {rep.title}, {rep.location.city}
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={apply}
              disabled={running}
              className="bg-[#1D1D1F] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#333336] transition-all disabled:opacity-50"
            >
              {running ? 'Actualizando…' : `Actualizar ${matches.length} propiedades`}
            </button>
          </>
        )}
        {failed && <p role="alert" className="text-sm text-red-600">{failed}</p>}
        <Link href="/dashboard/properties" className="inline-block text-sm text-[#515154] hover:text-[#1D1D1F] underline underline-offset-4">
          Volver a propiedades
        </Link>
      </div>
    </div>
  );
}
