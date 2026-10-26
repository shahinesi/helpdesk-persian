const PERSIAN_DATE_LOCALE = "fa-IR-u-ca-persian-nu-arabext";

/** Format Gregorian display dates as a Persian calendar range. */
export function formatPersianDateRange(from: Date, to: Date): string {
  if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(PERSIAN_DATE_LOCALE, {
    calendar: "persian",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).formatRange(from, to);
}
