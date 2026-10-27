import assert from "node:assert/strict";
import test from "node:test";
import { formatPersianDateRange } from "./intlDate.ts";

test("Persian date ranges cross the Jalali new year using canonical digits", () => {
  const from = new Date(Date.UTC(2026, 2, 20, 12));
  const to = new Date(Date.UTC(2026, 2, 21, 12));
  const label = formatPersianDateRange(from, to);

  assert.match(label, /اسفند/);
  assert.match(label, /فروردین/);
  assert.match(label, /1404/);
  assert.match(label, /1405/);
  assert.doesNotMatch(label, /[۰-۹٠-٩]/);
});

test("Persian date ranges stay stable across Tehran midnight", () => {
  const from = new Date("2026-03-20T20:29:59.000Z");
  const to = new Date("2026-03-20T20:30:00.000Z");
  const firstTehranDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(from);
  const secondTehranDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(to);

  assert.equal(firstTehranDate, "2026-03-20");
  assert.equal(secondTehranDate, "2026-03-21");
  const toDisplayDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12));
  };
  const label = formatPersianDateRange(
    toDisplayDate(firstTehranDate),
    toDisplayDate(secondTehranDate)
  );

  assert.match(label, /اسفند/);
  assert.match(label, /فروردین/);
});

test("invalid Persian range endpoints return an empty label", () => {
  assert.equal(
    formatPersianDateRange(new Date(Number.NaN), new Date(Date.UTC(2026, 0, 1))),
    ""
  );
});
