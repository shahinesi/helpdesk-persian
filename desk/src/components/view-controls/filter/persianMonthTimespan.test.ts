import assert from "node:assert/strict";
import test from "node:test";
import {
  getPersianMonthTimespanRange,
  resolvePersianMonthTimespan,
} from "./persianMonthTimespan.ts";

test("Persian month presets resolve to Gregorian bounds in the user timezone", () => {
  const now = new Date("2026-11-09T08:30:00.000Z");

  assert.deepEqual(
    getPersianMonthTimespanRange("this month", now, "Asia/Tehran"),
    ["2026-10-23", "2026-11-21"]
  );
  assert.deepEqual(
    getPersianMonthTimespanRange("last month", now, "Asia/Tehran"),
    ["2026-09-23", "2026-10-22"]
  );
  assert.deepEqual(
    getPersianMonthTimespanRange("next month", now, "Asia/Tehran"),
    ["2026-11-22", "2026-12-21"]
  );
});

test("Persian month range follows the Asia/Tehran midnight and Nowruz boundary", () => {
  const beforeTehranMidnight = new Date("2026-03-20T20:29:59.999Z");
  const atTehranMidnight = new Date("2026-03-20T20:30:00.000Z");

  assert.deepEqual(
    getPersianMonthTimespanRange(
      "this month",
      beforeTehranMidnight,
      "Asia/Tehran"
    ),
    ["2026-02-20", "2026-03-20"]
  );
  assert.deepEqual(
    getPersianMonthTimespanRange("this month", atTehranMidnight, "Asia/Tehran"),
    ["2026-03-21", "2026-04-20"]
  );
});

test("non-month timespans and invalid dates remain unchanged", () => {
  assert.equal(
    getPersianMonthTimespanRange(
      "last 7 days",
      new Date("2026-11-09T08:30:00Z"),
      "Asia/Tehran"
    ),
    null
  );
  assert.equal(
    getPersianMonthTimespanRange(
      "this month",
      new Date(Number.NaN),
      "Asia/Tehran"
    ),
    null
  );
});

test("only Persian date and datetime month filters become Gregorian ranges", () => {
  const now = new Date("2026-11-09T08:30:00.000Z");

  assert.deepEqual(
    resolvePersianMonthTimespan(
      "Date",
      "timespan",
      "this month",
      "fa-IR",
      now,
      "Asia/Tehran"
    ),
    { operator: "between", value: ["2026-10-23", "2026-11-21"] }
  );
  assert.deepEqual(
    resolvePersianMonthTimespan(
      "Datetime",
      "Timespan",
      "this month",
      "fa",
      now,
      "Asia/Tehran"
    ),
    { operator: "between", value: ["2026-10-23", "2026-11-21"] }
  );
  assert.equal(
    resolvePersianMonthTimespan(
      "Date",
      "timespan",
      "this month",
      "en",
      now,
      "Asia/Tehran"
    ),
    null
  );
  assert.equal(
    resolvePersianMonthTimespan(
      "Date",
      "timespan",
      "last 7 days",
      "fa",
      now,
      "Asia/Tehran"
    ),
    null
  );
});
