# Runbook انتشار

## وضعیت فعلی

Stack مشاهده‌شده روی میزبان `carpet-erp` با Compose project به‌نام `helpdesk-persian-test` اجرا می‌شود. سرویس‌های frontend، backend، workerها و scheduler از Image `helpdesk-persian:runtime-e0c78c324` با شناسه `sha256:2386d4c7911f3d7b24a9e61f99f7c3055cbc2711760d1a286b59691b668df2f0` استفاده می‌کنند. همین Stack برای دامنه `helpdesk.ircarpet-r.com` در Traefik route دارد؛ بنابراین نام `test` به‌تنهایی ثابت نمی‌کند داده‌ها آزمایشی‌اند.

این ممیزی نسخه جدیدی روی سرور Deploy نکرده است. انتشار به همین route تا تعیین قطعی جداسازی داده و نقش محیط، موفقیت کامل CI، تست Staging و مسیر Rollback متوقف می‌ماند.

آخرین بررسی شاخه در ۹ اکتبر: شاخه محلی/PR پس از push به‌روز است، درحالی‌که سرور هنوز `e0c78c32402c0789f8898db66d219c0c0290158d` را اجرا می‌کند. CI روی commit قبلی این به‌روزرسانی برای Semantic Commits، Lint و Clean Frontend Build موفق بود؛ Python Unit و Playwright E2E همچنان در حال اجرا بودند. این نتیجه Full Docker Image Build یا runtime پذیرش را اثبات نمی‌کند. در میزبان حدود ۹ GB فضای آزاد گزارش شده و image فعلی برنامه حدود ۱۴ GB است؛ تا ارزیابی ظرفیت و Build ایزوله، ساخت Image روی میزبان فعلی انجام نمی‌شود. Containerfile سورس Frappe UI را از ref پین‌شده می‌گیرد.

## انتشار مجاز پس از پذیرش

1. SHA و Image digest نامزد انتشار را ثبت کن.
2. از دیتابیس، فایل‌های Public/Private و تنظیمات سایت Backup بگیر و خوانایی Backup را بررسی کن.
3. اختلاف Compose و Volumeها را ثبت کن؛ سرویس دیتابیس را بازسازی یا Volume را حذف نکن. Backup موجود در `/home/ubuntu/helpdesk-persian-backups/20261009T151500Z/` بررسی فشرده‌سازی/فهرست‌پذیری شده، ولی restore آزمایشی نشده است.
4. Image را با برچسب SHA بساز؛ از `latest` استفاده نکن.
5. ابتدا Staging جدا و بدون ایمیل/Webhook عملیاتی را Deploy کن.
6. Persian/RTL، Login، تیکت‌ها، فایل‌ها، API، Worker و لاگ‌ها را بررسی کن.
7. Production فقط بعد از پذیرش صریح نسخه و اثبات سازگاری Migration منتشر شود.

## وضعیت نامزد فعلی

Commit محلی/PR روی همان branch جلوتر است؛ clean frontend build برای commitی که Containerfile را تغییر داد موفق شد. Containerfile مسیر نصب Node را از NVM به image رسمی Node پین‌شده با digest تغییر داده است. Syntax و منابع image با `docker buildx build --check` بررسی شدند؛ Full Docker Build انجام نشده، بنابراین image جدید Push یا روی سرور Deploy نشده است. دامنه عمومی به همین Compose project route دارد و محیط را بدون اثبات جداسازی Production/Stage فرض نمی‌کنیم. دیتابیس، تنظیمات و Volumeها تغییر نکرده‌اند.
