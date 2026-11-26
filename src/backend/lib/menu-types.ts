//EDIT - SYNTAXT AND COMMENTS
export type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: string;          // NUMERIC arrives as a string, e.g. "129.00"
  allergens: string[];    // allergen names, sorted
};

// weekday: 1 = Monday ... 7 = Sunday
export type ScheduledDish = MenuItem & { scheduledId: number; weekday: number };
export type ScheduledSnack = MenuItem & { scheduledId: number; weekday: number };