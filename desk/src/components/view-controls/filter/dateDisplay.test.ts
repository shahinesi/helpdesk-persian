import assert from "node:assert/strict";
import test from "node:test";
import { formatDateFilterDisplayValue } from "./dateDisplay.ts";

const formatter = (value: string, format: string) => `${format}:${value}`;

test("Persian date range chips format both Gregorian endpoints for display", () => {
  const formatted = formatDateFilterDisplayValue(
    ["2026-11-02", "2026-11-07"],
    "Date",
    "fa-IR",
    "DD-MM-YYYY",
    "DD-MM-YYYY HH:mm:ss",
    formatter
  );

  assert.equal(formatted, "DD-MM-YYYY:2026-11-02, DD-MM-YYYY:2026-11-07");
});

test("Persian datetime filters use the shared datetime display format", () => {
  assert.equal(
    formatDateFilterDisplayValue(
      "2026-11-02T09:15:00Z",
      "Datetime",
      "fa",
      "DD-MM-YYYY",
      "DD-MM-YYYY HH:mm:ss",
      formatter
    ),
    "DD-MM-YYYY HH:mm:ss:2026-11-02T09:15:00Z"
  );
});

test("English date filter summaries keep their existing Gregorian values", () => {
  assert.equal(
    formatDateFilterDisplayValue(
      ["2026-11-02", "2026-11-07"],
      "Date",
      "en",
      "DD-MM-YYYY",
      "DD-MM-YYYY HH:mm:ss",
      formatter
    ),
    null
  );
});

test("non-date and invalid filter values are not converted", () => {
  assert.equal(
    formatDateFilterDisplayValue(
      "Open",
      "Select",
      "fa",
      "DD-MM-YYYY",
      "DD-MM-YYYY HH:mm:ss",
      formatter
    ),
    null
  );
  assert.equal(
    formatDateFilterDisplayValue(
      "not-a-date",
      "Date",
      "fa",
      "DD-MM-YYYY",
      "DD-MM-YYYY HH:mm:ss",
      formatter
    ),
    "not-a-date"
  );
});
