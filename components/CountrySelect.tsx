"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type CountryItem = { code2: string; name: string };

function flagEmojiFromCode2(code2: string): string {
  const code = (code2 || "").toUpperCase();
  if (code.length !== 2) return "";
  const A = 0x1f1e6;
  const first = A + (code.charCodeAt(0) - 65);
  const second = A + (code.charCodeAt(1) - 65);
  try {
    return String.fromCodePoint(first) + String.fromCodePoint(second);
  } catch {
    return "";
  }
}

export default function CountrySelect(props: {
  countries: CountryItem[];
  value: string; // country name selected
  onChange: (name: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const { countries, value, onChange, placeholder = "Choisis un pays", disabled, ariaLabel } = props;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number>(-1);

  function normalize(s: string) {
    const raw = (s || "").toLowerCase();
    try {
      // Remove accents in a cross-browser way
      return raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    } catch {
      return raw; // fallback if normalize isn't available
    }
  }

  const items = useMemo(() => {
    // Build a sorted and deduplicated base list by name
    const seen = new Set<string>();
    const base = countries
      .filter((c) => {
        const key = (c.name || '').trim();
        if (!key) return false;
        if (seen.has(key.toLowerCase())) return false;
        seen.add(key.toLowerCase());
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

    const q = normalize(query.trim());
    if (q.length === 0) return base; // when nothing typed, show all
    return base.filter((c) => normalize((c.name || '').trim()).startsWith(q));
  }, [countries, query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as any)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) setHoverIndex(-1);
  }, [open]);

  function commitSelection(idx: number) {
    if (idx < 0 || idx >= items.length) return;
    onChange(items[idx].name);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="country-select" aria-label={ariaLabel} style={{ position: "relative" }}>
      <div className="country-select-input-wrap" style={{}}
      >
        <input
          className="input pill-input white-border"
          placeholder={placeholder}
          value={open ? query : value}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHoverIndex((i) => Math.min(i + 1, items.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setHoverIndex((i) => Math.max(i - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); if (!open) setOpen(true); else commitSelection(hoverIndex >= 0 ? hoverIndex : 0); }
            else if (e.key === "Escape") { setOpen(false); setQuery(""); }
          }}
          disabled={disabled}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="country-select-listbox"
          style={{
            background: '#fff',
            border: '1px solid #7fbcd4',
            boxShadow: open ? '0 0 0 3px rgba(127,188,212,0.35)' : undefined,
            color: '#111',
          }}
        />
      </div>
      {open && (
        <ul
          id="country-select-listbox"
          ref={listRef}
          role="listbox"
          className="country-select-list"
          style={{
            position: "absolute",
            zIndex: 20,
            top: "100%",
            left: 0,
            right: 0,
            maxHeight: 280,
            overflowY: "auto",
            marginTop: 8,
            background: "#fff",
            border: "1px solid #7fbcd4",
            borderRadius: 12,
            padding: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,.12)",
          }}
        >
          {items.length === 0 && (
            <li style={{ padding: "10px 12px", color: "#6b7280" }}>Aucun résultat</li>
          )}
          {items.map((c, idx) => {
            const emoji = flagEmojiFromCode2(c.code2);
            const active = idx === hoverIndex;
            return (
              <li
                key={c.code2}
                role="option"
                aria-selected={value === c.name}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseDown={(e) => { e.preventDefault(); commitSelection(idx); }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px 1fr",
                  gap: 8,
                  alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: active ? "#e6f3f7" : "transparent",
                  cursor: "pointer",
                }}
              >
                <span style={{ width: 24, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16 }} aria-hidden>{emoji}</span>
                <span style={{ color: "#111" }}>{c.name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
