-- db/dev-data.sql
-- LOCAL DEVELOPMENT ONLY. Never run this on the real database.
-- Run after schema.sql and seed.sql, connected as the postgres user
-- (TRUNCATE needs more permissions than cafeteria_app has).

-- Start clean so the file can be re-run to refresh the dates.
-- Clears dishes, snacks, their allergen links and their schedules.
-- The allergens table is not touched.
TRUNCATE dishes, hot_snacks RESTART IDENTITY CASCADE;

-- Dish library
INSERT INTO dishes (name, description, price) VALUES
  ('Kjøttkaker i brun saus',        'Serveres med kokte poteter og tyttebær', 129),
  ('Fiskegrateng',                  'Med gulrøtter og brokkoli',              129),
  ('Kyllingcurry',                  'Serveres med ris',                       139),
  ('Vegetarlasagne',                'Med grønn salat',                        129),
  ('Laks med stekte grønnsaker',    NULL,                                     149),
  ('Ovnsbakte grønnsaker med ris',  'Vegansk',                                119),
  ('Rømmegrøt',                     'Med spekemat og kanelsukker',            119.50);

-- Allergens per dish. Dish names must match the names above exactly.
INSERT INTO dish_allergens (dish_id, allergen_id)
SELECT d.id, a.id
FROM (VALUES
  ('Kjøttkaker i brun saus',     'Gluten'),
  ('Kjøttkaker i brun saus',     'Melk'),
  ('Kjøttkaker i brun saus',     'Egg'),
  ('Fiskegrateng',               'Fisk'),
  ('Fiskegrateng',               'Melk'),
  ('Fiskegrateng',               'Gluten'),
  ('Fiskegrateng',               'Egg'),
  ('Kyllingcurry',               'Melk'),
  ('Kyllingcurry',               'Selleri'),
  ('Vegetarlasagne',             'Gluten'),
  ('Vegetarlasagne',             'Melk'),
  ('Vegetarlasagne',             'Egg'),
  ('Vegetarlasagne',             'Selleri'),
  ('Laks med stekte grønnsaker', 'Fisk'),
  ('Rømmegrøt',                  'Gluten'),
  ('Rømmegrøt',                  'Melk')
  -- 'Ovnsbakte grønnsaker med ris' has no allergens on purpose,
  -- to test how a dish without allergens is displayed
) AS l(dish_name, allergen_name)
JOIN dishes d    ON d.name = l.dish_name
JOIN allergens a ON lower(a.name) = lower(l.allergen_name);

-- Weekly schedule: weekday 1 = Monday ... 5 = Friday
INSERT INTO scheduled_dishes (dish_id, weekday)
SELECT d.id, l.weekday
FROM (VALUES
  (1, 'Kjøttkaker i brun saus'),
  (2, 'Fiskegrateng'),
  (3, 'Kyllingcurry'),
  (3, 'Vegetarlasagne'),             -- two dishes on Wednesday
  (4, 'Laks med stekte grønnsaker'),
  (5, 'Ovnsbakte grønnsaker med ris')
) AS l(weekday, dish_name)
JOIN dishes d ON d.name = l.dish_name;
-- 'Rømmegrøt' is deliberately not scheduled, to test deleting an unscheduled dish


-- Hot snack library
INSERT INTO hot_snacks (name, description, price) VALUES
  ('Ostetoast',        'Skinke og ost',          35),
  ('Pølse i brød',     'Med ketchup og sennep',  30),
  ('Kyllingnuggets',   'Med dipsaus',            40);

INSERT INTO hot_snack_allergens (hot_snack_id, allergen_id)
SELECT s.id, a.id
FROM (VALUES
  ('Ostetoast',      'Gluten'),
  ('Ostetoast',      'Melk'),
  ('Pølse i brød',   'Gluten'),
  ('Pølse i brød',   'Sennep'),
  ('Kyllingnuggets', 'Gluten'),
  ('Kyllingnuggets', 'Egg')
) AS l(snack_name, allergen_name)
JOIN hot_snacks s ON s.name = l.snack_name
JOIN allergens a  ON lower(a.name) = lower(l.allergen_name);

INSERT INTO scheduled_hot_snacks (hot_snack_id, weekday)
SELECT s.id, l.weekday
FROM (VALUES
  (1, 'Ostetoast'),
  (1, 'Pølse i brød'),               -- two snacks on Monday
  (2, 'Kyllingnuggets')
) AS l(weekday, snack_name)
JOIN hot_snacks s ON s.name = l.snack_name;