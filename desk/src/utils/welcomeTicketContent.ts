const WELCOME_TICKET_SUBJECT = "Welcome to Helpdesk";

/** Localizes only the built-in welcome email for display; source content stays unchanged. */
export function localizeWelcomeTicketContent(
  subject: string | null | undefined,
  content: string,
  translations: ReadonlyMap<string, string> = new Map()
): string {
  if (!isWelcomeTicketContent(subject, content)) return content;

  let localized = content;
  const greeting = localized.match(/Hey ([^<,\r\n]+) 👋,/);
  const greetingTemplate = translations.get("Hey {0} 👋,");
  if (greeting && greetingTemplate) {
    localized = localized.replace(
      greeting[0],
      greetingTemplate.replace("{0}", greeting[1])
    );
  }

  for (const [source, translated] of translations) {
    if (source !== "Hey {0} 👋," && translated !== source) {
      localized = localized.replaceAll(source, translated);
    }
  }

  const rtlLabel = translations.get("Ticket activity area");
  if (rtlLabel && rtlLabel !== "Ticket activity area") {
    localized = localized.replace(
      "font-family: 'Segoe UI', sans-serif;",
      "font-family: Vazirmatn, sans-serif; direction: rtl; text-align: right; font-feature-settings: 'ss01';"
    );
  }

  return localized;
}

function isWelcomeTicketContent(
  subject: string | null | undefined,
  content: string
): boolean {
  return (
    subject === WELCOME_TICKET_SUBJECT &&
    content.includes(
      "This is a sample ticket we created to show you how Frappe Helpdesk works."
    ) &&
    content.includes("ticketActivity.png") &&
    content.includes("mailVideo.mp4") &&
    content.includes("commentVideo.mp4") &&
    content.includes("sidebarVideo.mp4") &&
    content.includes("Team Frappe")
  );
}
