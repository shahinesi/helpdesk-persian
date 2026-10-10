# آزمون‌های سرتاسری Helpdesk

مشخصات Playwright برای جریان‌های اصلی کاربر؛ آزمون‌ها روی یک Frappe site واقعی اجرا می‌شوند.

## اجرای محلی

```sh
bench new-site e2e.localhost --admin-password admin --install-app helpdesk
cd apps/helpdesk && yarn install --ignore-scripts && npx playwright install chromium
yarn build   # سرور آزمون bundle ساخته‌شده را ارائه می‌کند

BASE_URL=http://localhost:8000 SITE_NAME=e2e.localhost yarn test:e2e
```

`SITE_NAME` مقدار `X-Frappe-Site-Name` را می‌فرستد و بنابراین نیازی به افزودن دامنه در `/etc/hosts` نیست. اگر رمز Administrator برابر `admin` نیست، مقدار `ADMIN_PASSWORD` را تنظیم کنید.

## ساختار

- `global.setup.ts` نقش‌های آزمون را می‌سازد و برای هرکدام نشست ورود ذخیره می‌کند.
- `helpers/` شامل REST client، نقش‌ها، fixtureها و factoryهای داده است.
- `tests/` آزمون‌ها را براساس صفحه گروه‌بندی می‌کند؛ تغییر یک صفحه معمولاً آزمون همان پوشه را اجرا می‌کند:
  - `tickets/list/`: صفحهٔ `Tickets.vue` و مسیرهای `/tickets` و `/my-tickets`
  - `tickets/agent/`: صفحهٔ `TicketAgent.vue` و مسیر `/tickets/:id`
  - `tickets/customer/`: صفحهٔ `TicketCustomer.vue` و مسیر `/my-tickets/:id`
  - `tickets/new/`: صفحهٔ `TicketNew.vue` و مسیرهای ثبت تیکت
  - `knowledge-base/`، `customer-management/` و `settings/`: آزمون مستقل برای هر صفحه یا زبانهٔ تنظیمات
  - قابلیتی که چند صفحه را در بر می‌گیرد، مانند `tickets/form-script.spec.ts`، در یک فایل آزمون نگهداری می‌شود.
  - آزمون‌های عمومی برنامه مانند ورود، راه‌اندازی اولیه، مجوزها و ناوبری در ریشهٔ `tests/` هستند.

هر نقشی که صفحه‌ای را استفاده می‌کند باید در آزمون آن صفحه پوشش داده شود. هر آزمون دادهٔ مستقل با نام یکتا می‌سازد.

- `fixtures/` فایل‌هایی را نگه می‌دارد که آزمون‌ها بارگذاری می‌کنند.

## نوشتن آزمون

- `test`، `expect` و `uid` را از `helpers/fixtures` وارد کنید؛ مستقیماً از `@playwright/test` وارد نکنید.
- در سطح فایل یا `describe` با `usePersona("agent")` نقش `page` را تعیین کنید. برای بازکردن نشست کاربر دوم از `pageAs` استفاده کنید.
- داده را از REST با `api`، `apiAs` یا fixture `ticket` بسازید؛ فقط از مسیر رابط کاربری مورد آزمون عبور کنید.
- پس از اقدام در UI، با `api` مقدار ذخیره‌شده را بررسی کنید؛ نمایش صفحه به‌تنهایی کافی نیست.
- برای هر رکورد از نام `uid()` استفاده کنید تا آزمون‌ها به هم یا به اجرای قبلی وابسته نباشند.
- هر تنظیم سراسری site را که تغییر می‌دهید بازگردانید. `snapshotSettings` این کار را برای HD Settings انجام می‌دهد.
- عنوان آزمون را جمله‌ای کوتاه و زمان حال بنویسید که رفتار را شرح دهد.
- باگی که آزمون آشکار می‌کند باید در همان PR رفع شود؛ اگر علت خارج از این مخزن است، آزمون را با `test.fixme` و توضیح یک‌خطی علت علامت بزنید.
- هر پوشه حداکثر ۱۴ فایل آزمون داشته باشد. اگر بزرگ‌تر شد، بخش را به پوشهٔ جداگانه تقسیم کنید.
