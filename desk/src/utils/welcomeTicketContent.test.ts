import assert from "node:assert/strict";
import test from "node:test";
import { localizeWelcomeTicketContent } from "./welcomeTicketContent.ts";

const sourceContent = `
<div style="font-family: 'Segoe UI', sans-serif;">
Hey Parisa 👋,<br>
This is a sample ticket we created to show you how Frappe Helpdesk works.
<b>Ticket activity area</b>
<img src="/assets/helpdesk/desk/ticketActivity.png">
<video src="/assets/helpdesk/desk/videos/mailVideo.mp4"></video>
<video src="/assets/helpdesk/desk/videos/commentVideo.mp4"></video>
<video src="/assets/helpdesk/desk/videos/sidebarVideo.mp4"></video>
Team Frappe
</div>`;

test("localizes the built-in welcome email for display and keeps its media", () => {
  const translated = new Map([
    ["Hey {0} 👋,", "سلام {0} 👋،"],
    [
      "This is a sample ticket we created to show you how Frappe Helpdesk works.",
      "این تیکت نمونه نحوهٔ کار هلپ‌دسک را نشان می‌دهد.",
    ],
    ["Ticket activity area", "بخش فعالیت تیکت"],
  ]);

  const displayContent = localizeWelcomeTicketContent(
    "Welcome to Helpdesk",
    sourceContent,
    translated
  );

  assert.match(displayContent, /سلام Parisa 👋،/);
  assert.match(displayContent, /این تیکت نمونه نحوهٔ کار هلپ‌دسک را نشان می‌دهد/);
  assert.match(displayContent, /Vazirmatn/);
  assert.match(displayContent, /font-feature-settings: 'ss01'/);
  assert.match(displayContent, /ticketActivity\.png/);
  assert.match(displayContent, /sidebarVideo\.mp4/);
});

test("translates the seeded generic greeting without leaking the word there", () => {
  const translated = localizeWelcomeTicketContent(
    "Welcome to Helpdesk",
    sourceContent.replace("Hey Parisa", "Hey there"),
    new Map([
      ["Hey {0} 👋,", "سلام {0} 👋،"],
      ["Hey there 👋,", "سلام 👋،"],
    ])
  );

  assert.match(translated, /سلام 👋،/);
  assert.doesNotMatch(translated, /Hey there|سلام there/);
});

test("leaves ordinary ticket email content unchanged", () => {
  assert.equal(
    localizeWelcomeTicketContent("Customer issue", sourceContent),
    sourceContent
  );
});

test("leaves edited welcome email content unchanged", () => {
  const edited = sourceContent.replace("Team Frappe", "Customer team");
  assert.equal(
    localizeWelcomeTicketContent("Welcome to Helpdesk", edited),
    edited
  );
});
