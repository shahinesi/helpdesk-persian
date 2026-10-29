import assert from "node:assert/strict";
import test from "node:test";
import {
  formatLocalizedDigits,
  formatLocalizedNumber,
  formatLocalizedRatingScale,
  normalizeNumericInput,
} from "./number.ts";

function setDisplayLocale(locale: string) {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { documentElement: { lang: locale } },
  });
}

test("display number strings stay canonical in Persian and English locales", () => {
  const previousDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document"
  );

  try {
    setDisplayLocale("fa-IR");
    assert.equal(
      formatLocalizedDigits("Resolution due in 3h 15m (50%)"),
      "Resolution due in 3h 15m (50%)"
    );
    assert.equal(formatLocalizedNumber(1250), "1,250");

    setDisplayLocale("en");
    assert.equal(
      formatLocalizedDigits("Resolution due in 3h 15m (50%)"),
      "Resolution due in 3h 15m (50%)"
    );
    assert.equal(formatLocalizedNumber(1250), "1250");
  } finally {
    if (previousDocument) {
      Object.defineProperty(globalThis, "document", previousDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  }
});

test("chart rating labels use the active display locale", () => {
  const previousDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document"
  );

  try {
    setDisplayLocale("fa-IR");
    assert.deepEqual(formatLocalizedRatingScale(), ["1", "2", "3", "4", "5"]);

    setDisplayLocale("en");
    assert.deepEqual(formatLocalizedRatingScale(), ["1", "2", "3", "4", "5"]);
  } finally {
    if (previousDocument) {
      Object.defineProperty(globalThis, "document", previousDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  }
});

test("numeric input normalization accepts Persian and Arabic numerals", () => {
  assert.equal(normalizeNumericInput("۱٬۲۳۴٫۵"), "1234.5");
  assert.equal(normalizeNumericInput("١٬٢٣٤٫٥"), "1234.5");
  assert.equal(normalizeNumericInput("1,234.5"), "1234.5");
});
