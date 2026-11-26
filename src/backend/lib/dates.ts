//EDIT - SYNTAXT AND COMMENTS
// Today's date as YYYY-MM-DD in the cafeteria's time zone, not the server's
export function getToday(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}


// Monday = 1 ... Sunday = 7, for a YYYY-MM-DD date
export function getWeekday(date: string): number {
  const d = new Date(`${date}T00:00:00Z`);
  return ((d.getUTCDay() + 6) % 7) + 1;
}