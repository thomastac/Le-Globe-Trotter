-- Effacer les démos existantes (optionnel)
delete from public.submissions
where display_name in ('Alice – Tokyo', 'Benoît – Bordeaux', 'Chloe – New York');

insert into public.submissions
(display_name, address_line, city, country, latitude, longitude, anecdote_text, photo_url, tags, consent_publication)
values
(
  'Alice – Tokyo',
  'Shibuya, Tokyo, Japan',
  'Tokyo', 'Japan',
  35.659, 139.700,
  'Ramen à 2h du matin près d’un passage piéton bondé, ambiance incroyable !',
  'https://images.unsplash.com/photo-1549692520-acc6669e2f0c',
  'food,night',
  true
),
(
  'Benoît – Bordeaux',
  'Place de la Bourse, Bordeaux, France',
  'Bordeaux', 'France',
  44.841, -0.570,
  'Lever de soleil sur la Garonne, reflet parfait au Miroir d’eau.',
  'https://images.unsplash.com/photo-1563897539633-7374c276c82f',
  'sunrise,river',
  true
),
(
  'Chloe – New York',
  'Times Square, New York, USA',
  'New York', 'USA',
  40.758, -73.985,
  'Spectacle improvisé dans la rue, tout le monde chantait ensemble.',
  'https://images.unsplash.com/photo-1549921296-3b4a4f7a4f83',
  'city,show',
  true
);
