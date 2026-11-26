export type ScheduleEntryRow = {
  scheduledId: number;
  itemId: number;
  name: string;
  weekday: number;             // 1 = Monday ... 7 = Sunday
};

export class ScheduleEntry {
  constructor(
    readonly scheduledId: number,
    readonly itemId: number,
    readonly name: string,
    readonly weekday: number
  ) {}

  static fromRow(row: ScheduleEntryRow) {
    return new ScheduleEntry(row.scheduledId, row.itemId, row.name, row.weekday);
  }

  toJSON() {
    return {
      scheduledId: this.scheduledId,
      itemId: this.itemId,
      name: this.name,
      weekday: this.weekday,
    };
  }
}