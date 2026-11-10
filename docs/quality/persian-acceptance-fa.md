# معیار پذیرش فارسی و Build

## وضعیت تأییدشده — ۱۰ نوامبر ۲۰۲۶، پس از rollout زبان bootstrap

- **PR #1:** در GitHub بسته و Merge شده است. Helpdesk branch `feat/persian-setup-wizard` اکنون روی `f7edbbee5247e744e4e4c8cc5639d05b1e724262` است؛ این commit پس از Merge است و خودبه‌خود جزو PR #1 محسوب نمی‌شود.
- **Runtime:** Image `helpdesk-persian:runtime-fa-9b6505c2-ada73d92-f7edbbee5-039cf39f-ins4441e48-ui0f8d2a1-bootstrap-locale-fa` با شناسه `sha256:a10a746550e32d9599b23483d7d3940b9f3cf50f8789767187d92bd28a0dff1d` روی شش سرویس برنامهٔ `office-staging` اجرا شد. MariaDB و volume `office-staging_sites` حفظ شدند؛ Migration اجرا نشد و imageهای rollback حفظ شدند.
- **تأیید مرورگر:** در Playwright مستقل و timezone `Asia/Tehran`، مسیر Helpdesk در فارسی با `fa`/RTL، Vazirmatn و `ss01`، labelهای جلالی، رقم‌های ASCII در DOM و تاریخ Gregorian در درخواست فیلتر API تأیید شد. انگلیسی با `en`/LTR، InterVar و ماه‌های Gregorian تأیید شد. در هر دو حالت خطای صفحه ثبت نشد. این smoke، پوشش همهٔ مسیرها یا همهٔ widgetها نیست.
- **تست‌های واحد/کامپوننت:** Helpdesk localization suite برابر ۴۰/۴۰ و ERPNext JavaScript suite برابر ۲۱/۲۱ موفق شدند؛ شامل timezone تهران و مرز نیمه‌شب در تست‌های تاریخ Helpdesk.
- **Build و asset validation:** Build نهایی BuildKit موفق شد؛ catalog پنج اپ، رقم‌های canonical، ۶۶ asset mapping، چهار frontend asset build و hash formatter نسخه‌بندی‌شدهٔ Frappe UI تأیید شدند.
- **Source coverage:** router منبع ۲۸ رکورد مسیر و `desk/src` شامل ۳۳۰ فایل Vue دارد. جست‌وجوی ترکیبی Date API، formatter، picker، calendar، `moment()` و `dayjs()`، ۲۰۵ محل در ۳۹ فایل پیدا کرد (این تعداد مسیر مستقل تاریخ نیست). همهٔ ۲۸ Route و روابط فرزند/Shared Component هنوز کامل بازبینی نشده‌اند؛ پوشش جامع Source و دفتر تعیین‌تکلیف ۶۶ مسیر تاریخ **NOT COMPLETE** است.
- **تغییر اخیر:** اصلاح fallback خطای bootstrap بر اساس locale فعال، در commit `f7edbbee5247e744e4e4c8cc5639d05b1e724262` ثبت شد. زبان خطا با locale واقعی انتخاب می‌شود و مسیر خطا دیگر RTL را به‌اجبار اعمال نمی‌کند.
- **وضعیت Build/Deploy:** Build و Deploy تصویر بالا موفق‌اند. `yarn tsc --noEmit` از اجرای قبلی خطاهای متعدد در Helpdesk و `frappe/ui` داشته و در این نوبت دوباره اجرا نشده است؛ وضعیت فعلی این gate **NOT RUN (known prior failure)** است.

جزئیات زیر snapshot تاریخی ۱۰ اکتبر ۲۰۲۶ هستند و وضعیت زندهٔ فعلی را توصیف نمی‌کنند.

## گیت‌های فعلی — commit `3d597d68e1b89b700884441e65d02ccc6f2a294a`، ۱۰ اکتبر ۲۰۲۶

- Translation gate: ۲۲۸۳ ورودی فعال، بدون ترجمهٔ ناقص، fuzzy یا خطای placeholder؛ ۱۰۰٪.
- Lint: موفق.
- Server tests: موفق.
- Clean frontend build: نصب از cache خالی با `--frozen-lockfile`، بررسی pin منبع Frappe UI، اجرای idempotent Patch دوبار و `yarn build` در GitHub Actions موفق.
- Playwright: هر دو shard موفق. شکست قبلی `Opening Date` از fixture تاریخ UTC در برابر timezone سایت CI بود؛ fixture اکنون تاریخ جاری Backend را نگه می‌دارد و منطق فیلتر محصول تغییر نکرد. selector Gmail نیز با نام رسمی Provider هماهنگ است.
- نسخه‌های Pipeline: Node 20.20.0، Yarn 1.22.18، Vue 3.5.31، Vite 5.4.21، TypeScript 5.9.3، `frappe-ui` 1.0.0-rc.1.
- `yarn tsc --noEmit` در بررسی قبلی خطاهای متعدد در Helpdesk و `frappe/ui` داشت؛ این گیت همچنان FAIL/UNRESOLVED است.

## هشدارهای Build

Build موفق، هشدارهای فعلی را نشان داد: دو Component auto-import هم‌نام (`TicketFeedback` و `TicketTimeline`)، داده قدیمی Browserslist و Chunkهای JavaScript بزرگ‌تر از 500KB. این هشدارها Build را متوقف نکردند؛ برای اصلاحشان باید علت و اثر جداگانه بررسی شود.

`yarn tsc --noEmit` در Checkout تمیز موفق نشد و خطاهای TypeScript متعددی در کد Helpdesk و سورس `frappe/ui` گزارش کرد؛ بنابراین گیت TypeScript فعلاً FAIL است، هرچند Vite build موفق بود. این اختلاف به‌تنهایی ثابت نمی‌کند خطاها از تغییرات این کار آمده‌اند؛ باید خطاها نسبت به Base مقایسه و جداگانه رفع شوند.

## وضعیت PR و محیط

PR شماره ۱ باز است؛ Base=`develop`، Head=`feat/persian-setup-wizard`، اکنون SHA `59a719a7a991a6c9ba0bd7ddc706b7f123061629`. تمام گیت‌ها روی commit کد `3d597d68e1b89b700884441e65d02ccc6f2a294a` موفق بودند. اجرای دوباره روی تغییرات مستندات به‌دلیل Docker Hub rate limit برای image `mariadb:10.6` قبل از شروع Python و Playwright متوقف شد؛ Merge انجام نشده است.

Stack متصل به دامنه Image `helpdesk-persian:runtime-3d597d68` با digest `sha256:3a9a9823e5bc18e1c695c7340a50aca4380f1ea54e17acc4f41db622f52aebad` را اجرا می‌کند. Full Docker Build از archive دقیق همین commit موفق شد؛ Home، Login، API ping و assetهای CSS/فونت/JavaScript پاسخ HTTP 200 دادند. DB/Redis/Volumeها تغییر نکردند و Migration اجرا نشد. Backup تازه تهیه و خوانایی و checksum آن بررسی شد؛ Restore آزمایشی نشد. Rollback image قبلی حفظ شده است.

Runtime زندهٔ Settings پس از Deploy: **UNVERIFIED**. تست‌های Playwright در CI روی محیط ایزوله موفق‌اند؛ این نتیجه جایگزین بررسی زندهٔ Settings نیست. برای ورود به سایت زنده، credential معتبرِ حساب تست و profile مرورگر مستقل لازم است. `yarn tsc --noEmit` همچنان FAIL/UNRESOLVED است و بررسی Restore ایزوله و LTR/موبایل/Accessibility هم انجام نشده است.
