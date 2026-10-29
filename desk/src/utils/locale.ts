export function isPersianLocale(locale: string | null | undefined): boolean {
  return /^fa(?:[-_]|$)/i.test(locale || "");
}

export function toIntlLocale(locale: string | null | undefined): string {
  return (locale || "en-US").replace(/_/g, "-");
}
