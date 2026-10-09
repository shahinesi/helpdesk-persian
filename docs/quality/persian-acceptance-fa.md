# معیار پذیرش فارسی و Build

## گیت‌های فعلی

- Clean install: `yarn install --frozen-lockfile --non-interactive` از صفر انجام شد.
- Patch gate: Patch پکیج و Patch سورس `frappe/ui` بررسی شد؛ اجرای دوم بدون اعمال مجدد موفق بود.
- Frontend build: `yarn build` با Frappe source pin ثابت و `sites/common_site_config.json` ایزوله موفق شد.
- نسخه‌ها: Node 20.20.0، Yarn 1.22.18، Vue 3.5.31، Vite 5.4.21، TypeScript 5.9.3، frappe-ui 1.0.0-rc.1.
- محدودیت: Full `bench build`, Python tests، E2E، runtime UI و Staging در این Build محلی اجرا نشده‌اند.

## هشدارهای Build

Build موفق، هشدارهای فعلی را نشان داد: دو Component auto-import هم‌نام (`TicketFeedback` و `TicketTimeline`)، داده قدیمی Browserslist و Chunkهای JavaScript بزرگ‌تر از 500KB. این هشدارها Build را متوقف نکردند؛ برای اصلاحشان باید علت و اثر جداگانه بررسی شود.

`yarn tsc --noEmit` در Checkout تمیز موفق نشد و خطاهای TypeScript متعددی در کد Helpdesk و سورس `frappe/ui` گزارش کرد؛ بنابراین گیت TypeScript فعلاً FAIL است، هرچند Vite build موفق بود. این اختلاف به‌تنهایی ثابت نمی‌کند خطاها از تغییرات این کار آمده‌اند؛ باید خطاها نسبت به Base مقایسه و جداگانه رفع شوند.

## وضعیت PR

آخرین بررسی PR شماره ۱: Open، Base=`develop`، Head=`feat/persian-setup-wizard`، ۲۵۲ فایل تغییر، ۱۰۰ Commit، `mergeable=MERGEABLE` و `mergeStateStatus=UNSTABLE`. در آخرین وضعیت مشاهده‌شده Linter، Playwright دو Shard، Python Unit Tests و Semantic Commits شکست خورده بودند. این وضعیت باید پس از Push مجدداً از GitHub خوانده شود.
