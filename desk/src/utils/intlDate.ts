import { toJalaali } from "jalaali-js";

const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

export function getPersianMonthName(month: number): string {
  if (!Number.isInteger(month) || month < 1 || month > 12) return "";
  return PERSIAN_MONTHS[month - 1];
}

/** Format Gregorian instants as a Jalali date range, keeping digits canonical. */
export function formatPersianDateRange(from: Date, to: Date): string {
  if (
    !Number.isFinite(from.getTime()) ||
    !Number.isFinite(to.getTime()) ||
    from.getTime() > to.getTime()
  ) {
    return "";
  }

  const start = toJalaali(
    from.getUTCFullYear(),
    from.getUTCMonth() + 1,
    from.getUTCDate(),
  );
  const end = toJalaali(
    to.getUTCFullYear(),
    to.getUTCMonth() + 1,
    to.getUTCDate(),
  );
  return `${start.jd} ${getPersianMonthName(start.jm)} ${start.jy} تا ${end.jd} ${getPersianMonthName(end.jm)} ${end.jy}`;
}
