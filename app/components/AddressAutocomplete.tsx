"use client";

import { useEffect, useRef, useState } from 'react';

interface AddressAutocompleteProps {
    value: string;
    onChange: (val: string) => void;
    onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
    placeholder?: string;
    className?: string;
    apiKey: string;
    types?: string[];
}

export default function AddressAutocomplete({
    value,
    onChange,
    onPlaceSelect,
    placeholder,
    className,
    apiKey,
    types = [],
}: AddressAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    // 1. Ensure Google Maps Script is loaded (Singleton check with Polling)
    useEffect(() => {
        if (!apiKey) return;

        const checkGoogle = () => {
            if (typeof window !== 'undefined' && window.google?.maps?.places) {
                setIsScriptLoaded(true);
                return true;
            }
            return false;
        };

        if (checkGoogle()) return;

        const existing = document.getElementById('google-maps-sdk');

        // Polling backup in case we missed the load event
        const interval = setInterval(() => {
            if (checkGoogle()) {
                clearInterval(interval);
            }
        }, 100);

        if (existing) {
            existing.addEventListener('load', () => {
                setIsScriptLoaded(true);
                clearInterval(interval);
            });
            return () => clearInterval(interval);
        }

        const script = document.createElement('script');
        script.id = 'google-maps-sdk';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setIsScriptLoaded(true);
            clearInterval(interval);
        };
        script.onerror = (e) => console.error('Google Maps script failed to load', e);
        document.head.appendChild(script);

        return () => clearInterval(interval);
    }, [apiKey]);

    // 2. Initialize Autocomplete on this specific input
    useEffect(() => {
        if (!isScriptLoaded || !inputRef.current) return;

        // Cleanup previous instance if any
        if (autocompleteRef.current) {
            google.maps.event.clearInstanceListeners(autocompleteRef.current);
            autocompleteRef.current = null;
        }

        try {
            const opts: google.maps.places.AutocompleteOptions = {
                fields: ['address_components', 'name', 'geometry', 'formatted_address'],
                types: types,
            };

            const ac = new google.maps.places.Autocomplete(inputRef.current, opts);
            autocompleteRef.current = ac;

            const listener = ac.addListener('place_changed', () => {
                const place = ac.getPlace();
                if (!place) return;

                if (onPlaceSelect) {
                    onPlaceSelect(place);
                }

                // Robust extraction logic
                const comps = place.address_components || [];
                const get = (t: string) => comps.find((c) => c.types?.includes(t));

                const city = get('locality')?.long_name;
                const admin1 = get('administrative_area_level_1')?.long_name;
                const admin2 = get('administrative_area_level_2')?.long_name;
                const country = get('country')?.long_name;
                const formatted = place.formatted_address;

                // Priority: Name (if specific) > City > Admin Area > Country > Formatted
                let val = city || admin1 || admin2 || place.name || country || formatted || '';

                if (place.name && place.name !== country) {
                    val = place.name;
                } else if (city) {
                    val = city;
                } else if (country) {
                    val = country;
                }

                // Update parent state
                if (val) {
                    onChange(val);
                    // Force input value update to match state immediately
                    if (inputRef.current) {
                        inputRef.current.value = val;
                    }
                }
            });
        } catch (err) {
            console.error('Failed to initialize Autocomplete', err);
        }

        return () => {
            if (autocompleteRef.current) {
                google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, [isScriptLoaded, onChange, types, onPlaceSelect]);

    // Sync input value with prop value (for manual typing or external updates)
    useEffect(() => {
        if (inputRef.current && inputRef.current.value !== value) {
            inputRef.current.value = value;
        }
    }, [value]);

    return (
        <input
            ref={inputRef}
            className={className}
            placeholder={placeholder}
            defaultValue={value} // Use defaultValue to let React handle updates via ref/effect
            onChange={(e) => onChange(e.target.value)}
        />
    );
}
