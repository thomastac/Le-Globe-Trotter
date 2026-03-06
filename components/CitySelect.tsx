"use client";

import React, { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from '@/utils/gmaps';

export type CityPick = { name: string; lat?: number; lng?: number };

export default function CitySelect(props: {
  value: string;
  onChange: (v: CityPick) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const { value, onChange, placeholder = "Recherche une ville...", disabled, ariaLabel } = props;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [service, setService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hoverIndex, setHoverIndex] = useState(-1);

  // Initialize Google Maps services
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not configured');
      setError('Configuration Google Maps manquante');
      return;
    }

    const init = async () => {
      try {
        await loadGoogleMaps(apiKey);
        
        if (!window.google.maps.places) {
          throw new Error('Google Places API not available');
        }

        setService(new window.google.maps.places.AutocompleteService());
        setPlacesService(new window.google.maps.places.PlacesService(document.createElement('div')));
      } catch (err) {
        console.error('Failed to initialize Google Maps:', err);
        setError('Impossible de charger le service de recherche de villes');
      }
    };

    init();

    // Cleanup
    return () => {
      setService(null);
      setPlacesService(null);
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch predictions when query changes
  useEffect(() => {
    if (!service || !query.trim()) {
      setPredictions([]);
      return;
    }

    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        service.getPlacePredictions(
          {
            input: query,
            types: ['(cities)'],
            componentRestrictions: { country: 'fr' },
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setPredictions(predictions);
            } else {
              setPredictions([]);
            }
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error fetching predictions:', err);
        setError('Erreur lors de la recherche de villes');
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchPredictions, 300);
    return () => clearTimeout(timer);
  }, [query, service]);

  const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService) return;

    placesService.getDetails(
      { placeId: prediction.place_id, fields: ['geometry', 'name'] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const location = {
            name: place.name || prediction.description,
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
          };
          onChange(location);
          setQuery(location.name);
          setOpen(false);
        }
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHoverIndex(prev => Math.min(prev + 1, predictions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHoverIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && hoverIndex >= 0 && hoverIndex < predictions.length) {
      e.preventDefault();
      handleSelect(predictions[hoverIndex]);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (predictions.length > 0) {
        handleSelect(predictions[0]);
      }
    }
  };

  const displayValue = open ? query : value;

  return (
    <div ref={containerRef} className="relative w-full" aria-label={ariaLabel}>
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="input pill-input white-border w-full"
        style={{
          background: '#fff',
          border: '1px solid #7fbcd4',
          boxShadow: open ? '0 0 0 3px rgba(127,188,212,0.35)' : 'none',
          color: '#111',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          width: '100%',
          outline: 'none',
          transition: 'all 0.2s ease-in-out',
        }}
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}

      {open && (
        <div 
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          style={{
            borderRadius: '12px',
            border: '1px solid #7fbcd4',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            background: '#fff',
            maxHeight: '280px',
            overflowY: 'auto',
            marginTop: '8px',
            padding: '6px',
          }}
        >
          {error ? (
            <div className="p-2 text-sm text-red-600">{error}</div>
          ) : predictions.length === 0 && query ? (
            <div className="p-2 text-sm text-gray-500">Aucun résultat trouvé</div>
          ) : (
            <ul>
              {predictions.map((prediction, index) => (
                <li
                  key={prediction.place_id}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    hoverIndex === index ? 'bg-blue-50' : ''
                  }`}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: hoverIndex === index ? '#e6f3f7' : 'transparent',
                    cursor: 'pointer',
                    color: '#111',
                    transition: 'background-color 0.2s ease-in-out',
                  }}
                  onClick={() => handleSelect(prediction)}
                  onMouseEnter={() => setHoverIndex(index)}
                >
                  {prediction.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
