import type { ApiFoodItem } from '@/lib/types/api';
import type { Category } from '../types/menu';

const HEADERS = [
  'id',
  'name',
  'slug',
  'categorySlug',
  'categoryName',
  'basePrice',
  'discountPrice',
  'shortDescription',
  'description',
  'foodType',
  'isAvailable',
  'isFeatured',
  'preparationTime',
  'calories',
  'protein',
  'carbs',
  'fats',
  'fiber',
  'servingSize',
  'healthTags',
  'customerLabels',
  'sortOrder',
  'imageUrl',
] as const;

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function joinList(values?: string[] | null): string {
  return (values ?? []).join(';');
}

export function buildMenuExportCsv(items: ApiFoodItem[], categories: Category[]): string {
  const catById = new Map(categories.map((c) => [c.id, c]));
  const rows = items.map((item) => {
    const cat = catById.get(item.categoryId);
    const cells: string[] = [
      item.id,
      item.name,
      item.slug,
      cat?.slug ?? '',
      cat?.name ?? '',
      String(item.basePrice ?? ''),
      item.discountPrice != null ? String(item.discountPrice) : '',
      item.shortDescription ?? '',
      item.description ?? '',
      item.foodType ?? (item.isVeg ? 'VEG' : 'NON_VEG'),
      item.isAvailable ? 'true' : 'false',
      item.isFeatured ? 'true' : 'false',
      String(item.preparationTime ?? ''),
      item.calories != null ? String(item.calories) : '',
      item.protein != null ? String(item.protein) : '',
      item.carbs != null ? String(item.carbs) : '',
      item.fats != null ? String(item.fats) : '',
      item.fiber != null ? String(item.fiber) : '',
      item.servingSize ?? '',
      joinList(item.healthTags),
      joinList(item.customerLabels),
      String(item.sortOrder ?? 0),
      item.imageUrl ?? '',
    ];
    return cells.map((c) => escapeCsv(c)).join(',');
  });
  return [HEADERS.join(','), ...rows].join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Minimal RFC4180-style row parser (handles quoted fields). */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
      row.push(cell);
      cell = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
      if (ch === '\r') i++;
    } else if (ch !== '\r') {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  return rows;
}

function parseBool(raw: string | undefined, fallback = false): boolean {
  const v = (raw ?? '').trim().toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return fallback;
}

function parseNum(raw: string | undefined): number | undefined {
  const v = (raw ?? '').trim();
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function splitList(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

export type MenuImportRow = {
  id?: string;
  name: string;
  slug?: string;
  categorySlug?: string;
  categoryName?: string;
  basePrice: number;
  discountPrice?: number;
  shortDescription?: string;
  description?: string;
  foodType?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  servingSize?: string;
  healthTags: string[];
  customerLabels: string[];
  sortOrder?: number;
  imageUrl?: string;
};

export function parseMenuImportCsv(text: string): MenuImportRow[] {
  const rows = parseCsvRows(text.trim());
  if (rows.length < 2) return [];

  const headerNorm = rows[0].map((h) => h.trim().toLowerCase().replace(/_/g, ''));
  const idx = (name: string) => headerNorm.indexOf(name.toLowerCase().replace(/_/g, ''));

  if (idx('name') === -1) throw new Error('CSV must include a name column');
  if (idx('baseprice') === -1) throw new Error('CSV must include a basePrice column');

  const col = (row: string[], name: string) => {
    const i = idx(name);
    return i >= 0 ? (row[i]?.trim() ?? '') : '';
  };

  const parsed: MenuImportRow[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const name = col(row, 'name');
    const basePrice = parseNum(col(row, 'baseprice'));
    if (!name || basePrice == null) continue;

    parsed.push({
      id: col(row, 'id') || undefined,
      name,
      slug: col(row, 'slug') || undefined,
      categorySlug: col(row, 'categoryslug') || undefined,
      categoryName: col(row, 'categoryname') || undefined,
      basePrice,
      discountPrice: parseNum(col(row, 'discountprice')),
      shortDescription: col(row, 'shortdescription') || undefined,
      description: col(row, 'description') || undefined,
      foodType: col(row, 'foodtype') || undefined,
      isAvailable: parseBool(col(row, 'isavailable'), true),
      isFeatured: parseBool(col(row, 'isfeatured'), false),
      preparationTime: parseNum(col(row, 'preparationtime')),
      calories: parseNum(col(row, 'calories')),
      protein: parseNum(col(row, 'protein')),
      carbs: parseNum(col(row, 'carbs')),
      fats: parseNum(col(row, 'fats')),
      fiber: parseNum(col(row, 'fiber')),
      servingSize: col(row, 'servingsize') || undefined,
      healthTags: splitList(col(row, 'healthtags')),
      customerLabels: splitList(col(row, 'customerlabels')),
      sortOrder: parseNum(col(row, 'sortorder')),
      imageUrl: col(row, 'imageurl') || undefined,
    });
  }
  return parsed;
}

export function resolveCategoryId(
  categories: Category[],
  slug?: string,
  name?: string,
): string | undefined {
  if (slug) {
    const bySlug = categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
    if (bySlug) return bySlug.id;
  }
  if (name) {
    const byName = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (byName) return byName.id;
  }
  return undefined;
}

export function importRowToPayload(row: MenuImportRow, categoryId: string): Record<string, unknown> {
  const foodType = (row.foodType?.toUpperCase() || 'VEG') as 'VEG' | 'NON_VEG' | 'EGG';
  return {
    name: row.name,
    categoryId,
    basePrice: row.basePrice,
    ...(row.discountPrice != null ? { discountPrice: row.discountPrice } : {}),
    shortDescription: row.shortDescription,
    description: row.description,
    foodType,
    isVeg: foodType === 'VEG',
    isAvailable: row.isAvailable,
    isFeatured: row.isFeatured,
    preparationTime: row.preparationTime ?? 20,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fats: row.fats,
    fiber: row.fiber,
    servingSize: row.servingSize,
    healthTags: row.healthTags,
    customerLabels: row.customerLabels,
    sortOrder: row.sortOrder,
    ...(row.imageUrl ? { imageUrl: row.imageUrl } : {}),
  };
}
