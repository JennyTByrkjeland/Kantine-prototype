import "server-only";
import type postgres from "postgres";
import { HotSnack, type HotSnackRow } from "@/src/backend/models/HotSnack";
import type { HotSnackInput, Id } from "@/src/backend/lib/schemas";

export type SaveHotSnackResult =
  | { ok: true; id: number }
  | { ok: false; reason: "not_found" | "unknown_allergen" | "duplicate" };
export type DeleteHotSnackResult = { ok: true } | { ok: false; reason: "not_found" };

const code = (e: unknown) => (e as { code?: string }).code;

export class HotSnackService {
  constructor(private readonly db: postgres.Sql) {}

  async list(): Promise<HotSnack[]> {
    const rows = await this.db<HotSnackRow[]>`
      SELECT s.id, s.name, s.description, s.price,
             COALESCE(json_agg(json_build_object('id', a.id, 'name', a.name) ORDER BY a.name)
                      FILTER (WHERE a.id IS NOT NULL), '[]') AS allergens
      FROM hot_snacks s
      LEFT JOIN hot_snack_allergens sa ON sa.hot_snack_id = s.id
      LEFT JOIN allergens a ON a.id = sa.allergen_id
      GROUP BY s.id
      ORDER BY s.name
    `;
    return rows.map((r) => HotSnack.fromRow(r));
  }

  async findById(id: Id): Promise<HotSnack | null> {
    const rows = await this.db<HotSnackRow[]>`
      SELECT s.id, s.name, s.description, s.price,
             COALESCE(json_agg(json_build_object('id', a.id, 'name', a.name) ORDER BY a.name)
                      FILTER (WHERE a.id IS NOT NULL), '[]') AS allergens
      FROM hot_snacks s
      LEFT JOIN hot_snack_allergens sa ON sa.hot_snack_id = s.id
      LEFT JOIN allergens a ON a.id = sa.allergen_id
      WHERE s.id = ${id}
      GROUP BY s.id
    `;
    return rows[0] ? HotSnack.fromRow(rows[0]) : null;
  }

  // Is this snack on any weekday of the weekly menu?
  async isScheduled(id: Id): Promise<boolean> {
    const [row] = await this.db<{ scheduled: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM scheduled_hot_snacks WHERE hot_snack_id = ${id}
      ) AS scheduled
    `;
    return row.scheduled;
  }

  async create(input: HotSnackInput): Promise<SaveHotSnackResult> {
    try {
      return await this.db.begin(async (tx): Promise<SaveHotSnackResult> => {
        if (await this.nameTaken(tx, input.name)) {
          return { ok: false, reason: "duplicate" };
        }
        const [snack] = await tx<{ id: number }[]>`
          INSERT INTO hot_snacks (name, description, price)
          VALUES (${input.name}, ${input.description}, ${input.price})
          RETURNING id
        `;
        await this.linkAllergens(tx, snack.id, input.allergenIds);
        return { ok: true, id: snack.id };
      });
    } catch (e) {
      if (code(e) === "23503") return { ok: false, reason: "unknown_allergen" };
      if (code(e) === "23505") return { ok: false, reason: "duplicate" };
      throw e;
    }
  }

  async update(id: Id, input: HotSnackInput): Promise<SaveHotSnackResult> {
    try {
      return await this.db.begin(async (tx): Promise<SaveHotSnackResult> => {
        const exists = await tx`SELECT 1 FROM hot_snacks WHERE id = ${id}`;
        if (exists.length === 0) return { ok: false, reason: "not_found" };

        // Ignore the snack being edited, so saving without renaming isn't a duplicate
        if (await this.nameTaken(tx, input.name, id)) {
          return { ok: false, reason: "duplicate" };
        }

        await tx`
          UPDATE hot_snacks
          SET name = ${input.name}, description = ${input.description},
              price = ${input.price}, updated_at = now()
          WHERE id = ${id}
        `;
        await tx`DELETE FROM hot_snack_allergens WHERE hot_snack_id = ${id}`;
        await this.linkAllergens(tx, id, input.allergenIds);
        return { ok: true, id };
      });
    } catch (e) {
      if (code(e) === "23503") return { ok: false, reason: "unknown_allergen" };
      if (code(e) === "23505") return { ok: false, reason: "duplicate" };
      throw e;
    }
  }

  async delete(id: Id): Promise<DeleteHotSnackResult> {
    // ON DELETE CASCADE also removes this snack's schedule entries and allergen links
    const rows = await this.db`DELETE FROM hot_snacks WHERE id = ${id} RETURNING id`;
    return rows.length > 0 ? { ok: true } : { ok: false, reason: "not_found" };
  }

  private async nameTaken(
    tx: postgres.TransactionSql,
    name: string,
    excludeId?: number
  ): Promise<boolean> {
    const rows =
      excludeId === undefined
        ? await tx`SELECT 1 FROM hot_snacks WHERE lower(name) = lower(${name}) LIMIT 1`
        : await tx`
            SELECT 1 FROM hot_snacks
            WHERE lower(name) = lower(${name}) AND id <> ${excludeId}
            LIMIT 1
          `;
    return rows.length > 0;
  }

  private async linkAllergens(tx: postgres.TransactionSql, snackId: number, allergenIds: number[]) {
    if (allergenIds.length === 0) return;
    const rows = allergenIds.map((allergen_id) => ({ hot_snack_id: snackId, allergen_id }));
    await tx`INSERT INTO hot_snack_allergens ${tx(rows, "hot_snack_id", "allergen_id")}`;
  }
}