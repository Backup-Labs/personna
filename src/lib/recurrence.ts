export type RecurrenceRule = { frequency: "DAILY" | "WEEKLY"; interval?: number; weekdays?: number[]; until?: Date };

export function nextOccurrences(start: Date, rule: RecurrenceRule, count: number): Date[] {
  if (!Number.isInteger(count) || count < 0 || count > 366) throw new Error("Occurrence count must be between 0 and 366.");
  const interval = rule.interval ?? 1;
  if (!Number.isInteger(interval) || interval < 1 || interval > 52) throw new Error("Recurrence interval must be between 1 and 52.");
  const weekdays = new Set(rule.weekdays ?? [start.getDay()]);
  if ([...weekdays].some(day => !Number.isInteger(day) || day < 0 || day > 6)) throw new Error("Weekdays use values from 0 to 6.");
  const dates: Date[] = [];
  const candidate = new Date(start);
  for (let days = 0; days < 3660 && dates.length < count; days += 1) {
    if (days > 0) candidate.setDate(candidate.getDate() + 1);
    const matches = rule.frequency === "DAILY"
      ? days % interval === 0
      : Math.floor(days / 7) % interval === 0 && weekdays.has(candidate.getDay());
    if (matches && (!rule.until || candidate <= rule.until)) dates.push(new Date(candidate));
    if (rule.until && candidate > rule.until) break;
  }
  return dates;
}
