import "server-only";
import type postgres from "postgres";
import type { ScheduledDish, ScheduledSnack } from "@/src/backend/lib/menu-types";

export class MenuService {
  constructor(private readonly db: postgres.Sql) {}

  async dishesForWeekday(weekday: number) {
    return this.db<ScheduledDish[]>`
      SELECT sd.id AS "scheduledId", sd.weekday,
             d.id, d.name, d.description, d.price,
             COALESCE(json_agg(a.name ORDER BY a.name)
                      FILTER (WHERE a.id IS NOT NULL), '[]') AS allergens
      FROM scheduled_dishes sd
      JOIN dishes d ON d.id = sd.dish_id
      LEFT JOIN dish_allergens da ON da.dish_id = d.id
      LEFT JOIN allergens a ON a.id = da.allergen_id
      WHERE sd.weekday = ${weekday}
      GROUP BY sd.id, d.id
      ORDER BY d.name
    `;
  }

  async weeklyDishes() {
    return this.db<ScheduledDish[]>`
      SELECT sd.id AS "scheduledId", sd.weekday,
             d.id, d.name, d.description, d.price,
             COALESCE(json_agg(a.name ORDER BY a.name)
                      FILTER (WHERE a.id IS NOT NULL), '[]') AS allergens
      FROM scheduled_dishes sd
      JOIN dishes d ON d.id = sd.dish_id
      LEFT JOIN dish_allergens da ON da.dish_id = d.id
      LEFT JOIN allergens a ON a.id = da.allergen_id
      GROUP BY sd.id, d.id
      ORDER BY sd.weekday, d.name
    `;
  }

  async snacksForWeekday(weekday: number) {
    return this.db<ScheduledSnack[]>`
      SELECT ss.id AS "scheduledId", ss.weekday,
             s.id, s.name, s.description, s.price,
             COALESCE(json_agg(a.name ORDER BY a.name)
                      FILTER (WHERE a.id IS NOT NULL), '[]') AS allergens
      FROM scheduled_hot_snacks ss
      JOIN hot_snacks s ON s.id = ss.hot_snack_id
      LEFT JOIN hot_snack_allergens sa ON sa.hot_snack_id = s.id
      LEFT JOIN allergens a ON a.id = sa.allergen_id
      WHERE ss.weekday = ${weekday}
      GROUP BY ss.id, s.id
      ORDER BY s.name
    `;
  }
}