import { useState, useEffect } from 'react';
import { getGoogleMapsApiKey } from '@/lib/google-maps';

let loaded = false;
let loadPromise: Promise<void> | null = null;

function createScriptLoader(): Promise<void> {
  if (loadPromise) return loadPromise;

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is not configured'));
  }

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Not in browser'));

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    if (existing) {
      loaded = true;
      resolve();
      return;
    }

    const callbackName = '__googleMapsCallback' + Date.now();

    (window as any)[callbackName] = () => {
      loaded = true;
      delete (window as any)[callbackName];
      resolve();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete (window as any)[callbackName];
      reject(new Error('Failed to load Google Maps script'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function useGoogleMapsScript(): { isLoaded: boolean; error: string | null } {
  const [isLoaded, setIsLoaded] = useState(loaded);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loaded) {
      setIsLoaded(true);
      return;
    }

    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
      setError('Google Maps API key is not configured');
      return;
    }

    createScriptLoader()
      .then(() => setIsLoaded(true))
      .catch((err) => setError(err.message || 'Failed to load Google Maps'));
  }, []);

  return { isLoaded, error };
}
