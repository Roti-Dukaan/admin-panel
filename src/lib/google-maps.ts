export function getGoogleMapsApiKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  );
}

function parseGeocoderComponents(
  components: google.maps.GeocoderAddressComponent[] = []
): { city: string; area: string } {
  let city = '';
  let area = '';

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
    } else if (!area && types.includes('sublocality_level_2')) {
      area = comp.long_name;
    }
  }

  return { city, area };
}

export function reverseGeocode(
  lat: number,
  lng: number
): Promise<{
  formattedAddress: string;
  placeId: string;
  city: string;
  area: string;
}> {
  if (typeof window === 'undefined' || !window.google?.maps?.Geocoder) {
    return Promise.reject(new Error('Google Maps not loaded'));
  }

  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status !== 'OK' || !results?.length) {
        reject(new Error(`Geocoding failed: ${status}`));
        return;
      }

      const result = results[0];
      const { city, area } = parseGeocoderComponents(result.address_components);

      resolve({
        formattedAddress: result.formatted_address || '',
        placeId: result.place_id || '',
        city,
        area,
      });
    });
  });
}
