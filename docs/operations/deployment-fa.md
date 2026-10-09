# Runbook انتشار

## وضعیت فعلی

Stack مشاهده‌شده روی میزبان `carpet-erp` با Compose project به‌نام `helpdesk-persian-test` اجرا می‌شود. سرویس‌های frontend، backend، workerها و scheduler اکنون از Image `helpdesk-persian:runtime-b978318cd` با شناسه `sha256:8a4ed272e5f8661bb270ed6b5930ed5fab692d385dc2d67abd01bcb1c9a3066d` استفاده می‌کنند. همین Stack برای دامنه `helpdesk.ircarpet-r.com` در Traefik route دارد؛ بنابراین نام `test` به‌تنهایی ثابت نمی‌کند داده‌ها آزمایشی‌اند.

در ۹ اکتبر ۲۰۲۶ نسخه `b978318cd83e249ba24d7702dd1be862a1596345` به همین Stack منتشر شد؛ به‌دلیل route عمومی، آن را انتشار روی محیط متصل به دامنه در نظر بگیر، نه Staging ایزوله. فقط شش سرویس برنامه بازسازی شدند؛ دیتابیس، Redis و Volumeها دست‌نخورده ماندند و Migration اجرا نشد. قبل از تغییر Backup دیتابیس، فایل‌های public/private و تنظیمات سایت تهیه شد. فشرده‌سازی DB، فهرست TARها و JSON تنظیمات اعتبارسنجی شدند؛ Restore آزمایشی انجام نشده است. شناسه، هش فایل‌ها و شواهد در manifest روی سرور ثبت شده‌اند.

در snapshot ساعت ۱۹:۵۲ UTC شاخه `feat/persian-setup-wizard` روی SHA `57446ad5d4e78cae713b2b2edb48927b2a3b9828` بود و سرور هنوز SHA `b978318cd83e249ba24d7702dd1be862a1596345` را اجرا می‌کرد. سرور HTTP 200 بود. برای `57446ad5`، Persian Clean Frontend Build، Lint و Server Tests موفق شدند. در Playwright، selector آزمون Settings به‌خاطر تغییر نام رسمی `GMail` به `Gmail` شکست خورد و در اجرای بعدی اصلاح‌شده shard اول موفق شد. شکست Opening Date از fixture آزمون بود: تاریخ ساختگی با UTC تولید می‌شد، اما سایت CI در timezone خودش وارد روز بعد شده بود. fixture اصلاح شده تا تاریخ جاری تیکت از Backend حفظ شود؛ CI این اصلاح هنوز باید تأییدش کند.

برای نامزد `57446ad5` هنوز image ساخته یا Deploy نشده است. تغییرات این commitها محدود به نمایش نام رسمی ارائه‌دهنده ایمیل و عبور جهت `dir` از wrapper فیلد دامنه‌اند؛ Backend، API، migration، دیتابیس، تنظیمات سایت و Volumeها تغییر نکرده‌اند. Backup تازهٔ پیش از انتشار در `docs/operations/recovery-manifest-2026-10-09.md` ثبت و archiveها از نظر gzip/tar/JSON و SHA-256 اعتبارسنجی شده‌اند؛ Restore ایزوله نشده است. فضای آزاد میزبان 6.4 GB است و پاک‌سازی image یا volume انجام نشود.

## انتشار مجاز پس از پذیرش

1. SHA و Image digest نامزد انتشار را ثبت کن.
2. از دیتابیس، فایل‌های Public/Private و تنظیمات سایت Backup بگیر و checksum، خوانایی و در صورت امکان Restore ایزوله را تأیید کن.
3. اختلاف Compose و Volumeها را ثبت کن؛ سرویس دیتابیس را بازسازی یا Volume را حذف نکن.
4. Image را با برچسب SHA بساز؛ از `latest` استفاده نکن.
5. پیش از Deploy به دامنه عمومی، نقش و جداسازی محیط را اثبات کن؛ صرفاً `test` بودن نام Stack کافی نیست.
6. Persian/RTL، Login، تیکت‌ها، فایل‌ها، API، Worker و لاگ‌ها را بررسی کن.
7. Production فقط بعد از پذیرش صریح نسخه و اثبات سازگاری Migration منتشر شود.

## وضعیت نامزد فعلی

نامزد فعلی `4547143bcb56898c84154e7c053d74832edddd6f` است. Clean Frontend Build، Lint، Server Tests و هر دو Playwright shard در GitHub Actions موفق شدند. Clean Frontend Build به‌تنهایی Full Docker Build نیست. Image جدید هنوز ساخته یا منتشر نشده است: میزبان `carpet-erp` فقط ۶٫۴ GB فضای آزاد دارد و ساخت Image کامل با imageهای ۵۱ GB و cache حجیم می‌تواند فضای سیستم را تمام کند؛ هیچ Image یا Volume پاک‌سازی نمی‌شود. Deploy قبلی از `b978318cd83e249ba24d7702dd1be862a1596345` با digest `sha256:8a4ed272e5f8661bb270ed6b5930ed5fab692d385dc2d67abd01bcb1c9a3066d` قابل بازگشت است؛ DB و Volumeها در آن انتشار تغییر نکرده بودند.
