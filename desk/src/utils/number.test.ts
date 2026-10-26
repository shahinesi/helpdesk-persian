import assert from "node:assert/strict";
import test from "node:test";
import "dayjs/esm/locale/fa.js";
import { dayjs } from "frappe-ui";
import { formatLocalizedDigits, formatLocalizedNumber } from "./number";

test("localized dynamic SLA digits follow the active display locale", () => {
  const previousLocale = dayjs.locale();

  try {
    dayjs.locale("fa");
    assert.equal(
      formatLocalizedDigits("Resolution due in 3h 15m (50%)"),
      "Resolution due in ۳h ۱۵m (۵۰٪)"
    );
    assert.equal(formatLocalizedNumber(1250), "۱٬۲۵۰");

    dayjs.locale("en");
    assert.equal(
      formatLocalizedDigits("Resolution due in 3h 15m (50%)"),
      "Resolution due in 3h 15m (50%)"
    );
    assert.equal(formatLocalizedNumber(1250), "1250");
  } finally {
    dayjs.locale(previousLocale);
  }
});
