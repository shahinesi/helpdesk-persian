# بازگشت نسخه

پیش از انتشار، SHA و digest قبلی Image، وضعیت Compose، Backup دیتابیس و فایل‌ها را ثبت کن. برای تغییر Frontend بدون Migration، بازگشت به Image قبلی ممکن است کافی باشد؛ اگر Migration اجرا شده یا داده/schema تغییر کرده باشد، Image تنها Rollback محسوب نمی‌شود.

Runbook:

1. ترافیک انتشار را متوقف و وضعیت سرویس‌ها را ثبت کن.
2. اگر دیتابیس تغییر نکرده، فقط Image برنامه را به digest قبلی برگردان و سرویس‌های برنامه را بازسازی کن؛ DB/Redis/Volume را دست نزن.
3. اگر schema یا داده تغییر کرده، سازگاری Rollback را از روی Migrationها مشخص کن؛ در صورت نیاز Backup معتبر را در محیط جداگانه بازیابی و تأیید کن.
4. Health check، ورود، API، تیکت‌ها، پیوست‌ها، Worker و لاگ‌ها را بررسی کن.
5. نتیجه و SHAهای قبل/بعد را ثبت کن.

Snapshot پیش از نامزد UI فعلی در `/home/frappe/frappe-bench/sites/backups/pre-57446ad5` شامل SQL فشرده، فایل‌های public/private و تنظیمات سایت است؛ gzip، فهرست TAR و JSON اعتبارسنجی شده‌اند و SHA-256 در `docs/operations/recovery-manifest-2026-10-09.md` ثبت شده است. Restore ایزوله آزمایش نشده؛ Backup در Volume پایدار سایت قرار دارد و نباید به‌عنوان نسخهٔ خارج از میزبان فرض شود. اطلاعات محرمانهٔ فایل تنظیمات نباید در گزارش یا Git کپی شود.

نسخهٔ فعلی `helpdesk-persian:runtime-3d597d68` با digest `sha256:3a9a9823e5bc18e1c695c7340a50aca4380f1ea54e17acc4f41db622f52aebad` است. Image قبلی `helpdesk-persian:runtime-b978318cd` با digest `sha256:8a4ed272e5f8661bb270ed6b5930ed5fab692d385dc2d67abd01bcb1c9a3066d` نگهداری شده است. Deploy فقط سرویس‌های برنامه را بازسازی کرد؛ DB، Redis، Volumeها و schema تغییر نکردند. Backup پیش از Deploy در مسیر محدودشدهٔ `/home/ubuntu/helpdesk-persian-recovery/pre-3d597d68` روی میزبان است؛ checksumها ثبت و archiveها خوانده شدند، اما Restore آزمایشی نشده است. اگر Rollback لازم شد، همان Compose files را با `HELPDESK_RUNTIME_IMAGE=helpdesk-persian:runtime-b978318cd` اجرا و فقط شش سرویس برنامه را بازسازی کن.
