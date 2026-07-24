'use client';

import { useEffect, useRef, useState } from 'react';
import { useGoogleMapsScript } from '@/features/kitchen-location/hooks/useGoogleMapsScript';
import { Loader2, MapPin } from 'lucide-react';

export interface PlaceResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId: string;
  city: string;
  area: string;
}

interface BranchAddressSearchProps {
  onPlaceSelected: (place: PlaceResult) => void;
  defaultValue?: string;
  placeholder?: string;
}

export function BranchAddressSearch({
  onPlaceSelected,
  defaultValue = '',
  placeholder = 'Search by address, landmark, business name, road, area, or place...',
}: BranchAddressSearchProps) {
  const { isLoaded, error } = useGoogleMapsScript();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;
    if (!google.maps?.places) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
      componentRestrictions: { country: 'in' },
      fields: [
        'place_id',
        'formatted_address',
        'geometry',
        'address_components',
        'name',
      ],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place?.geometry?.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const components = place.address_components || [];

      let city = '';
      let area = '';
      let pincode = '';

      for (const comp of components) {
        const types = comp.types;
        if (types.includes('locality')) {
          city = comp.long_name;
        } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
          area = comp.long_name;
        } else if (!city && types.includes('administrative_area_level_2')) {
          city = comp.long_name;
        } else if (!area && types.includes('neighborhood')) {
          area = comp.long_name;
        }
      }

      onPlaceSelected({
        latitude: lat,
        longitude: lng,
        formattedAddress: '',
        placeId: '',
        city,
        area,
      });
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onPlaceSelected]);

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <MapPin className="h-4 w-4 shrink-0" />
        <span>Address search unavailable: {error}</span>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        <span>Loading address search...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      />
    </div>
  );
}
