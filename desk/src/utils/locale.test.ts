import assert from "node:assert/strict";
import test from "node:test";
import { isPersianLocale, toIntlLocale } from "./locale.ts";

test("recognizes Persian locale IDs without changing other RTL languages", () => {
  for (const locale of ["fa", "fa-IR", "fa_IR", "FA-ir", "FA_IR"]) {
    assert.equal(isPersianLocale(locale), true, locale);
  }
  for (const locale of ["", "en", "en_US", "ar", "ar_IR"]) {
    assert.equal(isPersianLocale(locale), false, locale);
  }
  assert.equal(toIntlLocale("fa_IR"), "fa-IR");
  assert.equal(toIntlLocale("en_US"), "en-US");
});
