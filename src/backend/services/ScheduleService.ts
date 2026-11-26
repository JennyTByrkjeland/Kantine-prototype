import "server-only";
import type postgres from "postgres";
import { ScheduleEntry, type ScheduleEntryRow } from "@/src/backend/models/ScheduleEntry";
import type { Id } from "@/src/backend/lib/schemas";

export type AddScheduleResult =
  | { ok: true; entry: ScheduleEntry }
  | { ok: false; reason: "item_not_found" | "duplicate" };
export type MoveScheduleResult =
  | { ok: true; entry: ScheduleEntry }
  | { ok: false; reason: "not_found" | "duplicate" };
export type RemoveScheduleResult = { ok: true } | { ok: false; reason: "not_found" };
export type ClearCounts = { dishes: number; snacks: number };

const code = (e: unknown) => (e as { code?: string }).code;

export class ScheduleService {
  constructor(private readonly db: postgres.Sql) {}

  // ---------- Planner view ----------

  async listAll() {
    const dishes = await this.db<ScheduleEntryRow[]>`
      SELECT sd.id AS "scheduledId", d.id AS "itemId", d.name, sd.weekday
      FROM scheduled_dishes sd
      JOIN dishes d ON d.id = sd.dish_id
      ORDER BY sd.weekday, d.name
    `;
    const snacks = await this.db<ScheduleEntryRow[]>`
      SELECT ss.id AS "scheduledId", s.id AS "itemId", s.name, ss.weekday
      FROM scheduled_hot_snacks ss
      JOIN hot_snacks s ON s.id = ss.hot_snack_id
      ORDER BY ss.weekday, s.name
    `;
    return {
      dishes: dishes.map((r) => ScheduleEntry.fromRow(r)),
      snacks: snacks.map((r) => ScheduleEntry.fromRow(r)),
    };
  }

  // ---------- Clear the whole week ----------

  // How many entries a clear would remove
  async count(): Promise<ClearCounts> {
    const [row] = await this.db<ClearCounts[]>`
      SELECT (SELECT count(*) FROM scheduled_dishes)::int     AS dishes,
             (SELECT count(*) FROM scheduled_hot_snacks)::int AS snacks
    `;
    return row;
  }

  // Removes schedule rows only; the dish and snack libraries are untouched
  async clear(): Promise<ClearCounts> {
    return this.db.begin(async (tx) => {
      // Deliberately no WHERE: clearing the whole schedule is the point
      const dishes = await tx`DELETE FROM scheduled_dishes`;
      const snacks = await tx`DELETE FROM scheduled_hot_snacks`;
      return { dishes: dishes.count, snacks: snacks.count };
    });
  }

  // ---------- Dishes ----------

  async addDish(dishId: Id, weekday: number): Promise<AddScheduleResult> {
    try {
      const [row] = await this.db<{ id: number }[]>`
        INSERT INTO scheduled_dishes (dish_id, weekday)
        VALUES (${dishId}, ${weekday})
        RETURNING id
      `;
      return { ok: true, entry: (await this.findDishEntry(row.id))! };
    } catch (e) {
      if (code(e) === "23503") return { ok: false, reason: "item_not_found" };
      if (code(e) === "23505") return { ok: false, reason: "duplicate" };
      throw e;
    }
  }

  async moveDish(scheduledId: Id, weekday: number): Promise<MoveScheduleResult> {
    try {
      const rows = await this.db`
        UPDATE scheduled_dishes SET weekday = ${weekday}
        WHERE id = ${scheduledId} RETURNING id
      `;
      if (rows.length === 0) return { ok: false, reason: "not_found" };
      return { ok: true, entry: (await this.findDishEntry(scheduledId))! };
    } catch (e) {
      if (code(e) === "23505") return { ok: false, reason: "duplicate" };
      throw e;
    }
  }

  async removeDish(scheduledId: Id): Promise<RemoveScheduleResult> {
    const rows = await this.db`DELETE FROM scheduled_dishes WHERE id = ${scheduledId} RETURNING id`;
    return rows.length > 0 ? { ok: true } : { ok: false, reason: "not_found" };
  }

  private async findDishEntry(scheduledId: number): Promise<ScheduleEntry | null> {
    const rows = await this.db<ScheduleEntryRow[]>`
      SELECT sd.id AS "scheduledId", d.id AS "itemId", d.name, sd.weekday
      FROM scheduled_dishes sd
      JOIN dishes d ON d.id = sd.dish_id
      WHERE sd.id = ${scheduledId}
    `;
    return rows[0] ? ScheduleEntry.fromRow(rows[0]) : null;
  }

  // ---------- Hot snacks ----------

  async addSnack(hotSnackId: Id, weekday: number): Promise<AddScheduleResult> {
    try {
      const [row] = await this.db<{ id: number }[]>`
        INSERT INTO scheduled_hot_snacks (hot_snack_id, weekday)
        VALUES (${hotSnackId}, ${weekday})
        RETURNING id
      `;
      return { ok: true, entry: (await this.findSnackEntry(row.id))! };
    } catch (e) {
      if (code(e) === "23503") return { ok: false, reason: "item_not_found" };
      if (code(e) === "23505") return { ok: false, reason: "duplicate" };
      throw e;
    }
  }

  async moveSnack(scheduledId: Id, weekday: number): Promise<MoveScheduleResult> {
    try {
      const rows = await this.db`
        UPDATE scheduled_hot_snacks SET weekday = ${weekday}
        WHERE id = ${scheduledId} RETURNING id
      `;
      if (rows.length === 0) return { ok: false, reason: "not_found" };
      return { ok: true, entry: (await this.findSnackEntry(scheduledId))! };
    } catch (e) {
      if (code(e) === "23505") return { ok: false, reason: "duplicate" };
      throw e;
    }
  }

  async removeSnack(scheduledId: Id): Promise<RemoveScheduleResult> {
    const rows = await this.db`DELETE FROM scheduled_hot_snacks WHERE id = ${scheduledId} RETURNING id`;
    return rows.length > 0 ? { ok: true } : { ok: false, reason: "not_found" };
  }

  private async findSnackEntry(scheduledId: number): Promise<ScheduleEntry | null> {
    const rows = await this.db<ScheduleEntryRow[]>`
      SELECT ss.id AS "scheduledId", s.id AS "itemId", s.name, ss.weekday
      FROM scheduled_hot_snacks ss
      JOIN hot_snacks s ON s.id = ss.hot_snack_id
      WHERE ss.id = ${scheduledId}
    `;
    return rows[0] ? ScheduleEntry.fromRow(rows[0]) : null;
  }
}