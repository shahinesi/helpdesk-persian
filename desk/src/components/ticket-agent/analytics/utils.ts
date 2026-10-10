import { __ } from "@/translation";
import { formatLocalizedNumber } from "@/utils/number";

/** Duration as at most two units, never decimal hours: "2h 30m", "45m"; sub-minute rounds up to "1m" */
export function formatSeconds(
  seconds: number | null | undefined
): string | null {
  if (seconds === null || seconds === undefined || seconds < 0) return null;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const n = formatLocalizedNumber;
  if (days)
    return hours ? __("{0}d {1}h", n(days), n(hours)) : __("{0}d", n(days));
  if (hours)
    return minutes
      ? __("{0}h {1}m", n(hours), n(minutes))
      : __("{0}h", n(hours));
  if (minutes) return __("{0}m", n(minutes));
  return __("{0}m", n(1));
}
