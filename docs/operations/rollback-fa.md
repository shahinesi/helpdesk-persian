# بازگشت نسخه

پیش از انتشار، SHA و digest قبلی Image، وضعیت Compose، Backup دیتابیس و فایل‌ها را ثبت کن. برای تغییر Frontend بدون Migration، بازگشت به Image قبلی ممکن است کافی باشد؛ اگر Migration اجرا شده یا داده/schema تغییر کرده باشد، Image تنها Rollback محسوب نمی‌شود.

Runbook:

1. ترافیک انتشار را متوقف و وضعیت سرویس‌ها را ثبت کن.
2. اگر دیتابیس تغییر نکرده، فقط Image برنامه را به digest قبلی برگردان و سرویس‌های برنامه را بازسازی کن؛ DB/Redis/Volume را دست نزن.
3. اگر schema یا داده تغییر کرده، سازگاری Rollback را از روی Migrationها مشخص کن؛ در صورت نیاز Backup معتبر را در محیط جداگانه بازیابی و تأیید کن.
4. Health check، ورود، API، تیکت‌ها، پیوست‌ها، Worker و لاگ‌ها را بررسی کن.
5. نتیجه و SHAهای قبل/بعد را ثبت کن.

Snapshot پیش از نامزد UI فعلی در `/home/frappe/frappe-bench/sites/backups/pre-57446ad5` شامل SQL فشرده، فایل‌های public/private و تنظیمات سایت است؛ gzip، فهرست TAR و JSON اعتبارسنجی شده‌اند و SHA-256 در `docs/operations/recovery-manifest-2026-10-09.md` ثبت شده است. Restore ایزوله آزمایش نشده؛ Backup در Volume پایدار سایت قرار دارد و نباید به‌عنوان نسخهٔ خارج از میزبان فرض شود. اطلاعات محرمانهٔ فایل تنظیمات نباید در گزارش یا Git کپی شود.

نامزد `d11dc04b57a610aaef8684f3ce3c4db7294403aa` هنوز Deploy نشده و Image فعلی همان `helpdesk-persian:runtime-b978318cd` با digest `sha256:8a4ed272e5f8661bb270ed6b5930ed5fab692d385dc2d67abd01bcb1c9a3066d` است؛ تا این مرحله Rollback عملیاتی لازم نشده است.
