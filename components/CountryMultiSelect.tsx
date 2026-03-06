"use client";

import { useState, useRef, useEffect } from 'react';

interface Country {
  code2: string;
  name: string;
}

interface CountryMultiSelectProps {
  countries: Country[];
  selectedCountries: Set<string>;
  onChange: (selectedCountries: Set<string>) => void;
  placeholder?: string;
  ariaLabel?: string;
}

// Convert ISO2 to flag emoji
function flagFromCode2(code2: string): string {
  if (!code2 || code2.length !== 2) return '';
  const up = code2.toUpperCase();
  const A = 0x1f1e6;
  const base = 'A'.charCodeAt(0);
  try {
    return (
      String.fromCodePoint(A + (up.charCodeAt(0) - base)) +
      String.fromCodePoint(A + (up.charCodeAt(1) - base))
    );
  } catch {
    return '';
  }
}

export default function CountryMultiSelect({
  countries,
  selectedCountries,
  onChange,
  placeholder = 'Sélectionner des pays',
  ariaLabel = 'Sélecteur multi-pays',
}: CountryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAll(false); // Reset when closing
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Limit display to 10 countries unless searching or "show all" is clicked
  const displayedCountries = searchTerm || showAll
    ? filteredCountries
    : filteredCountries.slice(0, 10);
  const hasMore = !searchTerm && !showAll && filteredCountries.length > 10;

  const toggleCountry = (countryName: string) => {
    const newSelected = new Set(selectedCountries);
    if (newSelected.has(countryName)) {
      newSelected.delete(countryName);
    } else {
      newSelected.add(countryName);
    }
    onChange(newSelected);
  };

  const clearAll = () => {
    onChange(new Set());
  };

  return (
    <div ref={containerRef} className="relative w-full" aria-label={ariaLabel}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left bg-white border-[1.5px] border-stone-200 rounded-lg
                   hover:border-stone-400 transition-all duration-150 flex items-center justify-between
                   focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-opacity-50"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-sm text-stone-900 font-medium">
          {selectedCountries.size === 0
            ? placeholder
            : `${selectedCountries.size} pays sélectionné${selectedCountries.size > 1 ? 's' : ''}`}
        </span>
        <svg
          className={`w-5 h-5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Selected countries chips (mobile-first) */}
      {selectedCountries.size > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Array.from(selectedCountries).map((countryName) => {
            const country = countries.find((c) => c.name === countryName);
            if (!country) return null;
            return (
              <div
                key={countryName}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 border border-stone-200
                           rounded-full text-sm font-medium text-stone-900"
              >
                <span>{flagFromCode2(country.code2)}</span>
                <span>{countryName}</span>
                <button
                  type="button"
                  onClick={() => toggleCountry(countryName)}
                  className="ml-1 hover:text-red-600 transition-colors"
                  aria-label={`Retirer ${countryName}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-2 bg-white border border-stone-200 rounded-lg shadow-lg
                     max-h-[320px] md:max-h-96 overflow-hidden backdrop-blur-md bg-white/95"
          role="listbox"
        >
          {/* Search bar */}
          <div className="p-3 border-b border-stone-200">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un pays..."
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent
                         placeholder-stone-400"
              aria-label="Rechercher un pays"
            />
          </div>

          {/* Clear all button */}
          {selectedCountries.size > 0 && (
            <div className="p-2 border-b border-stone-200">
              <button
                type="button"
                onClick={clearAll}
                className="w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md
                           transition-colors font-medium"
              >
                Tout désélectionner
              </button>
            </div>
          )}

          {/* Countries list */}
          <div className="overflow-y-auto max-h-[240px] md:max-h-64">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-sm text-stone-500">Aucun pays trouvé</div>
            ) : (
              <>
                {displayedCountries.map((country) => {
                  const isSelected = selectedCountries.has(country.name);
                  return (
                    <label
                      key={country.code2}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-stone-50 cursor-pointer
                                 transition-colors border-b border-stone-100 last:border-b-0
                                 ${isSelected ? 'bg-stone-50' : ''}`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCountry(country.name)}
                        className="w-4 h-4 text-stone-900 border-stone-300 rounded
                                   focus:ring-2 focus:ring-stone-300 focus:ring-opacity-50
                                   cursor-pointer"
                      />
                      <span className="text-xl" aria-hidden="true">
                        {flagFromCode2(country.code2)}
                      </span>
                      <span className="flex-1 text-sm font-medium text-stone-900">{country.name}</span>
                    </label>
                  );
                })}

                {/* Show more/less button */}
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="w-full px-4 py-3 text-sm text-stone-600 hover:bg-stone-50 
                               transition-colors font-medium border-t border-stone-200"
                  >
                    Afficher {filteredCountries.length - 10} pays de plus...
                  </button>
                )}

                {showAll && !searchTerm && filteredCountries.length > 10 && (
                  <button
                    type="button"
                    onClick={() => setShowAll(false)}
                    className="w-full px-4 py-3 text-sm text-stone-600 hover:bg-stone-50 
                               transition-colors font-medium border-t border-stone-200"
                  >
                    Afficher moins
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
