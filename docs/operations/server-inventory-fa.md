# موجودی محیط Helpdesk

تاریخ مشاهده: ۱۰ اکتبر ۲۰۲۶. این سند اطلاعات عملیاتی غیرمحرمانه را نگه می‌دارد؛ ENV، رمزها، Tokenها و محتوای `site_config.json` در آن درج نمی‌شوند.

| مورد | وضعیت مشاهده‌شده |
|---|---|
| میزبان SSH | `carpet-erp` |
| مسیر Repository | `/home/ubuntu/helpdesk-persian` |
| SHA و وضعیت Working Tree روی سرور | `b978318cd83e249ba24d7702dd1be862a1596345`، پاک |
| روش اجرا | Docker Compose |
| Compose project | `helpdesk-persian-test` |
| Image برنامه | `helpdesk-persian:runtime-b978318cd`, `sha256:8a4ed272e5f8661bb270ed6b5930ed5fab692d385dc2d67abd01bcb1c9a3066d` |
| DB | MariaDB 11.8، container healthy |
| Cache/Queue | Redis 8.6، سرویس‌های Up |
| دامنه | Traefik برای `helpdesk.ircarpet-r.com` به frontend این Stack route دارد |
| نسخه Helpdesk | 1.22.2، UNVERSIONED در Image |
| نسخه Frappe | 17.0.0-dev، UNVERSIONED در Image |
| نسخه frappe-ui | 1.0.0-rc.1 |
| Snapshot پیش از نامزد فعلی | `/home/frappe/frappe-bench/sites/backups/pre-57446ad5`؛ SQL gzip، public/private TAR و JSON تنظیمات از نظر خوانایی و checksum اعتبارسنجی شده؛ Restore آزمایشی نشده |
| شاخه نامزد | `feat/persian-setup-wizard` روی SHA `d11dc04b57a610aaef8684f3ce3c4db7294403aa`؛ PR #1 به `develop` باز است |
| وضعیت CI شاخه/PR | Clean Frontend Build، Lint، Python Server Tests و هر دو Playwright shard موفق؛ PR در آخرین بررسی `CLEAN` و `MERGEABLE` بود |
| وضعیت Build کامل | Clean Frontend Build در CI تأیید شده؛ Full Docker Build از checkout تمیز هنوز تأیید نشده و image کامل نامزد ساخته نشده است |
| فضای میزبان | ۶٫۴ GB آزاد از ۷۷ GB؛ Docker imageها ۵۱٫۰۳ GB و build cache برابر ۱۴٫۸۸ GB است. هیچ Image یا Volume پاک نشود |
| وضعیت سرویس فعلی | سرویس‌های برنامه همچنان `helpdesk-persian:runtime-b978318cd` را اجرا می‌کنند؛ MariaDB Healthy؛ دامنه `https://helpdesk.ircarpet-r.com/helpdesk/home` پاسخ HTTP 200 |
| اثر پس از snapshot | هیچ image جدیدی Deploy نشده؛ DB، Redis، تنظیمات سایت و Volumeها تغییر نکرده‌اند؛ Migration اجرا نشده |

یک Container دیگر با نام `helpdesk-final-3790` و Image جداگانه نیز مشاهده شد؛ رابطه‌اش با دامنه و Stack فعلی تأیید نشده و دست‌کاری نشده است. به‌دلیل route عمومی و دو Container اجرایی، محیط را صرفاً بر اساس نام Compose «آزمایشی» یا «Production» طبقه‌بندی نکن.

Image پایه محلی، مانع بازتولید Full image build روی یک میزبان خالی است؛ recipe ساخت پایه باید نسخه‌بندی شود. فضای آزاد میزبان نیز برای شروع build کامل بدون ارزیابی ظرفیت کافی، حاشیه اطمینان کمی دارد. هیچ Image یا Volume پاک نشده است.
