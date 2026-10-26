/**
 * Format a Gregorian month bucket for charts without changing its grouping.
 * Persian labels show the Jalali dates spanned by the Gregorian month, so the
 * chart does not misrepresent a backend aggregation as a Jalali month.
 */
export function formatLocalizedMonthBucket(
  value: string,
  locale: string
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return "";

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const monthStart = utcDate(year, month - 1, 1);
  const monthEnd = utcDate(year, month, 0);

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > utcDate(year, month, 0).getUTCDate()
  ) {
    return "";
  }

  if (locale.split("-")[0] === "fa") {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-arabext", {
      dateStyle: "medium",
      timeZone: "UTC",
    }).formatRange(monthStart, monthEnd);
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(monthStart);
}

function utcDate(year: number, monthIndex: number, day: number): Date {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, monthIndex, day);
  return date;
}
