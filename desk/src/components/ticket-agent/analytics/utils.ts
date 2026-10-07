import { __ } from "@/translation";

/** Duration as at most two units, never decimal hours: "2h 30m", "45m"; sub-minute rounds up to "1m" */
export function formatSeconds(
  seconds: number | null | undefined
): string | null {
  if (seconds === null || seconds === undefined || seconds < 0) return null;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days) return hours ? __("{0}d {1}h", days, hours) : __("{0}d", days);
  if (hours)
    return minutes ? __("{0}h {1}m", hours, minutes) : __("{0}h", hours);
  if (minutes) return __("{0}m", minutes);
  return __("{0}m", 1);
}
