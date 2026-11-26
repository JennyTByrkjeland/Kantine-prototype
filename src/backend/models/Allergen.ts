// EDIT
export type AllergenRow = { id: number; name: string; description: string | null };

export class Allergen {
  constructor(
    readonly id: number,
    readonly name: string,
    readonly description: string | null
  ) {}

  static fromRow(row: AllergenRow) {
    return new Allergen(row.id, row.name, row.description);
  }

  toJSON() {
    return { id: this.id, name: this.name, description: this.description };
  }
}