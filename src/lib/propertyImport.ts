import type {
  Currency,
  PropertyInput,
  PropertyOperation,
  PropertyStatus,
  PropertyType,
} from '../types/firestore';

/** Columns of the Excel template, in order. `key` is what the importer matches on. */
export const IMPORT_COLUMNS = [
  { key: 'titulo', label: 'Título', example: 'Villa Horizonte', required: true },
  { key: 'descripcion', label: 'Descripción', example: 'Privacidad absoluta frente a un horizonte infinito.' },
  { key: 'tipo', label: 'Tipo', example: 'casa', hint: 'casa, apartamento, terreno o comercial', required: true },
  { key: 'operacion', label: 'Operación', example: 'venta', hint: 'venta, alquiler o temporada', required: true },
  { key: 'precio', label: 'Precio', example: 14500000, required: true },
  { key: 'moneda', label: 'Moneda', example: 'USD', hint: 'USD o UYU (por defecto USD)' },
  { key: 'ciudad', label: 'Ciudad', example: 'José Ignacio', required: true },
  { key: 'barrio', label: 'Barrio', example: '' },
  { key: 'direccion', label: 'Dirección', example: '' },
  { key: 'departamento', label: 'Departamento', example: 'Maldonado' },
  { key: 'pais', label: 'País', example: 'Uruguay', hint: 'por defecto Uruguay' },
  { key: 'dormitorios', label: 'Dormitorios', example: 5, required: true },
  { key: 'banos', label: 'Baños', example: 6, required: true },
  { key: 'area_m2', label: 'Superficie m²', example: 575, required: true },
  { key: 'terreno_m2', label: 'Terreno m²', example: 2000 },
  { key: 'garajes', label: 'Garajes', example: 2 },
  { key: 'anio', label: 'Año de construcción', example: 2020 },
  { key: 'estado', label: 'Estado', example: 'activa', hint: 'activa, reservada o vendida (por defecto activa)' },
  { key: 'destacada', label: 'Destacada', example: 'no', hint: 'si o no: aparece en el hero de la portada' },
  { key: 'fotos', label: 'Fotos (URLs)', example: 'https://ejemplo.com/foto1.jpg https://ejemplo.com/foto2.jpg', hint: 'separadas por espacio, coma o salto de línea' },
] as const;

type Key = (typeof IMPORT_COLUMNS)[number]['key'];

const norm = (v: unknown) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();

/** Maps any header text (with or without accents/spaces) to a column key, or null. */
const HEADER_ALIASES: Record<string, Key> = Object.fromEntries(
  IMPORT_COLUMNS.flatMap((c) => [
    [norm(c.key), c.key],
    [norm(c.label), c.key],
  ])
) as Record<string, Key>;
HEADER_ALIASES['superficie'] = 'area_m2';
HEADER_ALIASES['area'] = 'area_m2';
HEADER_ALIASES['banos'] = 'banos';
HEADER_ALIASES['fotos'] = 'fotos';
HEADER_ALIASES['ano'] = 'anio';

const TYPES: Record<string, PropertyType> = {
  casa: 'house', house: 'house',
  apartamento: 'apartment', apto: 'apartment', apartment: 'apartment',
  terreno: 'land', land: 'land',
  comercial: 'commercial', commercial: 'commercial',
};
const OPERATIONS: Record<string, PropertyOperation> = {
  venta: 'sale', sale: 'sale',
  alquiler: 'rent', rent: 'rent',
  temporada: 'seasonal', 'alquiler temporal': 'seasonal', seasonal: 'seasonal',
};
const STATUSES: Record<string, PropertyStatus> = {
  activa: 'active', activo: 'active', active: 'active',
  reservada: 'reserved', reservado: 'reserved', reserved: 'reserved',
  vendida: 'sold', vendido: 'sold', sold: 'sold',
};

export type ParsedRow = {
  /** Spreadsheet row number (the header is row 1). */
  row: number;
  title: string;
  data?: Omit<PropertyInput, 'agentId' | 'agentName' | 'agentPhone'>;
  errors: string[];
};

/** Parses numbers typed the Uruguayan way ("14.500.000" or "14,5") as well as plain numbers. */
function toNumber(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v ?? '').replace(/[^\d.,-]/g, '');
  if (!s) return null;
  // "14.500.000" / "1.200,50" -> dots are thousands separators when a comma or several dots follow.
  const normalized =
    /\d\.\d{3}(\.|,|$)/.test(s) ? s.replace(/\./g, '').replace(',', '.') : s.replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

const text = (v: unknown) => String(v ?? '').trim();

/** Turns the sheet (array of rows, first row = headers) into validated listings. */
export function parseSheetRows(sheet: unknown[][]): { rows: ParsedRow[]; missingColumns: string[] } {
  const [header = [], ...body] = sheet;
  const columnIndex = new Map<Key, number>();
  header.forEach((h, i) => {
    const key = HEADER_ALIASES[norm(h)];
    if (key && !columnIndex.has(key)) columnIndex.set(key, i);
  });

  const missingColumns = IMPORT_COLUMNS.filter((c) => 'required' in c && c.required && !columnIndex.has(c.key)).map(
    (c) => c.label
  );
  if (missingColumns.length) return { rows: [], missingColumns };

  const rows: ParsedRow[] = [];
  body.forEach((cells, i) => {
    if (!cells || cells.every((c) => text(c) === '')) return; // skip blank lines
    const get = (key: Key) => cells[columnIndex.get(key) ?? -1];
    const errors: string[] = [];
    const title = text(get('titulo'));
    if (!title) errors.push('Falta el título');
    if (title.length > 200) errors.push('El título supera los 200 caracteres');

    const type = TYPES[norm(get('tipo'))];
    if (!type) errors.push('Tipo no válido (casa, apartamento, terreno o comercial)');
    const operation = OPERATIONS[norm(get('operacion'))];
    if (!operation) errors.push('Operación no válida (venta, alquiler o temporada)');

    const price = toNumber(get('precio'));
    if (price === null || price < 0) errors.push('Precio no válido');

    const currencyRaw = text(get('moneda')).toUpperCase() || 'USD';
    if (currencyRaw !== 'USD' && currencyRaw !== 'UYU') errors.push('Moneda no válida (USD o UYU)');

    const city = text(get('ciudad'));
    if (!city) errors.push('Falta la ciudad');

    const bedrooms = toNumber(get('dormitorios'));
    const bathrooms = toNumber(get('banos'));
    const areaM2 = toNumber(get('area_m2'));
    if (bedrooms === null || bedrooms < 0) errors.push('Dormitorios no válidos');
    if (bathrooms === null || bathrooms < 0) errors.push('Baños no válidos');
    if (areaM2 === null || areaM2 <= 0) errors.push('Superficie no válida');

    const statusRaw = norm(get('estado'));
    const status = statusRaw ? STATUSES[statusRaw] : 'active';
    if (!status) errors.push('Estado no válido (activa, reservada o vendida)');

    const description = text(get('descripcion'));
    if (description.length > 10000) errors.push('La descripción supera los 10.000 caracteres');

    const photos = text(get('fotos'))
      .split(/[\s,;]+/)
      .filter(Boolean);
    const badPhoto = photos.find((u) => !/^https?:\/\//i.test(u));
    if (badPhoto) errors.push(`Foto no válida: ${badPhoto}`);
    if (photos.length > 40) errors.push('Máximo 40 fotos');

    const lot = toNumber(get('terreno_m2'));
    const parking = toNumber(get('garajes'));
    const year = toNumber(get('anio'));
    const featuredRaw = norm(get('destacada'));

    if (errors.length) {
      rows.push({ row: i + 2, title: title || '(sin título)', errors });
      return;
    }

    rows.push({
      row: i + 2,
      title,
      errors,
      data: {
        title,
        description,
        type,
        operation,
        price: price as number,
        currency: currencyRaw as Currency,
        location: {
          city,
          neighborhood: text(get('barrio')) || undefined,
          address: text(get('direccion')) || undefined,
          state: text(get('departamento')) || undefined,
          country: text(get('pais')) || 'Uruguay',
        },
        specs: {
          bedrooms: bedrooms as number,
          bathrooms: bathrooms as number,
          areaM2: areaM2 as number,
          lotM2: lot ?? undefined,
          parkingSpaces: parking ?? undefined,
          yearBuilt: year ?? undefined,
        },
        photos: photos.map((url) => ({ url })),
        status,
        featured: ['si', 'sí', 'yes', 'true', '1', 'x'].includes(featuredRaw),
      },
    });
  });

  return { rows, missingColumns: [] };
}
