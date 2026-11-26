import "server-only";
import type postgres from "postgres";
import { Dish, type DishRow } from "@/src/backend/models/Dish";
import type { DishInput, Id } from "@/src/backend/lib/schemas";

export type SaveDishResult =
  | { ok: true; id: number }
  | { ok: false; reason: "not_found" | "unknown_allergen" | "duplicate" };
export type DeleteDishResult = { ok: true } | { ok: false; reason: "not_found" };

const code = (e: unknown) => (e as { code?: string }).code;

export class DishService {
  constructor(private readonly db: postgres.Sql) {}

  async list(): Promise<Dish[]> {
    const rows = await this.db<DishRow[]>`
      SELECT d.id, d.name, d.description, d.price,
             COALESCE(json_agg(json_build_object('id', a.id, 'name', a.name) ORDER BY a.name)
                      FILTER (WHERE a.id IS NOT NULL), '[]') AS allergens
      FROM dishes d
      LEFT JOIN dish_allergens da ON da.dish_id = d.id
      LEFT JOIN allergens a ON a.id = da.allergen_id
      GROUP BY d.id
      ORDER BY d.name
    `;
    return rows.map((r) => Dish.fromRow(r));
  }

  async findById(id: Id): Promise<Dish | null> {
    const rows = await this.db<DishRow[]>`
      SELECT d.id, d.name, d.description, d.price,
             COALESCE(json_agg(json_build_object('id', a.id, 'name', a.name) ORDER BY a.name)
                      FILTER (WHERE a.id IS NOT NULL), '[]') AS allergens
      FROM dishes d
      LEFT JOIN dish_allergens da ON da.dish_id = d.id
      LEFT JOIN allergens a ON a.id = da.allergen_id
      WHERE d.id = ${id}
      GROUP BY d.id
    `;
    return rows[0] ? Dish.fromRow(rows[0]) : null;
  }

  // Is this dish on any weekday of the weekly menu?
  async isScheduled(id: Id): Promise<boolean> {
    const [row] = await this.db<{ scheduled: boolean }[]>`
      SELECT EXISTS (SELECT 1 FROM scheduled_dishes WHERE dish_id = ${id}) AS scheduled
    `;
    return row.scheduled;
  }

  async create(input: DishInput): Promise<SaveDishResult> {
    try {
      return await this.db.begin(async (tx): Promise<SaveDishResult> => {
        if (await this.nameTaken(tx, input.name)) {
          return { ok: false, reason: "duplicate" };
        }
        const [dish] = await tx<{ id: number }[]>`
          INSERT INTO dishes (name, description, price)
          VALUES (${input.name}, ${input.description}, ${input.price})
          RETURNING id
        `;
        await this.linkAllergens(tx, dish.id, input.allergenIds);
        return { ok: true, id: dish.id };
      });
    } catch (e) {
      // 23503: an allergen id doesn't exist. 23505: the unique index caught a race.
      if (code(e) === "23503") return { ok: false, reason: "unknown_allergen" };
      if (code(e) === "23505") return { ok: false, reason: "duplicate" };
      throw e;
    }
  }

  async update(id: Id, input: DishInput): Promise<SaveDishResult> {
    try {
      return await this.db.begin(async (tx): Promise<SaveDishResult> => {
        const exists = await tx`SELECT 1 FROM dishes WHERE id = ${id}`;
        if (exists.length === 0) return { ok: false, reason: "not_found" };

        // Ignore the dish being edited, so saving without renaming isn't a duplicate
        if (await this.nameTaken(tx, input.name, id)) {
          return { ok: false, reason: "duplicate" };
        }

        await tx`
          UPDATE dishes
          SET name = ${input.name}, description = ${input.description},
              price = ${input.price}, updated_at = now()
          WHERE id = ${id}
        `;
        await tx`DELETE FROM dish_allergens WHERE dish_id = ${id}`;
        await this.linkAllergens(tx, id, input.allergenIds);
        return { ok: true, id };
      });
    } catch (e) {
      if (code(e) === "23503") return { ok: false, reason: "unknown_allergen" };
      if (code(e) === "23505") return { ok: false, reason: "duplicate" };
      throw e;
    }
  }

  async delete(id: Id): Promise<DeleteDishResult> {
    // ON DELETE CASCADE also removes this dish's schedule entries and allergen links
    const rows = await this.db`DELETE FROM dishes WHERE id = ${id} RETURNING id`;
    return rows.length > 0 ? { ok: true } : { ok: false, reason: "not_found" };
  }

  private async nameTaken(
    tx: postgres.TransactionSql,
    name: string,
    excludeId?: number
  ): Promise<boolean> {
    const rows =
      excludeId === undefined
        ? await tx`SELECT 1 FROM dishes WHERE lower(name) = lower(${name}) LIMIT 1`
        : await tx`
            SELECT 1 FROM dishes
            WHERE lower(name) = lower(${name}) AND id <> ${excludeId}
            LIMIT 1
          `;
    return rows.length > 0;
  }

  private async linkAllergens(tx: postgres.TransactionSql, dishId: number, allergenIds: number[]) {
    if (allergenIds.length === 0) return;
    const rows = allergenIds.map((allergen_id) => ({ dish_id: dishId, allergen_id }));
    await tx`INSERT INTO dish_allergens ${tx(rows, "dish_id", "allergen_id")}`;
  }
}