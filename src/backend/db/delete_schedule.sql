-- Clears schedule entries only that are 1 year old. Edit text longer or shorter duration (ex. 5 years or 90 days);
-- Recommended anual yearly cleanup.

-- 1. Preview: Checks amount of rows that will be removed
SELECT
  (SELECT count(*) FROM scheduled_dishes     WHERE serve_date < current_date - INTERVAL '1 year') AS dish_entries,
  (SELECT count(*) FROM scheduled_hot_snacks WHERE serve_date < current_date - INTERVAL '1 year') AS snack_entries;

-- 2. Delete (deletes entries from scheduled dishes and scheduled hot snacks)
BEGIN;
DELETE FROM scheduled_dishes     WHERE serve_date < current_date - INTERVAL '1 year';
DELETE FROM scheduled_hot_snacks WHERE serve_date < current_date - INTERVAL '1 year';
COMMIT;