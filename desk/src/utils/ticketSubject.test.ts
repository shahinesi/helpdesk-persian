import assert from "node:assert/strict";
import test from "node:test";
import { localizeWelcomeTicketSubject } from "./ticketSubject.ts";

test("localizes the built-in Helpdesk welcome ticket title", () => {
  assert.equal(
    localizeWelcomeTicketSubject("Welcome to Helpdesk", "به هلپ‌دسک خوش آمدید"),
    "به هلپ‌دسک خوش آمدید"
  );
});

test("preserves user-authored ticket subjects", () => {
  assert.equal(
    localizeWelcomeTicketSubject("A customer reported a problem", "ترجمه"),
    "A customer reported a problem"
  );
});

test("preserves missing ticket subjects", () => {
  assert.equal(localizeWelcomeTicketSubject(undefined, "ترجمه"), undefined);
});
