import { isPersianLocale } from "./locale.ts";

export function bootstrapErrorMessage(locale: string): string {
  return isPersianLocale(locale)
    ? "بارگذاری زبان برنامه ناموفق بود. صفحه را دوباره بارگذاری کنید."
    : "The application language could not be loaded. Please reload the page.";
}
