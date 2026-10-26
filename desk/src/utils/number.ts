function getDisplayLocale() {
  if (typeof document === "undefined") return "en";
  return document.documentElement.lang || "en";
}

export function formatLocalizedDigits(value: string | number) {
  // Retained name for existing callers; display text stays canonical and
  // Vazirmatn handles Persian glyph rendering.
  return String(value);
}

export function formatLocalizedNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
) {
  const locale = getDisplayLocale().toLowerCase().replace("_", "-");
  const language = locale.split("-")[0];
  if (language === "en" && Object.keys(options).length === 0) {
    return String(value);
  }
  return new Intl.NumberFormat(
    language === "fa" ? "fa-IR" : language === "en" ? "en-US" : locale,
    { ...options, numberingSystem: "latn" }
  ).format(value);
}

export function formatLocalizedRatingScale() {
  return [1, 2, 3, 4, 5].map((rating) => formatLocalizedNumber(rating));
}
