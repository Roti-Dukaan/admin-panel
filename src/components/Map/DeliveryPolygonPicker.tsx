'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGoogleMapsScript } from '@/features/kitchen-location/hooks/useGoogleMapsScript';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, PenTool, Check, MapPin } from 'lucide-react';
import { DEFAULT_MAP_CENTER, distanceKm, formatDistance, toMapCoords } from '@/lib/geo-utils';
import { locationService } from '@/services/location.service';
import { toast } from 'sonner';

export interface LatLngPoint {
  lat: number;
  lng: number;
}

interface DeliveryPolygonPickerProps {
  latitude: number;
  longitude: number;
  value: LatLngPoint[];
  onChange: (polygon: LatLngPoint[]) => void;
  disabled?: boolean;
  mapHeight?: string;
  className?: string;
}

const POLYGON_STYLE = {
  strokeColor: '#f97316',
  strokeOpacity: 0.9,
  strokeWeight: 2,
  fillColor: '#f97316',
  fillOpacity: 0.2,
};

function pathToPoints(path: google.maps.MVCArray<google.maps.LatLng>): LatLngPoint[] {
  const points: LatLngPoint[] = [];
  for (let i = 0; i < path.getLength(); i++) {
    const ll = path.getAt(i);
    points.push({ lat: ll.lat(), lng: ll.lng() });
  }
  return points;
}

interface DraftPointInfo {
  point: LatLngPoint;
  distanceKm: number;
}

function samePoints(a: LatLngPoint[], b: LatLngPoint[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (point, index) =>
        Math.abs(point.lat - b[index].lat) < 0.000001 &&
        Math.abs(point.lng - b[index].lng) < 0.000001,
    )
  );
}

export function DeliveryPolygonPicker({
  latitude,
  longitude,
  value,
  onChange,
  disabled = false,
  mapHeight = '320px',
  className = '',
}: DeliveryPolygonPickerProps) {
  const { isLoaded, error } = useGoogleMapsScript();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const kitchenMarkerRef = useRef<google.maps.Marker | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const draftMarkersRef = useRef<google.maps.Marker[]>([]);
  const draftPolylineRef = useRef<google.maps.Polyline | null>(null);
  const draftPointsRef = useRef<LatLngPoint[]>([]);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const onChangeRef = useRef(onChange);

  const [isDrawing, setIsDrawing] = useState(false);
  const [draftPointCount, setDraftPointCount] = useState(0);
  const [draftPointsInfo, setDraftPointsInfo] = useState<DraftPointInfo[]>([]);
  const [vertexDistances, setVertexDistances] = useState<DraftPointInfo[]>([]);
  const [isAddingAtLocation, setIsAddingAtLocation] = useState(false);
  const [pointCount, setPointCount] = useState(value.length);

  const center = useMemo(
    () => toMapCoords(latitude, longitude, DEFAULT_MAP_CENTER),
    [latitude, longitude],
  );

  const kitchenRef = useRef(center);
  kitchenRef.current = center;

  onChangeRef.current = onChange;

  const buildVertexDistances = useCallback((points: LatLngPoint[]): DraftPointInfo[] => {
    const kitchen = kitchenRef.current;
    return points.map((point) => ({
      point,
      distanceKm: distanceKm(kitchen, point),
    }));
  }, []);

  const clearDraftOverlays = useCallback(() => {
    draftMarkersRef.current.forEach((marker) => marker.setMap(null));
    draftMarkersRef.current = [];
    draftPolylineRef.current?.setMap(null);
    draftPolylineRef.current = null;
    draftPointsRef.current = [];
    setDraftPointCount(0);
    setDraftPointsInfo([]);
  }, []);

  const detachMapClickListener = useCallback(() => {
    if (clickListenerRef.current) {
      google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }
  }, []);

  const syncPolygonPath = useCallback((polygon: google.maps.Polygon) => {
    const points = pathToPoints(polygon.getPath());
    setPointCount(points.length);
    setVertexDistances(buildVertexDistances(points));
    onChangeRef.current(points);
  }, [buildVertexDistances]);

  const removePolygon = useCallback(() => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    setPointCount(0);
    setVertexDistances([]);
    onChangeRef.current([]);
  }, []);

  const attachEditablePolygon = useCallback(
    (polygon: google.maps.Polygon) => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }

      polygon.setOptions({
        ...POLYGON_STYLE,
        editable: !disabled,
        draggable: false,
      });

      polygonRef.current = polygon;
      syncPolygonPath(polygon);

      const path = polygon.getPath();
      ['insert_at', 'remove_at', 'set_at'].forEach((eventName) => {
        google.maps.event.addListener(path, eventName, () => syncPolygonPath(polygon));
      });
    },
    [disabled, syncPolygonPath],
  );

  const renderPolygonFromValue = useCallback(
    (map: google.maps.Map, points: LatLngPoint[]) => {
      if (points.length < 3) {
        removePolygon();
        return;
      }

      const polygon = new google.maps.Polygon({
        paths: points,
        map,
      });
      attachEditablePolygon(polygon);
    },
    [attachEditablePolygon, removePolygon],
  );

  const updateDraftPolyline = useCallback((map: google.maps.Map, points: LatLngPoint[]) => {
    draftPolylineRef.current?.setMap(null);
    if (points.length < 2) {
      draftPolylineRef.current = null;
      return;
    }

    draftPolylineRef.current = new google.maps.Polyline({
      path: points,
      map,
      strokeColor: POLYGON_STYLE.strokeColor,
      strokeOpacity: POLYGON_STYLE.strokeOpacity,
      strokeWeight: POLYGON_STYLE.strokeWeight,
    });
  }, []);

  const addDraftPoint = useCallback(
    (map: google.maps.Map, point: LatLngPoint) => {
      const kitchen = { lat: latitude, lng: longitude };
      const dist = distanceKm(kitchen, point);
      const nextPoints = [...draftPointsRef.current, point];
      draftPointsRef.current = nextPoints;

      const marker = new google.maps.Marker({
        map,
        position: point,
        clickable: false,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: POLYGON_STYLE.fillColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      draftMarkersRef.current.push(marker);
      updateDraftPolyline(map, nextPoints);
      setDraftPointCount(nextPoints.length);
      setDraftPointsInfo((prev) => [...prev, { point, distanceKm: dist }]);
    },
    [latitude, longitude, updateDraftPolyline],
  );

  const addCornerAtCurrentLocation = useCallback(async () => {
    const map = mapInstanceRef.current;
    if (!map || disabled || !isDrawing) return;

    setIsAddingAtLocation(true);
    try {
      const position = await locationService.getCurrentPosition();
      const point = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      const dist = distanceKm({ lat: latitude, lng: longitude }, point);
      addDraftPoint(map, point);
      map.panTo(point);
      toast.success(`Corner added — ${formatDistance(dist)} from kitchen`);
    } catch (err: unknown) {
      const geoErr = err as GeolocationPositionError;
      if (geoErr.code === 1) {
        toast.error(
          'Location permission denied. Allow location access in your browser settings.',
        );
      } else if (geoErr.code === 2) {
        toast.error('Unable to detect your location. Please ensure GPS is enabled.');
      } else if (geoErr.code === 3) {
        toast.error('Location request timed out. Please try again.');
      } else {
        toast.error('Failed to get current location');
      }
    } finally {
      setIsAddingAtLocation(false);
    }
  }, [addDraftPoint, disabled, isDrawing, latitude, longitude]);

  const cancelDrawing = useCallback(() => {
    detachMapClickListener();
    clearDraftOverlays();
    setIsDrawing(false);
  }, [clearDraftOverlays, detachMapClickListener]);

  const completeDrawing = useCallback(() => {
    const map = mapInstanceRef.current;
    const points = draftPointsRef.current;
    if (!map || points.length < 3) return;

    detachMapClickListener();
    clearDraftOverlays();
    setIsDrawing(false);
    renderPolygonFromValue(map, points);
  }, [clearDraftOverlays, detachMapClickListener, renderPolygonFromValue]);

  const startDrawing = useCallback(() => {
    const map = mapInstanceRef.current;
    if (disabled || !map) return;

    removePolygon();
    clearDraftOverlays();
    detachMapClickListener();
    setIsDrawing(true);

    clickListenerRef.current = map.addListener('click', (event: google.maps.MapMouseEvent) => {
      const latLng = event.latLng;
      if (!latLng) return;
      addDraftPoint(map, { lat: latLng.lat(), lng: latLng.lng() });
    });
  }, [addDraftPoint, clearDraftOverlays, detachMapClickListener, disabled, removePolygon]);

  const clearPolygon = useCallback(() => {
    cancelDrawing();
    removePolygon();
  }, [cancelDrawing, removePolygon]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      clickableIcons: false,
    });

    kitchenMarkerRef.current = new google.maps.Marker({
      map,
      position: center,
      title: 'Kitchen location',
    });

    mapInstanceRef.current = map;

    if (value.length >= 3) {
      renderPolygonFromValue(map, value);
    }
  }, [center, isLoaded, renderPolygonFromValue, value]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setCenter(center);
    kitchenMarkerRef.current?.setPosition(center);

    if (isDrawing) return;

    if (value.length >= 3) {
      const currentPath = polygonRef.current?.getPath();
      const currentPoints = currentPath ? pathToPoints(currentPath) : [];
      if (!samePoints(currentPoints, value)) {
        renderPolygonFromValue(map, value);
      }
    } else if (polygonRef.current) {
      removePolygon();
    }
  }, [center, isDrawing, removePolygon, renderPolygonFromValue, value]);

  useEffect(() => {
    const polygon = polygonRef.current;
    if (!polygon || isDrawing) return;

    const points = pathToPoints(polygon.getPath());
    if (points.length >= 3) {
      setVertexDistances(buildVertexDistances(points));
    }
  }, [buildVertexDistances, isDrawing, latitude, longitude]);

  useEffect(() => {
    return () => {
      detachMapClickListener();
      clearDraftOverlays();
    };
  }, [clearDraftOverlays, detachMapClickListener]);

  const activeDistances = isDrawing ? draftPointsInfo : vertexDistances;

  if (error) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        Map unavailable: {error}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
        style={{ height: mapHeight }}
      >
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading map...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative overflow-hidden rounded-lg border border-gray-200" style={{ height: mapHeight }}>
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {activeDistances.length > 0 && (
        <div className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-2">
          <p className="text-xs font-medium text-orange-800 mb-1.5">
            Corner distances from kitchen ({activeDistances.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeDistances.map((info, index) => (
              <span
                key={`${info.point.lat}-${info.point.lng}-${index}`}
                className="rounded-full border border-orange-200 bg-white px-2 py-0.5 text-xs font-medium text-orange-700"
              >
                C{index + 1}: {formatDistance(info.distanceKm)}
              </span>
            ))}
          </div>
        </div>
      )}

      {!disabled && (
        <div className="flex flex-wrap items-center gap-2">
          {!isDrawing ? (
            <Button type="button" variant="outline" size="sm" onClick={startDrawing}>
              <PenTool className="mr-1.5 h-3.5 w-3.5" />
              Draw Polygon
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCornerAtCurrentLocation}
                disabled={isAddingAtLocation}
              >
                {isAddingAtLocation ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MapPin className="mr-1.5 h-3.5 w-3.5" />
                )}
                Add at my location
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={completeDrawing}
                disabled={draftPointCount < 3}
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Complete
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={cancelDrawing}>
                Cancel
              </Button>
            </>
          )}
          <Button type="button" variant="outline" size="sm" onClick={clearPolygon} disabled={pointCount === 0 && !isDrawing}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Clear
          </Button>
          <span className="text-xs text-gray-500">
            {isDrawing
              ? draftPointCount < 3
                ? 'Click the map or use “Add at my location”, then Complete'
                : `${draftPointCount} corners ready — click Complete to close the polygon`
              : pointCount >= 3
                ? `${pointCount} points — drag vertices to edit`
                : 'Draw a delivery zone with at least 3 corners'}
          </span>
        </div>
      )}
    </div>
  );
}
