type DateDisplayFormatter = (value: string, format: string) => string;

const CANONICAL_DATE_VALUE = /^\d{4}-\d{2}-\d{2}$/;
const CANONICAL_DATETIME_VALUE =
  /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:?\d{2})?$/;

export function formatDateFilterDisplayValue(
  value: unknown,
  fieldtype: string,
  locale: string,
  dateFormat: string,
  datetimeFormat: string,
  formatDate: DateDisplayFormatter
): string | null {
  if (
    !["Date", "Datetime"].includes(fieldtype) ||
    locale.split(/[-_]/)[0] !== "fa"
  ) {
    return null;
  }

  const format = fieldtype === "Datetime" ? datetimeFormat : dateFormat;
  const formatOne = (date: unknown) => {
    const raw = String(date ?? "");
    const isCanonicalDate = CANONICAL_DATE_VALUE.test(raw);
    const isCanonicalDatetime = CANONICAL_DATETIME_VALUE.test(raw);
    const canFormat =
      fieldtype === "Date"
        ? isCanonicalDate
        : isCanonicalDate || isCanonicalDatetime;
    return canFormat ? formatDate(raw, format) : raw;
  };

  return Array.isArray(value)
    ? value.map(formatOne).join(", ")
    : formatOne(value);
}
