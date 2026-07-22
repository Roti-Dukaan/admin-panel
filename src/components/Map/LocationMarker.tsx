import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.prototype.options.iconUrl = icon;
L.Icon.Default.prototype.options.iconRetinaUrl = icon;
L.Icon.Default.prototype.options.shadowUrl = iconShadow;

interface LocationMarkerProps {
  latitude: number;
  longitude: number;
  onPositionChange?: (lat: number, lng: number) => void;
  radius?: number;
  name: string;
  className?: string;
}

export function LocationMarker({
  latitude,
  longitude,
  onPositionChange,
  radius,
  name,
  className = '',
}: LocationMarkerProps) {
  const [position, setPosition] = useState([latitude, longitude] as [number, number]);

  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  const markerIcon = new L.Icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [0, -45],
  });

  const handleDragEnd = (e: any) => {
    const newPos = e.target.getLatLng();
    setPosition([newPos.lat, newPos.lng]);
    onPositionChange?.(newPos.lat, newPos.lng);
  };

  return (
    <div className={className}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        dragging={false}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {radius && (
          <Circle
            center={position}
            radius={radius * 1000}
            pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2, weight: 2 }}
          />
        )}

        <Marker
          position={position}
          icon={markerIcon}
          draggable={false}
          title={name}
        />
      </MapContainer>
    </div>
  );
}
