# Runbook انتشار

## وضعیت فعلی

Stack مشاهده‌شده روی میزبان `carpet-erp` با Compose project به‌نام `helpdesk-persian-test` اجرا می‌شود. سرویس‌های frontend، backend، workerها و scheduler از Image `helpdesk-persian:runtime-e0c78c324` با شناسه `sha256:2386d4c7911f3d7b24a9e61f99f7c3055cbc2711760d1a286b59691b668df2f0` استفاده می‌کنند. همین Stack برای دامنه `helpdesk.ircarpet-r.com` در Traefik route دارد؛ بنابراین نام `test` به‌تنهایی ثابت نمی‌کند داده‌ها آزمایشی‌اند.

این ممیزی نسخه جدیدی روی سرور Deploy نکرده است. انتشار به همین route تا تعیین قطعی جداسازی داده و نقش محیط، موفقیت کامل CI، تست Staging و مسیر Rollback متوقف می‌ماند.

آخرین بررسی branch در ۹ اکتبر: commit محلی/PR برابر `3a07099cfa1c90a55f52287c5b53f7b5dbfde3d0` است، درحالی‌که سرور هنوز `e0c78c32402c0789f8898db66d219c0c0290158d` را اجرا می‌کند. Clean frontend build در GitHub Actions موفق شد، اما اجرای E2E یک تست غیر Settings را شکست داده و Coverage upload به‌دلیل نبود Codecov token ناموفق است. سرور `apps/frappe/ui` ندارد و حدود ۹ GB فضای آزاد دارد؛ بنابراین از این وضعیت نمی‌توان Deploy امن و بازتولیدپذیر انجام داد.

## انتشار مجاز پس از پذیرش

1. SHA و Image digest نامزد انتشار را ثبت کن.
2. از دیتابیس، فایل‌های Public/Private و تنظیمات سایت Backup بگیر و خوانایی Backup را بررسی کن.
3. اختلاف Compose و Volumeها را ثبت کن؛ سرویس دیتابیس را بازسازی یا Volume را حذف نکن.
4. Image را با برچسب SHA بساز؛ از `latest` استفاده نکن.
5. ابتدا Staging جدا و بدون ایمیل/Webhook عملیاتی را Deploy کن.
6. Persian/RTL، Login، تیکت‌ها، فایل‌ها، API، Worker و لاگ‌ها را بررسی کن.
7. Production فقط بعد از پذیرش صریح نسخه و اثبات سازگاری Migration منتشر شود.
