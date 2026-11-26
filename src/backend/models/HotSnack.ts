// EDIT
import type { AllergenRef } from "@/src/backend/models/Dish";

export type HotSnackRow = {
  id: number;
  name: string;
  description: string | null;
  price: string;               // NUMERIC arrives as a string
  allergens: AllergenRef[];
};

export class HotSnack {
  constructor(
    readonly id: number,
    readonly name: string,
    readonly description: string | null,
    readonly price: string,
    readonly allergens: AllergenRef[]
  ) {}

  static fromRow(row: HotSnackRow) {
    return new HotSnack(row.id, row.name, row.description, row.price, row.allergens);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      allergens: this.allergens,
    };
  }
}