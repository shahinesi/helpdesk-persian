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
