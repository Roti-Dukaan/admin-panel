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

function orient(a: LatLngPoint, b: LatLngPoint, c: LatLngPoint): number {
  return (b.lng - a.lng) * (c.lat - a.lat) - (b.lat - a.lat) * (c.lng - a.lng);
}

function onSegment(a: LatLngPoint, b: LatLngPoint, c: LatLngPoint): boolean {
  return (
    Math.min(a.lng, c.lng) <= b.lng &&
    b.lng <= Math.max(a.lng, c.lng) &&
    Math.min(a.lat, c.lat) <= b.lat &&
    b.lat <= Math.max(a.lat, c.lat)
  );
}

function segmentsIntersect(
  p1: LatLngPoint,
  q1: LatLngPoint,
  p2: LatLngPoint,
  q2: LatLngPoint,
): boolean {
  const o1 = orient(p1, q1, p2);
  const o2 = orient(p1, q1, q2);
  const o3 = orient(p2, q2, p1);
  const o4 = orient(p2, q2, q1);

  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;

  return (o1 > 0) !== (o2 > 0) && (o3 > 0) !== (o4 > 0);
}

function isPointInPolygon(point: LatLngPoint, polygon: LatLngPoint[]): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    const intersects =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function doPolygonsOverlap(a: LatLngPoint[], b: LatLngPoint[]): boolean {
  if (a.length < 3 || b.length < 3) return false;

  for (const point of a) {
    if (isPointInPolygon(point, b)) return true;
  }
  for (const point of b) {
    if (isPointInPolygon(point, a)) return true;
  }
  for (let i = 0; i < a.length; i += 1) {
    const a1 = a[i];
    const a2 = a[(i + 1) % a.length];
    for (let j = 0; j < b.length; j += 1) {
      const b1 = b[j];
      const b2 = b[(j + 1) % b.length];
      if (segmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

export function findOverlappingBranch(
  polygon: LatLngPoint[],
  branches: Array<{ id: string; name: string; code: string; deliveryPolygon?: LatLngPoint[] | null }>,
  excludeBranchId?: string,
): { id: string; name: string; code: string } | null {
  for (const branch of branches) {
    if (excludeBranchId && branch.id === excludeBranchId) continue;
    const existing = parseDeliveryPolygon(branch.deliveryPolygon);
    if (existing.length >= 3 && doPolygonsOverlap(polygon, existing)) {
      return { id: branch.id, name: branch.name, code: branch.code };
    }
  }
  return null;
}
