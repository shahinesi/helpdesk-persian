# Manifest بازیابی و استقرار — ۱۰ اکتبر ۲۰۲۶

## نسخه‌ها

| مورد | مقدار |
|---|---|
| Repository / Branch | `shahinesi/helpdesk-persian` / `feat/persian-setup-wizard` |
| Commit فعلی و Deployشده | `1cfbe9157a615005a0ec518a39332a2e3820176e` |
| Image فعلی | `helpdesk-persian:runtime-1cfbe9157` |
| Image digest فعلی | `sha256:4d8373e9d223746ef31cb460d271bb187c8c8fb26301b77d5314d82643e90b58` |
| Image قبلی سالم برای Rollback | `helpdesk-persian:runtime-3d597d68`, `sha256:3a9a9823e5bc18e1c695c7340a50aca4380f1ea54e17acc4f41db622f52aebad` |

## Checkpoint قبل از Deploy

Backup با `bench --site helpdesk.ircarpet-r.com backup --with-files --compress` گرفته شد. کپی محدودشدهٔ آن خارج از Compose و Volume سایت در مسیر `/home/ubuntu/helpdesk-persian-recovery/pre-3d597d68` قرار دارد؛ پوشه مجوز `700` و فایل‌ها مجوز `600` دارند.

| فایل | SHA-256 | اعتبارسنجی |
|---|---|---|
| Database SQL gzip | `e182cea5b1a2708ad34c430f301aa7612214c354ea871502c2cbd72d9f3055a0` | `gzip -t` موفق |
| Public files tar.gz | `0a3fea366575e4c144e5d258df62bba26b39daa0e3a3fe194bfddaecc5ce7169` | فهرست TAR خوانده شد |
| Private files tar.gz | `b226759f387318b3453aa1eed65883d00e11aea286c9de82601b4a2700beb457` | فهرست TAR خوانده شد |

فایل تنظیمات سایت هم JSON parse شد؛ محتوا و checksum آن عمداً وارد Git نشده است. Restore آزمایشی انجام نشده است.

پیش از انتشار اصلاح KPI نیز backup تازه در مسیر محدودشدهٔ `/home/ubuntu/helpdesk-persian-recovery/pre-9d818f170` تهیه شد. پس از deploy اول هیچ تغییری از سوی این عملیات در دیتابیس یا فایل‌های سایت انجام نشد؛ همین checkpoint پیش از image نهایی `1cfbe915` قرار دارد.

| فایل backup تازه | SHA-256 | اعتبارسنجی |
|---|---|---|
| Database SQL gzip (`20261010_083244`) | `24926da2d6417d3f46cf9451e9813e51254f3a9cb13a4a29e1cdfa183d5ac54c` | `gzip -t` موفق |
| Public files tar.gz | `0a3fea366575e4c144e5d258df62bba26b39daa0e3a3fe194bfddaecc5ce7169` | فهرست TAR خوانده شد |
| Private files tar.gz | `b226759f387318b3453aa1eed65883d00e11aea286c9de82601b4a2700beb457` | فهرست TAR خوانده شد |

## اصلاح کارت KPI و استقرار نهایی

- علت باقی‌ماندن چیدمان قبلی: Vue compiler بخش‌های selectorهای `:global(...)` را از `<style scoped>` حذف می‌کرد؛ image `runtime-9d818f170` به همین دلیل CSS مؤثر نداشت.
- در commit `1cfbe9157a615005a0ec518a39332a2e3820176e`، CSS به selector عادی و کلاس اختصاصی `.number-chart-content` تغییر کرد. Patch روی package تمیز اعمال و Vue compiler بررسی شد.
- Clean Docker build از `docker/HelpdeskPersian.Containerfile` موفق شد. CSS ساخته‌شده در image، selector کامل و موقعیت عنوان در ستون ۱ و مقدار در ستون ۲ را دارد.
- فقط شش سرویس برنامه به image `runtime-1cfbe9157` منتقل شدند. MariaDB، Redis، cron و Volumeها تغییر نکردند؛ Migration اجرا نشد.
- پس از Deploy، `/helpdesk/home`، `/login` و `/api/method/ping` پاسخ موفق دادند؛ asset Dashboard CSS از HTTP پاسخ 200 داد و rule جلالی/RTL در فایل زنده وجود داشت.
- مرور بصری با حساب تست و مرورگر مستقل انجام نشد؛ نباید آن را Runtime visual PASS تلقی کرد.

## نتیجهٔ انتشار قبلی (`3d597d68`)

- Image از `docker/HelpdeskPersian.Containerfile` و commit `3d597d68e1b89b700884441e65d02ccc6f2a294a` Build شد. نصب وابستگی‌ها با `yarn install --frozen-lockfile`، Patchهای `frappe-ui` و Frappe UI و `bench build --apps frappe,helpdesk` موفق شدند.
- فقط شش سرویس برنامه (backend، frontend، queue-long، queue-short، scheduler، websocket) بازسازی شدند.
- MariaDB، Redis، cron، تنظیمات سایت و Volumeها تغییر نکردند؛ Migration اجرا نشد.
- پس از Deploy، Home، Login، API ping و assetهای CSS، Vazirmatn و JavaScript پاسخ HTTP 200 دادند؛ MariaDB healthy بود.
- فضای آزاد پس از Deploy حدود ۶ GB بود؛ هیچ Image یا Volume پاک نشد.
- Runtime زندهٔ Settings نیازمند profile مرورگر مستقل و حساب تست مجاز است و هنوز تأیید نشده است. CI شامل clean frontend build، lint، Python tests و هر دو Playwright shard موفق شد.

این Build بر image پایهٔ محلی `helpdesk-persian:styled` تکیه دارد. بنابراین اجرای موفق Containerfile روی میزبان ثبت شده، اما بازتولید کامل از میزبان خالی بدون آن image پایه هنوز تأیید نشده است.
