// EDIT
import "server-only";
import type postgres from "postgres";
import { Allergen, type AllergenRow } from "@/src/backend/models/Allergen";
import type { AllergenInput, Id } from "@/src/backend/lib/schemas";

export type CreateAllergenResult =
  | { ok: true; allergen: Allergen }
  | { ok: false; reason: "duplicate" };
export type UpdateAllergenResult =
  | { ok: true; allergen: Allergen }
  | { ok: false; reason: "not_found" | "duplicate" };
export type DeleteAllergenResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "in_use" };

const code = (e: unknown) => (e as { code?: string }).code;

export class AllergenService {
  constructor(private readonly db: postgres.Sql) {}

  async list(): Promise<Allergen[]> {
    const rows = await this.db<AllergenRow[]>`
      SELECT id, name, description FROM allergens ORDER BY name
    `;
    return rows.map((r) => Allergen.fromRow(r));
  }

  async create(input: AllergenInput): Promise<CreateAllergenResult> {
    const clash = await this.db`
      SELECT id FROM allergens WHERE lower(name) = lower(${input.name})
    `;
    if (clash.length > 0) return { ok: false, reason: "duplicate" };

    try {
      const [row] = await this.db<AllergenRow[]>`
        INSERT INTO allergens (name, description)
        VALUES (${input.name}, ${input.description})
        RETURNING id, name, description
      `;
      return { ok: true, allergen: Allergen.fromRow(row) };
    } catch (e) {
      if (code(e) === "23505") return { ok: false, reason: "duplicate" };
      throw e;
    }
  }

  async update(id: Id, input: AllergenInput): Promise<UpdateAllergenResult> {
    const clash = await this.db`
      SELECT id FROM allergens
      WHERE lower(name) = lower(${input.name}) AND id <> ${id}
    `;
    if (clash.length > 0) return { ok: false, reason: "duplicate" };

    try {
      const rows = await this.db<AllergenRow[]>`
        UPDATE allergens
        SET name = ${input.name}, description = ${input.description}
        WHERE id = ${id}
        RETURNING id, name, description
      `;
      return rows.length > 0
        ? { ok: true, allergen: Allergen.fromRow(rows[0]) }
        : { ok: false, reason: "not_found" };
    } catch (e) {
      if (code(e) === "23505") return { ok: false, reason: "duplicate" };
      throw e;
    }
  }

  async delete(id: Id): Promise<DeleteAllergenResult> {
    try {
      const rows = await this.db`DELETE FROM allergens WHERE id = ${id} RETURNING id`;
      return rows.length > 0 ? { ok: true } : { ok: false, reason: "not_found" };
    } catch (e) {
      if (code(e) === "23503") return { ok: false, reason: "in_use" };
      throw e;
    }
  }
}