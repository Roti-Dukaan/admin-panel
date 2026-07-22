import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.prototype.options.iconUrl = icon;
L.Icon.Default.prototype.options.iconRetinaUrl = icon;
L.Icon.Default.prototype.options.shadowUrl = iconShadow;

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  radius?: number;
  onRadiusChange?: (radius: number) => void;
  minRadius?: number;
  maxRadius?: number;
  mapHeight?: string;
  className?: string;
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
  radius,
  onRadiusChange,
  minRadius = 1,
  maxRadius = 50,
  mapHeight = '400px',
  className = '',
}: LocationPickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [circleCenter, setCircleCenter] = useState({ lat: latitude, lng: longitude });

  useEffect(() => {
    setCircleCenter({ lat: latitude, lng: longitude });
  }, [latitude, longitude]);

  const handleMarkerDragEnd = (e: any) => {
    const newPos = e.target.getLatLng();
    setIsDragging(true);
    onChange(newPos.lat, newPos.lng);
    setCircleCenter({ lat: newPos.lat, lng: newPos.lng });
  };

  const handleMapClick = (e: any) => {
    const newPos = e.latlng;
    if (!isDragging) {
      onChange(newPos.lat, newPos.lng);
      setCircleCenter({ lat: newPos.lat, lng: newPos.lng });
    }
  };

  const handleRadiusChange = (e: any) => {
    const newRadius = parseFloat(e.target.value);
    if (onRadiusChange) {
      onRadiusChange(newRadius);
    }
  };

  const markerIcon = new L.Icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });

  return (
    <div className={`relative ${className}`}
    style={{ height: mapHeight }}
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        onClick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Circle
          center={[circleCenter.lat, circleCenter.lng]}
          radius={radius ? radius * 1000 : 1000}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 2 }}
        />

        <Marker
          position={[latitude, longitude]}
          icon={markerIcon}
          draggable={true}
          eventHandlers={{
            dragend: handleMarkerDragEnd,
          }}
        />
      </MapContainer>

      {onRadiusChange && (
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
            onChange={handleRadiusChange}
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
      )}

      <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow-md border border-gray-200">
        <div className="text-sm font-medium text-gray-900">
          Lat: {latitude.toFixed(6)}
        </div>
        <div className="text-sm font-medium text-gray-900">
          Lng: {longitude.toFixed(6)}
        </div>
      </div>
    </div>
  );
}
