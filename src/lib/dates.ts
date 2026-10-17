function dateParts(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  return { year: Number(parts.find(part => part.type === "year")?.value), month: Number(parts.find(part => part.type === "month")?.value), day: Number(parts.find(part => part.type === "day")?.value) };
}

function offsetAt(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(instant);
  const values = Object.fromEntries(parts.map(part => [part.type, Number(part.value)]));
  const zonedTimestamp = Date.UTC(values.year!, values.month! - 1, values.day!, values.hour!, values.minute!, values.second!);
  return zonedTimestamp - Math.floor(instant.getTime() / 1000) * 1000;
}

function fromZonedParts(year: number, month: number, day: number, timeZone: string): Date {
  const desiredUtc = Date.UTC(year, month - 1, day);
  let result = desiredUtc;
  for (let attempt = 0; attempt < 3; attempt += 1) result = desiredUtc - offsetAt(new Date(result), timeZone);
  return new Date(result);
}

function resolveLocalTime(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): Date {
  const calendarCheck = new Date(Date.UTC(year, month - 1, day));
  if (calendarCheck.getUTCFullYear() !== year || calendarCheck.getUTCMonth() + 1 !== month || calendarCheck.getUTCDate() !== day || hour < 0 || hour > 23 || minute < 0 || minute > 59) throw new Error("Invalid local date or time.");
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute);
  let result = desiredUtc;
  for (let attempt = 0; attempt < 3; attempt += 1) result = desiredUtc - offsetAt(new Date(result), timeZone);
  return new Date(result);
}

export function fromZonedLocalDate(value: string, timeZone: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error("Invalid date.");
  return resolveLocalTime(Number(match[1]), Number(match[2]), Number(match[3]), 0, 0, timeZone);
}

export function fromZonedLocalDateTime(value: string, timeZone: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error("Invalid local time.");
  return resolveLocalTime(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]), Number(match[5]), timeZone);
}

export function localDateKey(date: Date, timeZone: string): string {
  const { year, month, day } = dateParts(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function zonedDayRange(date: Date, timeZone: string): { start: Date; end: Date } {
  const parts = dateParts(date, timeZone);
  const next = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1));
  return { start: fromZonedParts(parts.year, parts.month, parts.day, timeZone), end: fromZonedParts(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), timeZone) };
}

export function zonedMonthStart(date: Date, timeZone: string): Date {
  const { year, month } = dateParts(date, timeZone);
  return fromZonedParts(year, month, 1, timeZone);
}

export function zonedWeekStart(date: Date, timeZone: string, weekStartsOn: 0 | 1): { start: string } {
  const { year, month, day } = dateParts(date, timeZone);
  const localCalendarDate = new Date(Date.UTC(year, month - 1, day));
  const daysBack = (localCalendarDate.getUTCDay() - weekStartsOn + 7) % 7;
  localCalendarDate.setUTCDate(localCalendarDate.getUTCDate() - daysBack);
  return { start: `${localCalendarDate.getUTCFullYear()}-${String(localCalendarDate.getUTCMonth() + 1).padStart(2, "0")}-${String(localCalendarDate.getUTCDate()).padStart(2, "0")}` };
}
