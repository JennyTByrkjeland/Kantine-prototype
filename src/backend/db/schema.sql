-- db/schema.sql
-- Creates the tables for the cafeteria menu app.
-- Run on an empty database, as a user that may create tables.

-- Allergens: users pick from this list, and create new ones only if missing
CREATE TABLE allergens (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT
);

-- Case-insensitive uniqueness: 'Gluten' and 'gluten' count as the same
CREATE UNIQUE INDEX allergens_unique_name_lower ON allergens (lower(name));

-- Dish library: each dish is stored once
CREATE TABLE dishes (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(8,2) NOT NULL CHECK (price >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX dishes_unique_name_lower ON dishes (lower(name));

CREATE TABLE dish_allergens (
  dish_id     INTEGER NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  allergen_id INTEGER NOT NULL REFERENCES allergens(id),
  PRIMARY KEY (dish_id, allergen_id)
);

-- Weekly menu: which weekday a dish is served (1 = Monday ... 7 = Sunday)
CREATE TABLE scheduled_dishes (
  id      SERIAL PRIMARY KEY,
  dish_id INTEGER NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  UNIQUE (dish_id, weekday)
);

-- Hot snack library
CREATE TABLE hot_snacks (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(8,2) NOT NULL CHECK (price >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX hot_snacks_unique_name_lower ON hot_snacks (lower(name));

CREATE TABLE hot_snack_allergens (
  hot_snack_id INTEGER NOT NULL REFERENCES hot_snacks(id) ON DELETE CASCADE,
  allergen_id  INTEGER NOT NULL REFERENCES allergens(id),
  PRIMARY KEY (hot_snack_id, allergen_id)
);

-- Which weekday a hot snack is served
CREATE TABLE scheduled_hot_snacks (
  id           SERIAL PRIMARY KEY,
  hot_snack_id INTEGER NOT NULL REFERENCES hot_snacks(id) ON DELETE CASCADE,
  weekday      SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  UNIQUE (hot_snack_id, weekday)
);