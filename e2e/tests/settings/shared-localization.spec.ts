import { expect, test, uid, usePersona } from "../../helpers/fixtures";
import { openSettings } from "../../helpers/settings";

const HOLIDAYS = "HD Service Holiday List";

usePersona("admin");

test("the shared Jalali DatePicker keeps selected dates Gregorian in the form", async ({
  page,
  api,
}) => {
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
    const englishSettings = await openSettings(page, /Business Holidays/);
    await englishSettings.getByText(listName, { exact: true }).click();
    await englishSettings.getByRole("radio", { name: /Calendar/ }).click();
    const januaryEnglish = page
      .getByText("January, 2027", { exact: true })
      .locator("xpath=ancestor::div[contains(@class, 'w-max')][1]");
    await januaryEnglish
      .locator("div.cursor-pointer", { hasText: /^2$/ })
      .click();
    const editHoliday = page.getByRole("dialog", { name: "Edit Holiday" });
    await expect(editHoliday.locator("#holiday_date")).not.toHaveValue(/۱۴۰۵/);
    await expect(editHoliday.locator("#holiday_date")).toHaveValue(/2027/);
  } finally {
    await api.update("User", "Administrator", {
      language: administrator.language || "en",
    });
    if (await api.exists(HOLIDAYS, { name: listName })) {
      await api.delete(HOLIDAYS, listName);
    }
  }
});
