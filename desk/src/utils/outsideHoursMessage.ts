type LocalizedDateFormatter = (date: string, format: string) => string;

const dateFormats = {
  next_working_daytime: "D MMMM YYYY، HH:mm",
  next_working_day: "dddd، D MMM",
  next_working_date: "D MMM",
  expected_response: "HH:mm، dddd، D MMM",
} as const;

/** Resolve date placeholders in the server-rendered outside-hours message. */
export function formatOutsideHoursMessage(
  message: string | null | undefined,
  responseBy: string | null | undefined,
  formatDate: LocalizedDateFormatter
): string {
  if (!message) return "";

  return message.replace(
    /__HELPDESK_LOCALIZED_DATE:(next_working_daytime|next_working_day|next_working_date|expected_response)__/g,
    (_marker, key: keyof typeof dateFormats) =>
      responseBy ? formatDate(responseBy, dateFormats[key]) : ""
  );
}
