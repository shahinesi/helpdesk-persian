import { dayjs } from "frappe-ui";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { formatLocaleNumber } from "frappe-ui/localization";

export function formatLocalizedDigits(value: string | number) {
  return dayjs.locale().split("-")[0] === "fa"
    ? digitsEnToFa(String(value))
    : String(value);
}

export function formatLocalizedNumber(
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = {}
) {
  if (value === null || value === undefined || Number.isNaN(value)) return "";

  const locale = dayjs.locale().toLowerCase().replace("_", "-");
  const language = locale.split("-")[0];
  if (language === "en" && Object.keys(options).length === 0) {
    return String(value);
  }
  return formatLocaleNumber(value, options);
}
