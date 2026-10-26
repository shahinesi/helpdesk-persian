import { skipGettingStarted, test, expect } from "../helpers/fixtures";

test("Persian date range picker displays Jalali dates and sends Gregorian API values", async ({
  pageAs,
}) => {
  const page = await pageAs("persianAgent");
  await skipGettingStarted(page, "e2e-persian@example.com");
  await page.goto("/helpdesk/dashboard");

  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  await page.locator('.mb-4 [class*="min-w-48"]').click();
  await page.getByText("محدوده سفارشی", { exact: true }).click();

  const calendar = page.locator(".calendar-panel").first();
  await expect(calendar).toBeVisible();
  const expectedMonth = await page.evaluate(() =>
    new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-arabext", {
      month: "long",
      year: "numeric",
    }).format(new Date())
  );
  await expect(calendar).toContainText(expectedMonth);

  const dateCells = calendar.locator('[role="grid"] button:not([disabled])');
  await expect(dateCells.first()).toContainText(/[۰-۹]/);

  const request = page.waitForRequest((candidate) =>
    candidate.url().includes("get_dashboard_data")
  );
  await dateCells.nth(10).click();
  await dateCells.nth(12).click();

  const apiRequest = await request;
  const requestData = decodeURIComponent(
    apiRequest.url() + " " + (apiRequest.postData() || "")
  );
  expect(requestData).toMatch(/20\d{2}-\d{2}-\d{2}/);
  expect(requestData).not.toMatch(/[۰-۹٠-٩]/);
});

test("English calendar keeps Gregorian month names and left-to-right layout", async ({
  pageAs,
}) => {
  const page = await pageAs("agent");
  await page.goto("/helpdesk/dashboard");

  await expect(page.getByText("0%", { exact: true })).toBeVisible();
  await expect(page.getByText("0/5", { exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.locator('.mb-4 [class*="min-w-48"]').click();
  await page.getByRole("menuitem").last().click();

  const calendar = page.locator(".calendar-panel").first();
  await expect(calendar).toBeVisible();
  const expectedMonth = await page.evaluate(() =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(new Date())
  );
  await expect(calendar).toContainText(expectedMonth);
  await expect(calendar.locator('[role="grid"] button').first()).toContainText(
    /[0-9]/
  );
});

test("Persian ticket details keep timeline dates and digits localized", async ({
  pageAs,
  ticket,
}) => {
  const page = await pageAs("persianAgent");
  await skipGettingStarted(page, "e2e-persian@example.com");
  await page.goto(`/helpdesk/tickets/${ticket.name}`);

  await expect(
    page.getByText(ticket.subject, { exact: true }).first()
  ).toBeVisible();
  const body = page.locator("body");
  await expect(body).toContainText(/[۰-۹]/);
  await expect(body).not.toContainText(
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/
  );

  const fontFamily = await body.evaluate((element) =>
    getComputedStyle(element).fontFamily.toLowerCase()
  );
  expect(fontFamily).toContain("vazirmatn");
});

test("Persian calendar month and year selection honors leap Esfand", async ({
  pageAs,
}) => {
  const page = await pageAs("persianAgent");
  await skipGettingStarted(page, "e2e-persian@example.com");
  await page.goto("/helpdesk/dashboard");

  await page.locator('.mb-4 [class*="min-w-48"]').click();
  await page.getByText("محدوده سفارشی", { exact: true }).click();
  const calendar = page.locator(".calendar-panel").first();
  const currentMonth = await page.evaluate(() =>
    new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-arabext", {
      month: "long",
      year: "numeric",
    }).format(new Date())
  );
  await calendar.getByRole("button").filter({ hasText: currentMonth }).click();

  const yearList = calendar.locator('[role="listbox"]').first();
  const monthList = calendar.locator('[role="listbox"]').last();
  await yearList.getByText("۱۴۰۳", { exact: true }).click();
  await monthList.getByText("اسفند", { exact: true }).click();

  const inMonthDays = calendar.locator(
    '[role="grid"] [role="gridcell"]:not([data-outside-view])'
  );
  await expect(inMonthDays.filter({ hasText: /^۳۰$/ })).toHaveCount(1);

  await calendar.getByRole("button").filter({ hasText: "اسفند" }).click();
  await calendar
    .locator('[role="listbox"]')
    .first()
    .getByText("۱۴۰۴", { exact: true })
    .click();
  await calendar
    .locator('[role="listbox"]')
    .last()
    .getByText("اسفند", { exact: true })
    .click();
  await expect(inMonthDays.filter({ hasText: /^۳۰$/ })).toHaveCount(0);
  await expect(inMonthDays.filter({ hasText: /^۲۹$/ })).toHaveCount(1);
});

test("Persian dashboard metrics localize percentages and decimals", async ({
  pageAs,
}) => {
  const page = await pageAs("persianAgent");
  await page.goto("/helpdesk/dashboard");

  const percentage = page.getByText("۰٪", { exact: true });
  const rating = page.getByText("۰/۵", { exact: true });
  await expect(percentage).toBeVisible();
  await expect(rating).toBeVisible();

  const fontFamily = await percentage.evaluate((element) =>
    getComputedStyle(element).fontFamily.toLowerCase()
  );
  expect(fontFamily).toContain("vazirmatn");
});

test("Persian ticket list localizes the record count while English keeps ASCII digits", async ({
  pageAs,
}) => {
  const persianPage = await pageAs("persianAgent");
  await skipGettingStarted(persianPage, "e2e-persian@example.com");
  await persianPage.goto("/helpdesk/tickets");
  await expect(persianPage.getByTestId("list-footer-count")).toContainText(/[۰-۹]+ از [۰-۹]+/);

  const englishPage = await pageAs("agent");
  await englishPage.goto("/helpdesk/tickets");
  await expect(englishPage.getByTestId("list-footer-count")).toContainText(/[0-9]+ of [0-9]+/);
});
