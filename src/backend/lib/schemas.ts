import { z } from "zod";

// One message when a field is missing, another when it has the wrong type
const missingOrWrong = (label: string, expected: string) => ({
  error: (issue: { input?: unknown }) =>
    issue.input === undefined ? `${label} is required.` : `${label} must be ${expected}.`,
});

// An id taken from a URL, e.g. "12" (the controllers report their own "Invalid id.")
export const IdParam = z.coerce.number().int().positive();
export type Id = z.infer<typeof IdParam>;

// An id sent in a JSON body, with a message that names the field
const BodyId = (label: string) =>
  z
    .number(missingOrWrong(label, "a number"))
    .int(`${label} must be a whole number.`)
    .positive(`${label} must be positive.`);

// ---------- Reusable fields ----------

const NameField = z
  .string(missingOrWrong("Name", "text"))
  .trim()
  .min(1, "Name is required.")
  .max(100, "Name is too long.")
  .transform((s) => s.replace(/\s+/g, " "));

const DescriptionField = z
  .string({ error: "Description must be text." })
  .trim()
  .max(500, "Description is too long.")
  .optional()
  .transform((s) => (s ? s : null));

const PriceField = z
  .number(missingOrWrong("Price", "a number"))
  .min(0, "Price can't be negative.")
  .refine((n) => n !== 0, "Price can't be 0.")
  .max(999999.99, "Price is too high.")
  .refine(
    (n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6,
    "Price can have at most two decimals."
  );

const AllergenIdsField = z
  .array(IdParam, { error: "Allergen ids must be a list of numbers." })
  .max(50, "Too many allergens.")
  .default([])
  .transform((ids) => [...new Set(ids)]);

const WEEKDAY_MESSAGE = "Weekday must be a whole number from 1 (Monday) to 7 (Sunday).";

const WeekdayField = z
  .number(missingOrWrong("Weekday", "a number from 1 (Monday) to 7 (Sunday)"))
  .int(WEEKDAY_MESSAGE)
  .min(1, WEEKDAY_MESSAGE)
  .max(7, WEEKDAY_MESSAGE);

const BODY_MESSAGE = { error: "Request body must be a JSON object." };

// ---------- Allergens ----------

export const AllergenInput = z.object(
  {
    name: NameField,
    description: DescriptionField,
  },
  BODY_MESSAGE
);
export type AllergenInput = z.infer<typeof AllergenInput>;

// ---------- Dishes ----------

export const DishInput = z.object(
  {
    name: NameField,
    description: DescriptionField,
    price: PriceField,
    allergenIds: AllergenIdsField,
  },
  BODY_MESSAGE
);
export type DishInput = z.infer<typeof DishInput>;

// ---------- Hot snacks ----------

export const HotSnackInput = z.object(
  {
    name: NameField,
    description: DescriptionField,
    price: PriceField,
    allergenIds: AllergenIdsField,
  },
  BODY_MESSAGE
);
export type HotSnackInput = z.infer<typeof HotSnackInput>;

// ---------- Scheduling (weekday 1 = Monday ... 7 = Sunday) ----------

export const ScheduleDishInput = z.object(
  {
    dishId: BodyId("Dish id"),
    weekday: WeekdayField,
  },
  BODY_MESSAGE
);
export type ScheduleDishInput = z.infer<typeof ScheduleDishInput>;

export const ScheduleSnackInput = z.object(
  {
    hotSnackId: BodyId("Hot snack id"),
    weekday: WeekdayField,
  },
  BODY_MESSAGE
);
export type ScheduleSnackInput = z.infer<typeof ScheduleSnackInput>;

export const MoveScheduledDishInput = z.object({ weekday: WeekdayField }, BODY_MESSAGE);
export type MoveScheduledDishInput = z.infer<typeof MoveScheduledDishInput>;

export const MoveScheduledSnackInput = z.object({ weekday: WeekdayField }, BODY_MESSAGE);
export type MoveScheduledSnackInput = z.infer<typeof MoveScheduledSnackInput>;