-- File populates database. Inserts allergen table with the most common allergens listed on mattilsynet.no
-- Run file after schema.sql (the file that creates the tables)

INSERT INTO allergens (name, description) VALUES
  ('Gluten',      'Hvete, rug, bygg, havre og andre glutenholdige kornsorter, eller produkter som inneholder spor av gluten'),
  ('Skalldyr',    'Reker, krabbe, hummer, krill, kreps, scampi og lignende'),
  ('Egg',         'Egg og produkter fremstilt av egg. Eks: eggnudler, pasta, majones, surimi (crabsticks), marshmallows, marsipan, kaker, panerte retter, supper, sauser, glasurer og dressinger'),
  ('Fisk',        'Fisk og produkter som inneholder fisk'),
  ('Peanøtter',   'Peanøtter og produkter som inneholder peanøtter'),
  ('Soya',        'Soyabønner og produkter som inneholder soya'),
  ('Melk',        'Melk og meieriprodukter som kun inneholder melk'),
  ('Laktose',     'Melk og meieriprodukter som inneholder laktose'),
  ('Nøtter',      'Mandel, hasselnøtt, valnøtt, cashewnøtt, pekannøtt, paranøtt, pistasjnøtt, macadamianøtt ol.'),
  ('Selleri',     'Stangselleri (stilkselleri), samt blader, frø og rot (knoll) av selleriplanten'),
  ('Sennep',      'Sennep, sennepspulver og sennepsfrø'),
  ('Sesamfrø',    'Sesamfrø og produkter av sesamfrø'),
  ('Sulfitt',     'Svoveldioksid og sulfitter. Brukes ofte til konservering av frukt og grønnsaker, enkelte typer kjøttprodukter, samt brus, juice, vin og øl'),
  ('Lupin',       'Lupinfrø og lupinmel'),
  ('Bløtdyr',     'Muslinger, snegler, blekksprut, blåskjell, kamskjell, østers, hjerteskjell, kråkeboller, akkar, kalamari og sjøsnegler o.l.')
ON CONFLICT DO NOTHING;