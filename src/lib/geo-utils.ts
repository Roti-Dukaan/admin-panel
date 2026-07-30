import type { LatLngPoint } from '@/lib/api/master-data/branches.api';

export const DEFAULT_MAP_CENTER = { lat: 17.385, lng: 78.4867 } as const;

export function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

export function toMapCoords(
  lat: unknown,
  lng: unknown,
  fallback = DEFAULT_MAP_CENTER,
): { lat: number; lng: number } {
  const parsedLat = parseCoordinate(lat);
  const parsedLng = parseCoordinate(lng);

  if (parsedLat != null && parsedLng != null) {
    return { lat: parsedLat, lng: parsedLng };
  }

  return { lat: fallback.lat, lng: fallback.lng };
}

export function hasValidMapCoords(lat: unknown, lng: unknown): boolean {
  return parseCoordinate(lat) != null && parseCoordinate(lng) != null;
}

export function parseDeliveryPolygon(value: unknown): LatLngPoint[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((point) => {
      if (!point || typeof point !== 'object') {
        return null;
      }
      const lat = parseCoordinate((point as LatLngPoint).lat);
      const lng = parseCoordinate((point as LatLngPoint).lng);
      if (lat == null || lng == null) {
        return null;
      }
      return { lat, lng };
    })
    .filter((point): point is LatLngPoint => point !== null);
}
