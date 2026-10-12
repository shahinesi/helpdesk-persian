import { expect, test, uid, usePersona } from "../../helpers/fixtures";

const HOLIDAYS = "HD Service Holiday List";
const PERSIAN_ISO_DAY = "2027-01-01";

usePersona("admin");

test("the shared Jalali calendar keeps selected dates Gregorian in the form", async ({
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
    await settings.getByRole("button", { name: /تقویم|Calendar/ }).click();

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    const january = page.getByText("دی ۱۴۰۵", { exact: true }).locator(
      "xpath=ancestor::div[contains(@class, 'w-max')][1]"
    );
    await expect(january).toBeVisible();
    await january.locator("div.cursor-pointer", { hasText: /^۱۱$/ }).click();

    const addHoliday = page.getByRole("dialog", {
      name: /افزودن تعطیلی|Add Holiday/,
    });
    await addHoliday
      .getByPlaceholder(/تعطیلی ملی|National holiday/)
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
      .toContain(PERSIAN_ISO_DAY);
  } finally {
    await api.update("User", "Administrator", {
      language: administrator.language || "en",
    });
    if (await api.exists(HOLIDAYS, { name: listName })) {
      await api.delete(HOLIDAYS, listName);
    }
  }
});
