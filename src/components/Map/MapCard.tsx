import { MapCard, DeliveryRadiusPreview } from '@/components/Map';
import { UseKitchenLocationFormReturn } from './hooks/useKitchenLocationForm';

interface MapCardProps {
  latitude: number;
  longitude: number;
  radius?: number;
  name: string;
  onPositionChange?: (lat: number, lng: number) => void;
  onRadiusChange?: (radius: number) => void;
  minRadius?: number;
  maxRadius?: number;
  mapHeight?: string;
}

interface MapCardDisplayProps {
  latitude: number;
  longitude: number;
  radius?: number;
  name: string;
  className?: string;
}

export function MapCard({
  latitude,
  longitude,
  radius,
  name,
  onPositionChange,
  onRadiusChange,
  minRadius = 1,
  maxRadius = 50,
  mapHeight = '400px',
}: MapCardProps) {
  return (
    <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg p-3 shadow-md border border-gray-200">
        <div className="text-sm font-medium text-gray-900">
          Lat: {latitude.toFixed(6)}
        </div>
        <div className="text-sm font-medium text-gray-900">
          Lng: {longitude.toFixed(6)}
        </div>
        {radius && (
          <div className="text-sm font-medium text-gray-900">
            Radius: {radius} km
          </div>
        )}
      </div>

      <div style={{ height: mapHeight }} className="relative">
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&format=html`}
          style={{ border: 0, height: '100%', width: '100%' }}
          title={`${name} - Map View`}
          allowFullScreen
        />
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg p-4 shadow-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Radius: {radius} km
          </label>
          <input
            type="range"
            min={minRadius}
            max={maxRadius}
            step={0.5}
            value={radius || minRadius}
            onChange={(e) => onRadiusChange?.(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${( ((radius || minRadius) - minRadius) / (maxRadius - minRadius) * 100).toFixed(2) }%, #e5e7eb ${((radius || minRadius) - minRadius) / (maxRadius - minRadius) * 100}% 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DeliveryRadiusPreview };
