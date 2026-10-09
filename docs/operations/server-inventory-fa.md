# موجودی محیط Helpdesk

تاریخ مشاهده: ۱۰ اکتبر ۲۰۲۶. این سند اطلاعات عملیاتی غیرمحرمانه را نگه می‌دارد؛ ENV، رمزها، Tokenها و محتوای `site_config.json` در آن درج نمی‌شوند.

| مورد | وضعیت مشاهده‌شده |
|---|---|
| میزبان SSH | `carpet-erp` |
| مسیر Repository | `/home/ubuntu/helpdesk-persian` |
| Working Tree مخزن روی سرور | SHA `b978318cd83e249ba24d7702dd1be862a1596345`، پاک؛ image نامزد از archive commit جدیدتر ساخته شد |
| SHA آخرین Image برنامه | `3d597d68e1b89b700884441e65d02ccc6f2a294a` |
| روش اجرا | Docker Compose |
| Compose project | `helpdesk-persian-test` |
| Image برنامه | `helpdesk-persian:runtime-3d597d68`, `sha256:3a9a9823e5bc18e1c695c7340a50aca4380f1ea54e17acc4f41db622f52aebad` |
| DB | MariaDB 11.8، container healthy |
| Cache/Queue | Redis 8.6، سرویس‌های Up |
| دامنه | Traefik برای `helpdesk.ircarpet-r.com` به frontend این Stack route دارد |
| نسخه Helpdesk | 1.22.2، UNVERSIONED در Image |
| نسخه Frappe | 17.0.0-dev، UNVERSIONED در Image |
| نسخه frappe-ui | 1.0.0-rc.1 |
| Backup پیش از Deploy | `/home/ubuntu/helpdesk-persian-recovery/pre-3d597d68`؛ SQL gzip، public/private TAR و JSON تنظیمات؛ checksum و خوانایی اعتبارسنجی شده؛ Restore آزمایشی نشده |
| شاخه و PR | `feat/persian-setup-wizard`، PR #1 باز به `develop`؛ image از SHA `3d597d68e1b89b700884441e65d02ccc6f2a294a` ساخته شد. HEAD مستندات در زمان ثبت این گزارش `83ec277077c1ab064ac51745f479720d784b94f6` بود |
| وضعیت CI | تمام گیت‌ها روی کد `3d597d68` موفق؛ اجرای مجدد CI برای HEAD مستندات `83ec277` در حال اجرا بود |
| Build کامل | `docker/HelpdeskPersian.Containerfile` از archive commit `3d597d68` روی میزبان موفق؛ image نسخه‌بندی‌شده ساخته شد |
| فضای میزبان | هنگام بررسی ۶٫۴ GB آزاد بود؛ بعد از Build/Deploy حدود ۶ GB آزاد ماند. هیچ Image یا Volume پاک نشد |
| وضعیت سرویس | شش سرویس برنامه `helpdesk-persian:runtime-3d597d68` را اجرا می‌کنند؛ MariaDB healthy، Redisها Up؛ Home، Login، API ping و assetهای CSS/فونت/JavaScript HTTP 200 |
| اثر Deploy | DB، Redis و Volumeها تغییر نکردند؛ Migration اجرا نشد؛ image قبلی برای Rollback نگهداری شده است |

یک Container دیگر با نام `helpdesk-final-3790` و Image جداگانه نیز مشاهده شد؛ رابطه‌اش با دامنه و Stack فعلی تأیید نشده و دست‌کاری نشده است. به‌دلیل route عمومی و دادهٔ متصل، محیط را صرفاً بر اساس نام Compose «آزمایشی» یا «Production» طبقه‌بندی نکن.

Image پایه محلی، مانع بازتولید Full image build روی یک میزبان خالی است؛ recipe ساخت پایه باید نسخه‌بندی شود. فضای آزاد میزبان نیز برای شروع build کامل بدون ارزیابی ظرفیت کافی، حاشیه اطمینان کمی دارد. هیچ Image یا Volume پاک نشده است.
