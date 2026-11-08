import { jalaaliMonthLength, toGregorian, toJalaali } from "jalaali-js";

const monthOffsets: Record<string, number> = {
  "last month": -1,
  "this month": 0,
  "next month": 1,
};

export function resolvePersianMonthTimespan(
  fieldtype: string,
  operator: string,
  value: unknown,
  locale: string,
  now: Date = new Date(),
  timeZone?: string
): { operator: "between"; value: [string, string] } | null {
  if (
    !["Date", "Datetime"].includes(fieldtype) ||
    operator.toLowerCase() !== "timespan" ||
    !/^fa(?:[-_]|$)/i.test(locale) ||
    typeof value !== "string"
  ) {
    return null;
  }

  const range = getPersianMonthTimespanRange(value, now, timeZone);
  return range ? { operator: "between", value: range } : null;
}

/** Resolve calendar-month filter presets to canonical Gregorian date bounds. */
export function getPersianMonthTimespanRange(
  timespan: string,
  now: Date = new Date(),
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
): [string, string] | null {
  const offset = monthOffsets[timespan.toLowerCase()];
  if (offset === undefined || Number.isNaN(now.getTime())) return null;

  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(now)
      .reduce<Record<string, number>>((result, part) => {
        if (["year", "month", "day"].includes(part.type)) {
          result[part.type] = Number(part.value);
        }
        return result;
      }, {});

    if (!parts.year || !parts.month || !parts.day) return null;

    const { jy, jm } = toJalaali(parts.year, parts.month, parts.day);
    const monthIndex = jy * 12 + jm - 1 + offset;
    const year = Math.floor(monthIndex / 12);
    const month = (((monthIndex % 12) + 12) % 12) + 1;
    const start = toGregorian(year, month, 1);
    const end = toGregorian(year, month, jalaaliMonthLength(year, month));

    return [
      formatGregorianDate(start.gy, start.gm, start.gd),
      formatGregorianDate(end.gy, end.gm, end.gd),
    ];
  } catch {
    return null;
  }
}

function formatGregorianDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}
