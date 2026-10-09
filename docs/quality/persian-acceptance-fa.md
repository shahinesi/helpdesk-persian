# معیار پذیرش فارسی و Build

## گیت‌های فعلی — snapshot ۹ اکتبر ۲۰۲۶

- Translation gate: ۲۲۸۳ ورودی فعال، بدون ترجمهٔ ناقص، fuzzy یا خطای placeholder؛ ۱۰۰٪.
- Lint: روی commit `3a07099cfa1c90a55f52287c5b53f7b5dbfde3d0` موفق.
- Clean frontend build: نصب از cache خالی با `--frozen-lockfile`، بررسی pin منبع Frappe UI، اجرای idempotent Patch دوبار و `yarn build` در GitHub Actions موفق.
- Python unit tests: موفق؛ مرحلهٔ مستقل آپلود Codecov شکست خورد چون Codecov این مخزن Token می‌خواهد و Token در محیط Actions موجود نبود.
- Playwright: shard اول موفق؛ shard دوم یک تست غیر Settings در `ticket-properties.spec.ts` را به‌علت selector نادرست شکست داد. Snapshot مرورگر نشان داد نام دسترس‌پذیر trigger برابر `High Clear` است. selector اصلاح شده و منتظر اجرای CI مجدد است.
- نسخه‌های Pipeline: Node 20.20.0، Yarn 1.22.18، Vue 3.5.31، Vite 5.4.21، TypeScript 5.9.3، `frappe-ui` 1.0.0-rc.1.
- `yarn tsc --noEmit` در بررسی قبلی خطاهای متعدد در Helpdesk و `frappe/ui` داشت؛ این گیت همچنان FAIL/UNRESOLVED است.

## هشدارهای Build

Build موفق، هشدارهای فعلی را نشان داد: دو Component auto-import هم‌نام (`TicketFeedback` و `TicketTimeline`)، داده قدیمی Browserslist و Chunkهای JavaScript بزرگ‌تر از 500KB. این هشدارها Build را متوقف نکردند؛ برای اصلاحشان باید علت و اثر جداگانه بررسی شود.

`yarn tsc --noEmit` در Checkout تمیز موفق نشد و خطاهای TypeScript متعددی در کد Helpdesk و سورس `frappe/ui` گزارش کرد؛ بنابراین گیت TypeScript فعلاً FAIL است، هرچند Vite build موفق بود. این اختلاف به‌تنهایی ثابت نمی‌کند خطاها از تغییرات این کار آمده‌اند؛ باید خطاها نسبت به Base مقایسه و جداگانه رفع شوند.

## وضعیت PR و محیط

PR شماره ۱ باز و Mergeable است؛ Base=`develop`، Head=`feat/persian-setup-wizard` در SHA `3a07099cfa1c90a55f52287c5b53f7b5dbfde3d0`، ۲۶۰ فایل تغییر. Merge انجام نشده است.

Build روی سرور انجام نشده: checkout سرور روی `e0c78c32402c0789f8898db66d219c0c0290158d` است، از branch فعلی عقب است، `apps/frappe/ui` ندارد و فقط حدود ۹ GB فضای آزاد گزارش شده. تا فراهم‌شدن منبع درست و فضای کافی، ساخت یا Deploy روی سرور ایمن نیست.

Runtime Settings در مرورگر مستقل هنوز تأیید نشده؛ حساب آزمایشی مجاز برای ورود لازم است. CI E2E فعلی بخشی از Settings را در fixture پوشش می‌دهد اما جایگزین بازبینی بصری همهٔ ۱۵ بخش نیست.
