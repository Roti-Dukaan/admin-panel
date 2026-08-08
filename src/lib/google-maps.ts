export function getGoogleMapsApiKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  );
}

let mapsLoadPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Not in browser"));
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (mapsLoadPromise) {
    return mapsLoadPromise;
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is not configured"));
  }

  mapsLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="maps.googleapis.com/maps/api/js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")), {
        once: true,
      });
      if (window.google?.maps) {
        resolve();
      }
      return;
    }

    const callbackName = `__googleMapsCallback${Date.now()}`;
    (window as unknown as Record<string, () => void>)[callbackName] = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      resolve();
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      mapsLoadPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return mapsLoadPromise;
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
