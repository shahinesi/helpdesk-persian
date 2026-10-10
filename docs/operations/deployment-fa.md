# Runbook انتشار

## وضعیت فعلی

Stack مشاهده‌شده روی میزبان `carpet-erp` با Compose project به‌نام `helpdesk-persian-test` اجرا می‌شود. سرویس‌های frontend، backend، workerها، scheduler و websocket اکنون از Image `helpdesk-persian:runtime-3d597d68` با شناسه `sha256:3a9a9823e5bc18e1c695c7340a50aca4380f1ea54e17acc4f41db622f52aebad` استفاده می‌کنند. همین Stack برای دامنه `helpdesk.ircarpet-r.com` در Traefik route دارد؛ بنابراین نام `test` به‌تنهایی ثابت نمی‌کند داده‌ها آزمایشی‌اند.

در ۹ اکتبر ۲۰۲۶ نسخه `b978318cd83e249ba24d7702dd1be862a1596345` به همین Stack منتشر شد؛ به‌دلیل route عمومی، آن را انتشار روی محیط متصل به دامنه در نظر بگیر، نه Staging ایزوله. فقط شش سرویس برنامه بازسازی شدند؛ دیتابیس، Redis و Volumeها دست‌نخورده ماندند و Migration اجرا نشد. قبل از تغییر Backup دیتابیس، فایل‌های public/private و تنظیمات سایت تهیه شد. فشرده‌سازی DB، فهرست TARها و JSON تنظیمات اعتبارسنجی شدند؛ Restore آزمایشی انجام نشده است. شناسه، هش فایل‌ها و شواهد در manifest روی سرور ثبت شده‌اند.

در snapshot ساعت ۱۹:۵۲ UTC شاخه `feat/persian-setup-wizard` روی SHA `57446ad5d4e78cae713b2b2edb48927b2a3b9828` بود و سرور هنوز SHA `b978318cd83e249ba24d7702dd1be862a1596345` را اجرا می‌کرد. سرور HTTP 200 بود. برای `57446ad5`، Persian Clean Frontend Build، Lint و Server Tests موفق شدند. در Playwright، selector آزمون Settings به‌خاطر تغییر نام رسمی `GMail` به `Gmail` شکست خورد و در اجرای بعدی اصلاح‌شده shard اول موفق شد. شکست Opening Date از fixture آزمون بود: تاریخ ساختگی با UTC تولید می‌شد، اما سایت CI در timezone خودش وارد روز بعد شده بود. fixture اصلاح شده تا تاریخ جاری تیکت از Backend حفظ شود؛ CI این اصلاح هنوز باید تأییدش کند.

در ۱۰ اکتبر ۲۰۲۶، commit `3d597d68e1b89b700884441e65d02ccc6f2a294a` با Build کامل `docker/HelpdeskPersian.Containerfile` ساخته و با Image tag و digest بالا روی شش سرویس برنامه منتشر شد. نصب تمیز `yarn install --frozen-lockfile`، `patch-package`، اعمال Patchهای Frappe UI و `bench build --apps frappe,helpdesk` موفق شدند. سرویس DB، Redis، cron و Volumeها بازسازی نشدند؛ Migration اجرا نشد. پیش از Deploy، Backup تازهٔ DB، فایل‌های public/private و تنظیمات سایت تهیه، به مسیر محدودشدهٔ `/home/ubuntu/helpdesk-persian-recovery/pre-3d597d68` روی میزبان کپی و gzip/TAR/JSON و SHA-256 آن اعتبارسنجی شد؛ Restore ایزوله نشده است. فضای آزاد میزبان پس از Build حدود ۶ GB است و هیچ Image یا Volume پاک نشد.

## انتشار مجاز پس از پذیرش

1. SHA و Image digest نامزد انتشار را ثبت کن.
2. از دیتابیس، فایل‌های Public/Private و تنظیمات سایت Backup بگیر و checksum، خوانایی و در صورت امکان Restore ایزوله را تأیید کن.
3. اختلاف Compose و Volumeها را ثبت کن؛ سرویس دیتابیس را بازسازی یا Volume را حذف نکن.
4. Image را با برچسب SHA بساز؛ از `latest` استفاده نکن.
5. پیش از Deploy به دامنه عمومی، نقش و جداسازی محیط را اثبات کن؛ صرفاً `test` بودن نام Stack کافی نیست.
6. Persian/RTL، Login، تیکت‌ها، فایل‌ها، API، Worker و لاگ‌ها را بررسی کن.
7. Production فقط بعد از پذیرش صریح نسخه و اثبات سازگاری Migration منتشر شود.

## وضعیت آخرین انتشار

برای commit `3d597d68e1b89b700884441e65d02ccc6f2a294a` تمام Checkهای PR #1 موفق شدند: clean frontend build، lint، Python tests و هر دو Playwright shard. Full Docker Build از archive همان commit روی میزبان هم موفق شد. پس از انتشار، صفحهٔ Home، Login و API ping و assetهای CSS/فونت/JavaScript پاسخ HTTP 200 دادند؛ MariaDB healthy ماند و containerهای DB و Redis همان شناسه‌های پیش از انتشار را حفظ کردند. طی راه‌اندازی مجدد یک درخواست WebSocket موقتاً به backend وصل نشد؛ بعد از پایدارشدن سرویس‌ها، درخواست‌های Health موفق بودند.

مرورگر درون‌برنامه‌ای به‌جای profile مستقل، نشست موجود را به ارث برد؛ برای حفظ جداسازی، در آن تعامل ادامه داده نشد. ورود و مرور زندهٔ ۱۵ بخش Settings روی نسخهٔ جدید هنوز تأیید نشده و به credential معتبرِ حساب تست و browser profile مستقل نیاز دارد. تست‌های Playwright در CI روی محیط ایزوله موفق‌اند. هیچ تنظیم عملیاتی یا دادهٔ تیکت تغییر نکرده است.

Rollback UI به Image قبلی `helpdesk-persian:runtime-b978318cd` با digest `sha256:8a4ed272e5f8661bb270ed6b5930ed5fab692d385dc2d67abd01bcb1c9a3066d` ممکن است؛ دیتابیس و Volume در این Deploy تغییر نکردند. Image قبلی حذف نشده است.
