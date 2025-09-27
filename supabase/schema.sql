-- TABLE
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz default now(),
  display_name text not null,
  address_line text,
  city text,
  country text,
  latitude double precision not null,
  longitude double precision not null,
  anecdote_text text,
  photo_url text,
  tags text,
  consent_publication boolean default false
);

-- INDEX
create index if not exists submissions_idx_city_country on public.submissions (country, city);
create index if not exists submissions_idx_submitted on public.submissions (submitted_at);

-- RLS
alter table public.submissions enable row level security;

drop policy if exists "public read consented" on public.submissions;
create policy "public read consented"
on public.submissions for select
  to anon
  using (consent_publication = true);
