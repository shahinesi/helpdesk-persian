# معیار پذیرش فارسی و Build

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

PR شماره ۱ باز است؛ Base=`develop`، Head=`feat/persian-setup-wizard` در SHA `3d597d68e1b89b700884441e65d02ccc6f2a294a`. همه Checkهای CI موفق‌اند و GitHub آخرین وضعیت را `CLEAN` و `MERGEABLE` گزارش کرده است. Merge انجام نشده است.

Stack متصل به دامنه Image `helpdesk-persian:runtime-3d597d68` با digest `sha256:3a9a9823e5bc18e1c695c7340a50aca4380f1ea54e17acc4f41db622f52aebad` را اجرا می‌کند. Full Docker Build از archive دقیق همین commit موفق شد؛ Home، Login، API ping و assetهای CSS/فونت/JavaScript پاسخ HTTP 200 دادند. DB/Redis/Volumeها تغییر نکردند و Migration اجرا نشد. Backup تازه تهیه و خوانایی و checksum آن بررسی شد؛ Restore آزمایشی نشد. Rollback image قبلی حفظ شده است.

Runtime زندهٔ Settings پس از Deploy: **UNVERIFIED**. تست‌های Playwright در CI روی محیط ایزوله موفق‌اند؛ این نتیجه جایگزین بررسی زندهٔ Settings نیست. برای ورود به سایت زنده، credential معتبرِ حساب تست و profile مرورگر مستقل لازم است. `yarn tsc --noEmit` همچنان FAIL/UNRESOLVED است و بررسی Restore ایزوله و LTR/موبایل/Accessibility هم انجام نشده است.
