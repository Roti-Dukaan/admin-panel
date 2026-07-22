import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.prototype.options.iconUrl = icon;
L.Icon.Default.prototype.options.iconRetinaUrl = icon;
L.Icon.Default.prototype.options.shadowUrl = iconShadow;

interface DeliveryRadiusPreviewProps {
  latitude: number;
  longitude: number;
  radius: number;
  name: string;
  className?: string;
}

export function DeliveryRadiusPreview({
  latitude,
  longitude,
  radius,
  name,
  className = '',
}: DeliveryRadiusPreviewProps) {
  const [center] = useState([latitude, longitude] as [number, number]);

  const markerIcon = new L.Icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [20, 30],
    iconAnchor: [10, 30],
    popupAnchor: [0, -30],
  });

  const getEstimatedCoverage = () => {
    const area = Math.PI * Math.pow(radius, 2);
    const estimatedPeople = Math.round(area * 50);
    const estimatedOrders = Math.round(estimatedPeople * 0.3);
    return {
      area: area.toFixed(2),
      estimatedPeople,
      estimatedOrders,
    };
  };

  const coverage = getEstimatedCoverage();

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    style={{ height: '500px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Coverage Preview</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Radius: {radius} km
        </span>
      </div>

      <div className="relative mb-4" style={{ height: '300px' }}>
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          dragging={false}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Circle
            center={center}
            radius={radius * 1000}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.3, weight: 3 }}
          />

          <Marker
            position={center}
            icon={markerIcon}
            draggable={false}
            title={name}
          />
        </MapContainer>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-blue-900">
            {coverage.area}
          </div>
          <div className="text-xs text-blue-700">km² Area</div>
        </div>

        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-green-900">
            {coverage.estimatedPeople.toLocaleString()}
          </div>
          <div className="text-xs text-green-700">Est. Customers</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-purple-900">
            {coverage.estimatedOrders.toLocaleString()}
          </div>
          <div className="text-xs text-purple-700">Est. Orders/day</div>
        </div>
      </div>
    </div>
  );
}
