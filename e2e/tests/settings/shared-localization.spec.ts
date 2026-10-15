import { expect, test, uid, usePersona } from "../../helpers/fixtures";
import { emailOf } from "../../helpers/personas";
import { openSettings } from "../../helpers/settings";

const HOLIDAYS = "HD Service Holiday List";

usePersona("admin");

test("the onboarding banner does not call a missing localized number export", async ({
  pageAs,
}) => {
  // The banner is intentionally shown only to managers; Administrator is not
  // an agent manager in the seeded E2E site.
  const page = await pageAs("manager");
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("formatLocalizedNumber")) {
      runtimeErrors.push(message.text());
    }
  });
  const managerEmail = emailOf("manager");
  await page.addInitScript((user) =>
    localStorage.removeItem(`isOnboardingStepsCompletedhelpdesk${user}`),
    managerEmail
  );
  await page.goto("/helpdesk/tickets");
  await expect(page.getByText(/شروع کار|Getting started/).first()).toBeVisible();
  await expect.poll(() => runtimeErrors).toEqual([]);
});

test("the shared Jalali DatePicker keeps ISO dates and locale switching runtime-clean", async ({
  page,
  api,
}) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /Cannot read properties of undefined \(reading ['"]__['"]\)/.test(message.text())
    ) {
      runtimeErrors.push(message.text());
    }
  });

  const administrator = await api.get("User", "Administrator");
  const listName = `E2E Jalali ${uid()}`;

  await api.insert(HOLIDAYS, {
    holiday_list_name: listName,
    from_date: "2027-01-01",
    to_date: "2027-12-31",
    holidays: [],
  });

  try {
    await api.update("User", "Administrator", { language: "fa" });
    await page.goto("/helpdesk/tickets");
    await page.getByRole("button", { name: /^Helpdesk |^هلپ‌دسک/ }).click();
    await page.getByRole("menuitem", { name: /تنظیمات|Settings/ }).click();

    const settings = page.getByRole("dialog");
    await settings
      .getByRole("button", { name: /تعطیلات کاری|Business Holidays/ })
      .click();
    await settings.getByText(listName, { exact: true }).click();
    await settings.getByRole("radio", { name: /تقویم|Calendar/ }).click();

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    const january = page.getByText("دی ۱۴۰۵", { exact: true }).locator(
      "xpath=ancestor::div[contains(@class, 'w-max')][1]"
    );
    await expect(january).toBeVisible();
    await january.locator("div.cursor-pointer", { hasText: /^۱۱$/ }).click();

    const addHoliday = page.getByRole("dialog", {
      name: /افزودن تعطیلی|Add Holiday/,
    });
    const dateInput = addHoliday.locator("#holiday_date");
    await expect(dateInput).toHaveValue("۱۴۰۵/۱۰/۱۱");
    await dateInput.dblclick();
    await page.locator('[data-value="2027-01-02"]').click();
    await expect(dateInput).toHaveValue("۱۴۰۵/۱۰/۱۲");
    await addHoliday
      .getByPlaceholder(/تعطیلی رسمی|National holiday/)
      .fill("آزمون تقویم مشترک");
    await addHoliday
      .getByRole("button", { name: /افزودن تعطیلی|Add Holiday/ })
      .click();
    await settings.getByRole("button", { name: /ذخیره|Save/ }).click();

    await expect
      .poll(async () => {
        const holidayList = await api.get(HOLIDAYS, listName);
        return holidayList.holidays.map(
          (holiday: { holiday_date: string }) => holiday.holiday_date
        );
      })
      .toContain("2027-01-02");

    await settings
      .getByRole("button", { name: /تنظیمات برگزیده|Preferences/ })
      .click();
    await settings.getByRole("button", { name: "fa", exact: true }).click();
    const languageSearch = page.getByRole("combobox", { name: /انتخاب زبان/ });
    await languageSearch.fill("English");
    await page.getByRole("option", { name: "English", exact: true }).click();
    await settings.getByRole("button", { name: /ذخیره|Save/ }).click();

    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("html")).toHaveAttribute("lang", /en/);
    expect(runtimeErrors).toEqual([]);
    const englishSettings = await openSettings(page, /Business Holidays/);
    await englishSettings.getByText(listName, { exact: true }).click();
    await englishSettings.getByRole("radio", { name: /Calendar/ }).click();
    const januaryEnglish = page
      .getByText("January, 2027", { exact: true })
      .locator("xpath=ancestor::div[contains(@class, 'w-max')][1]");
    const januaryHoliday = januaryEnglish.locator(
      "div.cursor-pointer.bg-surface-yellow-2",
      { hasText: /^2$/ }
    );
    await expect(januaryHoliday).toHaveCount(1);
    await januaryHoliday.click();
    const editHoliday = page.getByRole("dialog", { name: "Edit Holiday" });
    await expect(editHoliday.locator("#holiday_date")).not.toHaveValue(/۱۴۰۵/);
    await expect(editHoliday.locator("#holiday_date")).toHaveValue(/2027/);
    await editHoliday.getByRole("button", { name: "Cancel" }).click();

    const englishPreferences = englishSettings;
    await englishPreferences
      .getByRole("button", { name: /Preferences/ })
      .click();
    await englishPreferences.getByRole("button", { name: "en", exact: true }).click();
    const englishLanguageSearch = page.getByRole("combobox", {
      name: /Select language/,
    });
    await englishLanguageSearch.fill("fa");
    const persianOption = page.getByRole("option", {
      name: "فارسی",
      exact: true,
    });
    await expect(persianOption).toBeVisible();
    await persianOption.click();
    await englishPreferences.getByRole("button", { name: /Save/ }).click();

    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("html")).toHaveAttribute("lang", /fa/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    expect(runtimeErrors).toEqual([]);
  } finally {
    await api.update("User", "Administrator", {
      language: administrator.language || "en",
    });
    if (await api.exists(HOLIDAYS, { name: listName })) {
      await api.delete(HOLIDAYS, listName);
    }
  }
});
