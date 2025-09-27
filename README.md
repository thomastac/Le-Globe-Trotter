# GlobeTrotter – Demo Map (Next.js + Supabase + Google Maps)

Une mini app Next.js (App Router, TypeScript) qui lit des points en lecture publique depuis Supabase (RLS) et les affiche sur Google Maps JS API. Popups avec nom, ville/pays, image et anecdote.

## Prérequis
- Node 18+
- Un projet Supabase (URL + ANON KEY) et accès au SQL Editor
- Une clé Google Maps JavaScript API

## Configuration
Créez un fichier `.env.local` à la racine en vous basant sur `.env.local.example` :

```
NEXT_PUBLIC_SUPABASE_URL=... 
NEXT_PUBLIC_SUPABASE_ANON_KEY=... 
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

## Installation & démarrage

```
pm install
npm run dev
```

Puis ouvrez http://localhost:3000 et allez sur `/map`.

## Supabase – Schéma & Seed

Exécutez, via le SQL Editor Supabase (ou `psql` avec une clé de service), les scripts dans `supabase/` dans cet ordre :

1. `schema.sql`
2. `seed.sql`

> Remarque: l’insertion nécessite des droits d’écriture (rôle admin/service). La lecture publique est permise par la policy RLS fournie.

## Structure
- `app/map/page.tsx` charge un composant client `MapClient` (pas de SSR) qui :
  - récupère les `submissions` via Supabase (ANON KEY + RLS)
  - initialise Google Map centrée monde (zoom 2)
  - crée un `Marker` par point, avec `InfoWindow` au clic (nom, ville/pays, image, anecdote trunc ~240)
- `lib/supabase.ts` client Supabase côté navigateur
- `lib/fetchSubmissions.ts` type `Submission` + fetch trié par `submitted_at desc`, filtré `consent_publication = true`
- `supabase/schema.sql` table + index + RLS policy
- `supabase/seed.sql` 3 entrées de démonstration

## Prochaines améliorations possibles
- Clustering des marqueurs (MarkerClusterer)
- Filtres (tags, pays, dates)
- Export CSV/GeoJSON
- SSR ou caching sélectif
