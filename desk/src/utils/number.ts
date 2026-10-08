import { dayjs } from "frappe-ui";
import { digitsEnToFa } from "@persian-tools/persian-tools";

export function formatLocalizedDigits(value: string | number) {
  return dayjs.locale().split("-")[0] === "fa"
    ? digitsEnToFa(String(value))
    : String(value);
}

export function formatLocalizedNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
) {
  const locale = dayjs.locale().toLowerCase().replace("_", "-");
  const language = locale.split("-")[0];
  if (language === "en" && Object.keys(options).length === 0) {
    return String(value);
  }
  return new Intl.NumberFormat(
    language === "fa" ? "fa-IR" : language === "en" ? "en-US" : locale,
    options
  ).format(value);
}
