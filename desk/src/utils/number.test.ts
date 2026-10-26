import assert from "node:assert/strict";
import test from "node:test";
import {
  formatLocalizedDigits,
  formatLocalizedNumber,
  formatLocalizedRatingScale,
} from "./number.ts";

function setDisplayLocale(locale: string) {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { documentElement: { lang: locale } },
  });
}

test("localized dynamic SLA digits follow the active display locale", () => {
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

  try {
    setDisplayLocale("fa-IR");
    assert.equal(
      formatLocalizedDigits("Resolution due in 3h 15m (50%)"),
      "Resolution due in ۳h ۱۵m (۵۰٪)"
    );
    assert.equal(formatLocalizedNumber(1250), "۱٬۲۵۰");

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
    assert.deepEqual(formatLocalizedRatingScale(), [
      "۱",
      "۲",
      "۳",
      "۴",
      "۵",
    ]);

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
