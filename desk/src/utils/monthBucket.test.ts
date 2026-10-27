import assert from "node:assert/strict";
import test from "node:test";
import { formatLocalizedMonthBucket } from "./monthBucket.ts";

test("Persian Gregorian month buckets show the Jalali date span", () => {
  const label = formatLocalizedMonthBucket("2026-03-15", "fa-IR");

  assert.match(label, /اسفند/);
  assert.match(label, /فروردین/);
  assert.match(label, /1404|1405/);
  assert.doesNotMatch(label, /\bMar\b|\b2026\b/);
});

test("English month buckets preserve Gregorian month and digits", () => {
  assert.equal(formatLocalizedMonthBucket("2026-03-15", "en"), "Mar 2026");
});

test("Persian labels keep leap Gregorian month boundaries accurate", () => {
  const label = formatLocalizedMonthBucket("2024-02-15", "fa");

  assert.match(label, /بهمن/);
  assert.match(label, /اسفند/);
  assert.match(label, /1402/);
  assert.doesNotMatch(label, /[۰-۹٠-٩]/);
});

test("date-only month buckets remain stable across Tehran midnight", () => {
  const beforeMidnight = new Date("2026-03-20T20:29:59.000Z");
  const afterMidnight = new Date("2026-03-20T20:30:00.000Z");
  const localDates = [beforeMidnight, afterMidnight].map((instant) =>
    new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tehran",
    }).format(instant)
  );

  const labels = localDates.map((localDate) =>
    formatLocalizedMonthBucket(localDate, "fa-IR")
  );

  assert.equal(localDates[0], "2026-03-20");
  assert.equal(localDates[1], "2026-03-21");
  assert.equal(labels[0], labels[1]);
  assert.match(labels[0], /اسفند/);
  assert.match(labels[0], /فروردین/);
});

test("invalid dates do not produce chart labels", () => {
  assert.equal(formatLocalizedMonthBucket("2026-02-30", "fa-IR"), "");
  assert.equal(formatLocalizedMonthBucket("2026-13-01", "en"), "");
});
