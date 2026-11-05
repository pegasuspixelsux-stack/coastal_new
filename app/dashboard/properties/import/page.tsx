'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Download, FileSpreadsheet, Upload } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { createProperty } from '@/src/services/dbService';
import { sampleProperties } from '@/src/data/sampleProperties';
import { IMPORT_COLUMNS, parseSheetRows, type ParsedRow } from '@/src/lib/propertyImport';
import { PageHeader, cardClass } from '@/src/components/dashboard/ui';

export default function ImportPropertiesPage() {
  const { agent } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ created: number; failed: string[] } | null>(null);

  const valid = rows.filter((r) => r.data);
  const invalid = rows.filter((r) => !r.data);

  const downloadTemplate = async () => {
    const { default: writeXlsxFile } = await import('write-excel-file/browser');
    const header = IMPORT_COLUMNS.map((c) => ({ value: c.label, fontWeight: 'bold' as const }));
    const example = IMPORT_COLUMNS.map((c) => ({ value: c.example === '' ? undefined : c.example }));
    const notes = IMPORT_COLUMNS.map((c) => ({
      value: ('hint' in c ? c.hint : '') + ('required' in c && c.required ? ' (obligatorio)' : ''),
      color: '#86868B',
    }));
    await writeXlsxFile([header, example, notes], { sheet: 'Propiedades' }).toFile('plantilla-propiedades.xlsx');
  };

  /** A filled-in example: the nine Punta del Este sample listings, ready to edit or upload as-is. */
  const downloadSample = async () => {
    const { default: writeXlsxFile } = await import('write-excel-file/browser');
    const header = IMPORT_COLUMNS.map((c) => ({ value: c.label, fontWeight: 'bold' as const }));
    const typeEs = { house: 'casa', apartment: 'apartamento', land: 'terreno', commercial: 'comercial' } as const;
    const opEs = { sale: 'venta', rent: 'alquiler', seasonal: 'temporada' } as const;
    const body = sampleProperties.map((p, i) => {
      const values: Record<string, string | number | undefined> = {
        titulo: p.title,
        descripcion: p.description,
        tipo: typeEs[p.type],
        operacion: opEs[p.operation],
        precio: p.price,
        moneda: p.currency,
        ciudad: p.location.city,
        barrio: p.location.neighborhood,
        direccion: p.location.address,
        departamento: p.location.state,
        pais: p.location.country,
        dormitorios: p.specs.bedrooms,
        banos: p.specs.bathrooms,
        area_m2: p.specs.areaM2,
        terreno_m2: p.specs.lotM2,
        garajes: p.specs.parkingSpaces,
        anio: p.specs.yearBuilt,
        estado: 'activa',
        destacada: i < 5 ? 'si' : 'no',
        fotos: p.photos.map((ph) => ph.url).join(' '),
      };
      return IMPORT_COLUMNS.map((c) => ({ value: values[c.key] }));
    });
    await writeXlsxFile([header, ...body], { sheet: 'Propiedades' }).toFile('ejemplo-propiedades.xlsx');
  };

  const onFile = async (file: File | undefined) => {
    setResult(null);
    setRows([]);
    setFileError(null);
    if (!file) return;
    setFileName(file.name);
    try {
      const { readSheet } = await import('read-excel-file/browser');
      const sheet = await readSheet(file);
      // Drop the grey "notes" row of the template if it was left in.
      const cleaned = sheet.filter((r, i) => i !== 2 || !String(r[0] ?? '').includes('obligatorio'));
      const parsed = parseSheetRows(cleaned as unknown[][]);
      if (parsed.missingColumns.length) {
        setFileError(`Faltan columnas obligatorias: ${parsed.missingColumns.join(', ')}. Descargue la plantilla para ver el formato.`);
        return;
      }
      if (!parsed.rows.length) {
        setFileError('The file has no listings.');
        return;
      }
      setRows(parsed.rows);
    } catch {
      setFileError('Could not read the file. Upload an .xlsx file (Excel), not .xls or .csv.');
    }
  };

  const runImport = async () => {
    if (!agent) return;
    setImporting(true);
    setProgress(0);
    const failed: string[] = [];
    let created = 0;
    for (const r of valid) {
      try {
        await createProperty({
          ...r.data!,
          agentId: agent.id,
          agentName: agent.name,
          agentPhone: agent.phone,
        });
        created += 1;
      } catch {
        failed.push(`Row ${r.row}: ${r.title}`);
      }
      setProgress((p) => p + 1);
    }
    setResult({ created, failed });
    setRows([]);
    setFileName('');
    if (fileInput.current) fileInput.current.value = '';
    setImporting(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Import from Excel"
        description="Upload an .xlsx file with one listing per row. Every listing is checked before anything is created."
        action={
          <Link href="/dashboard/properties" className="text-sm text-[#515154] hover:text-[#1D1D1F] underline underline-offset-4">
            Back to properties
          </Link>
        }
      />

      <div className="space-y-6 max-w-3xl">
        <div className={`${cardClass} p-6 space-y-4`}>
          <h2 className="text-sm font-semibold">1. Download the template</h2>
          <p className="text-sm text-[#515154] font-light">
            It has the columns the importer understands, one example row and a hint under each column. Replace the example with your
            listings. Photos are links (URLs) separated by a space or comma.
          </p>
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 bg-white border border-[#1D1D1F] text-[#1D1D1F] text-xs font-medium px-5 py-3 rounded-full hover:bg-[#1D1D1F] hover:text-white transition-all"
          >
            <Download className="w-4 h-4" /> Download template (.xlsx)
          </button>
          <button
            type="button"
            onClick={downloadSample}
            className="ml-3 inline-flex items-center gap-2 text-xs font-medium text-[#1D1D1F] underline underline-offset-4 hover:text-[#515154]"
          >
            <FileSpreadsheet className="w-4 h-4" /> Download sample file with 9 listings
          </button>
        </div>

        <div className={`${cardClass} p-6 space-y-4`}>
          <h2 className="text-sm font-semibold">2. Upload your file</h2>
          <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#000000]/20 rounded-xl py-10 cursor-pointer hover:bg-[#F5F5F7] transition-colors text-sm text-[#515154]">
            {fileName ? <FileSpreadsheet className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
            <span>{fileName || 'Choose an .xlsx file'}</span>
            <input
              ref={fileInput}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          {fileError && <p role="alert" className="text-sm text-red-600">{fileError}</p>}
        </div>

        {rows.length > 0 && (
          <div className={`${cardClass} p-6 space-y-5`}>
            <h2 className="text-sm font-semibold">3. Review and import</h2>
            <p className="text-sm text-[#515154]">
              <strong className="text-[#1D1D1F]">{valid.length}</strong> ready to import
              {invalid.length > 0 && (
                <>
                  , <strong className="text-red-600">{invalid.length}</strong> with errors (these are skipped)
                </>
              )}
              .
            </p>

            {invalid.length > 0 && (
              <ul className="text-sm space-y-2 bg-red-50 rounded-xl p-4">
                {invalid.map((r) => (
                  <li key={r.row}>
                    <span className="font-medium">Row {r.row} · {r.title}:</span>{' '}
                    <span className="text-red-700">{r.errors.join('; ')}</span>
                  </li>
                ))}
              </ul>
            )}

            {valid.length > 0 && (
              <ul className="text-sm divide-y divide-[#000000]/5 max-h-72 overflow-y-auto">
                {valid.map((r) => (
                  <li key={r.row} className="py-2 flex justify-between gap-4">
                    <span className="truncate">{r.data!.title}</span>
                    <span className="text-[#515154] shrink-0">
                      {r.data!.location.city} · {r.data!.currency} {r.data!.price.toLocaleString('es-UY')}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={runImport}
              disabled={importing || valid.length === 0}
              className="bg-[#1D1D1F] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#333336] transition-all disabled:opacity-50"
            >
              {importing ? `Importing ${progress} of ${valid.length}…` : `Import ${valid.length} properties`}
            </button>
          </div>
        )}

        {result && (
          <div className={`${cardClass} p-6 space-y-3`} role="status">
            <p className="text-sm text-green-700">
              Done: {result.created} {result.created === 1 ? 'property' : 'properties'} created.
            </p>
            {result.failed.length > 0 && (
              <div className="text-sm text-red-600">
                <p>These could not be saved (check your Firestore rules or permissions):</p>
                <ul className="list-disc pl-5">
                  {result.failed.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            <Link href="/dashboard/properties" className="inline-block text-sm underline underline-offset-4">
              View properties
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
