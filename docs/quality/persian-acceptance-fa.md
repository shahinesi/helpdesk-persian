# معیار پذیرش فارسی و Build

## گیت‌های فعلی — commit `b978318cd83e249ba24d7702dd1be862a1596345`، ۹ اکتبر ۲۰۲۶

- Translation gate: ۲۲۸۳ ورودی فعال، بدون ترجمهٔ ناقص، fuzzy یا خطای placeholder؛ ۱۰۰٪.
- Lint: موفق.
- Server tests: موفق.
- Clean frontend build: نصب از cache خالی با `--frozen-lockfile`، بررسی pin منبع Frappe UI، اجرای idempotent Patch دوبار و `yarn build` در GitHub Actions موفق.
- Playwright: shard اول موفق؛ shard دوم در `e2e/tests/tickets/list/filter-field-types.spec.ts:225` شکست خورد: ردیف مورد انتظار پس از اعمال فیلتر دیده نشد. این مورد خارج از Settings است و در این تغییر اصلاح نشده؛ CI کامل PASS نیست.
- نسخه‌های Pipeline: Node 20.20.0، Yarn 1.22.18، Vue 3.5.31، Vite 5.4.21، TypeScript 5.9.3، `frappe-ui` 1.0.0-rc.1.
- `yarn tsc --noEmit` در بررسی قبلی خطاهای متعدد در Helpdesk و `frappe/ui` داشت؛ این گیت همچنان FAIL/UNRESOLVED است.

## هشدارهای Build

Build موفق، هشدارهای فعلی را نشان داد: دو Component auto-import هم‌نام (`TicketFeedback` و `TicketTimeline`)، داده قدیمی Browserslist و Chunkهای JavaScript بزرگ‌تر از 500KB. این هشدارها Build را متوقف نکردند؛ برای اصلاحشان باید علت و اثر جداگانه بررسی شود.

`yarn tsc --noEmit` در Checkout تمیز موفق نشد و خطاهای TypeScript متعددی در کد Helpdesk و سورس `frappe/ui` گزارش کرد؛ بنابراین گیت TypeScript فعلاً FAIL است، هرچند Vite build موفق بود. این اختلاف به‌تنهایی ثابت نمی‌کند خطاها از تغییرات این کار آمده‌اند؛ باید خطاها نسبت به Base مقایسه و جداگانه رفع شوند.

## وضعیت PR و محیط

PR شماره ۱ باز است؛ Base=`develop`، Head=`feat/persian-setup-wizard` در SHA `b978318cd83e249ba24d7702dd1be862a1596345`. Merge انجام نشده است.

Image روی میزبان build و به stack متصل به دامنه Deploy شده است. شش سرویس برنامه با image `sha256:8a4ed272e5f8661bb270ed6b5930ed5fab692d385dc2d67abd01bcb1c9a3066d` بالا هستند، endpoint صفحهٔ Home HTTP 200 می‌دهد و هیچ Migration اجرا نشده است. قبل از Deploy از DB و فایل‌ها Backup گرفته شد؛ آرشیوها و checksumها اعتبارسنجی شدند ولی Restore آزمایشی نشد.

Runtime در مرورگر مستقل: همه ۱۵ بخش اصلی Settings قبلاً به‌صورت source/runtime مرور شدند، بدون ذخیره تنظیم عملیاتی. پس از Deploy، دو موردی که اصلاح شدند دوباره بررسی شدند: نام تیم در Rename dialog و نام SLA استاندارد در editor، هر دو فارسی و بدون امکان ذخیره ناخواسته هستند. این بررسی، تمام فرم‌های تو‌در‌تو، همه Providerها، موبایل، LTR، صفحه‌کلید و Accessibility را پوشش نمی‌دهد.
