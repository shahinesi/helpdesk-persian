import assert from "node:assert/strict";
import test from "node:test";
import { formatOutsideHoursMessage } from "./outsideHoursMessage.ts";

test("outside-hours date placeholders use the shared display formatter", () => {
  const calls: Array<[string, string]> = [];
  const message = formatOutsideHoursMessage(
    "پاسخ بعدی در __HELPDESK_LOCALIZED_DATE:expected_response__ خواهد بود.",
    "2026-03-20 20:45:00",
    (date, format) => {
      calls.push([date, format]);
      return "۰۱:۱۵، شنبه، ۱ فروردین";
    }
  );

  assert.equal(message, "پاسخ بعدی در ۰۱:۱۵، شنبه، ۱ فروردین خواهد بود.");
  assert.deepEqual(calls, [
    ["2026-03-20 20:45:00", "HH:mm، dddd، D MMM"],
  ]);
});

test("English server-rendered dates and custom text remain unchanged", () => {
  const message = "Next response by Wednesday, 25 Mar (custom text).";
  assert.equal(
    formatOutsideHoursMessage(message, "2026-03-25 15:00:00", () => "unused"),
    message
  );
});

test("missing response dates do not leak internal localization markers", () => {
  assert.equal(
    formatOutsideHoursMessage(
      "Next response: __HELPDESK_LOCALIZED_DATE:next_working_day__",
      undefined,
      () => "unused"
    ),
    "Next response: "
  );
});
