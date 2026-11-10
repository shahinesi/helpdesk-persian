const WELCOME_TICKET_SUBJECT = "Welcome to Helpdesk";

/** Localize the built-in onboarding ticket title without translating user subjects. */
export function localizeWelcomeTicketSubject(
  subject: string | null | undefined,
  translatedWelcome: string
): string | null | undefined {
  return subject === WELCOME_TICKET_SUBJECT ? translatedWelcome : subject;
}
