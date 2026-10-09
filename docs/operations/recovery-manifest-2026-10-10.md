# Manifest بازیابی و استقرار — ۱۰ اکتبر ۲۰۲۶

## نسخه‌ها

| مورد | مقدار |
|---|---|
| Repository / Branch | `shahinesi/helpdesk-persian` / `feat/persian-setup-wizard` |
| Commit ساخته و Deployشده | `3d597d68e1b89b700884441e65d02ccc6f2a294a` |
| Image | `helpdesk-persian:runtime-3d597d68` |
| Image digest | `sha256:3a9a9823e5bc18e1c695c7340a50aca4380f1ea54e17acc4f41db622f52aebad` |
| Image قبلی برای Rollback | `helpdesk-persian:runtime-b978318cd`, `sha256:8a4ed272e5f8661bb270ed6b5930ed5fab692d385dc2d67abd01bcb1c9a3066d` |

## Checkpoint قبل از Deploy

Backup با `bench --site helpdesk.ircarpet-r.com backup --with-files --compress` گرفته شد. کپی محدودشدهٔ آن خارج از Compose و Volume سایت در مسیر `/home/ubuntu/helpdesk-persian-recovery/pre-3d597d68` قرار دارد؛ پوشه مجوز `700` و فایل‌ها مجوز `600` دارند.

| فایل | SHA-256 | اعتبارسنجی |
|---|---|---|
| Database SQL gzip | `e182cea5b1a2708ad34c430f301aa7612214c354ea871502c2cbd72d9f3055a0` | `gzip -t` موفق |
| Public files tar.gz | `0a3fea366575e4c144e5d258df62bba26b39daa0e3a3fe194bfddaecc5ce7169` | فهرست TAR خوانده شد |
| Private files tar.gz | `b226759f387318b3453aa1eed65883d00e11aea286c9de82601b4a2700beb457` | فهرست TAR خوانده شد |

فایل تنظیمات سایت هم JSON parse شد؛ محتوا و checksum آن عمداً وارد Git نشده است. Restore آزمایشی انجام نشده است.

## نتیجهٔ انتشار

- Image از `docker/HelpdeskPersian.Containerfile` و archive دقیق commit بالا Build شد. نصب وابستگی‌ها با `yarn install --frozen-lockfile`، Patchهای `frappe-ui` و Frappe UI و `bench build --apps frappe,helpdesk` موفق شدند.
- فقط شش سرویس برنامه (backend، frontend، queue-long، queue-short، scheduler، websocket) بازسازی شدند.
- MariaDB، Redis، cron، تنظیمات سایت و Volumeها تغییر نکردند؛ Migration اجرا نشد.
- پس از Deploy، Home، Login، API ping و assetهای CSS، Vazirmatn و JavaScript پاسخ HTTP 200 دادند؛ MariaDB healthy بود.
- فضای آزاد پس از Deploy حدود ۶ GB بود؛ هیچ Image یا Volume پاک نشد.
- Runtime زندهٔ Settings نیازمند profile مرورگر مستقل و حساب تست مجاز است و هنوز تأیید نشده است. CI شامل clean frontend build، lint، Python tests و هر دو Playwright shard موفق شد.

این Build بر image پایهٔ محلی `helpdesk-persian:styled` تکیه دارد. بنابراین اجرای موفق Containerfile روی میزبان ثبت شده، اما بازتولید کامل از میزبان خالی بدون آن image پایه هنوز تأیید نشده است.
