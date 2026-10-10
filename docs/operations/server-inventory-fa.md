# موجودی محیط Helpdesk

تاریخ مشاهده: ۱۰ اکتبر ۲۰۲۶. این سند اطلاعات عملیاتی غیرمحرمانه را نگه می‌دارد؛ ENV، رمزها، Tokenها و محتوای `site_config.json` در آن درج نمی‌شوند.

| مورد | وضعیت مشاهده‌شده |
|---|---|
| میزبان SSH | `carpet-erp` |
| مسیر Repository | `/home/ubuntu/helpdesk-persian` |
| Working Tree مخزن روی سرور | SHA `1cfbe9157a615005a0ec518a39332a2e3820176e`، پاک؛ fast-forward امن از origin |
| SHA آخرین Image برنامه | `1cfbe9157a615005a0ec518a39332a2e3820176e` |
| روش اجرا | Docker Compose |
| Compose project | `helpdesk-persian-test` |
| Image برنامه | `helpdesk-persian:runtime-1cfbe9157`, `sha256:4d8373e9d223746ef31cb460d271bb187c8c8fb26301b77d5314d82643e90b58` |
| DB | MariaDB 11.8، container healthy |
| Cache/Queue | Redis 8.6، سرویس‌های Up |
| دامنه | Traefik برای `helpdesk.ircarpet-r.com` به frontend این Stack route دارد |
| نسخه Helpdesk | 1.22.2، UNVERSIONED در Image |
| نسخه Frappe | 17.0.0-dev، UNVERSIONED در Image |
| نسخه frappe-ui | 1.0.0-rc.1 |
| Backup پیش از Deploy | `/home/ubuntu/helpdesk-persian-recovery/pre-9d818f170`؛ backup روز ۱۰ اکتبر، SQL gzip، public/private TAR و JSON؛ checksum و خوانایی اعتبارسنجی شده؛ Restore آزمایشی نشده |
| شاخه و PR | `feat/persian-setup-wizard`، PR #1 باز؛ image از SHA `1cfbe9157a615005a0ec518a39332a2e3820176e` ساخته شد |
| وضعیت CI | CI برای commit `1cfbe915` اینجا تأیید نشده؛ patch applicability، Vue CSS compile و build کامل image موفق شدند |
| Build کامل | `docker/HelpdeskPersian.Containerfile` از checkout پاک commit `1cfbe915` روی میزبان موفق؛ نصب lockfile، Patchها و `bench build --apps frappe,helpdesk` موفق |
| فضای میزبان | پس از Build حدود ۴٫۸ GB آزاد بود. هیچ Image یا Volume پاک نشد |
| وضعیت سرویس | شش سرویس برنامه `helpdesk-persian:runtime-1cfbe9157` را اجرا می‌کنند؛ MariaDB healthy، Redisها Up؛ Home، Login، API ping و Dashboard CSS پاسخ HTTP 200؛ selector RTL درست در asset زنده تأیید شد |
| اثر Deploy | فقط شش سرویس برنامه جایگزین شدند؛ DB، Redis، cron و Volumeها تغییر نکردند؛ Migration اجرا نشد؛ imageهای قبلی برای Rollback نگهداری شده‌اند |

در اولین image با commit `9d818f170`، سورس Patch صحیح بود اما CSS compiler selectorهای `:global(...)` داخل `<style scoped>` را در CSS خروجی حذف کرد. اصلاح نهایی در commit `1cfbe915` از selector عادی با کلاس اختصاصی کارت استفاده می‌کند. CSS نهایی روی سرور حاوی `[dir=rtl] .number-chart-content` و ستون عنوان/مقدار درست است. نمایش بصری در مرورگر کاربر کنترل نشده است.

یک Container دیگر با نام `helpdesk-final-3790` و Image جداگانه نیز مشاهده شد؛ رابطه‌اش با دامنه و Stack فعلی تأیید نشده و دست‌کاری نشده است. به‌دلیل route عمومی و دادهٔ متصل، محیط را صرفاً بر اساس نام Compose «آزمایشی» یا «Production» طبقه‌بندی نکن.

Image پایه محلی، مانع بازتولید Full image build روی یک میزبان خالی است؛ recipe ساخت پایه باید نسخه‌بندی شود. فضای آزاد میزبان نیز برای شروع build کامل بدون ارزیابی ظرفیت کافی، حاشیه اطمینان کمی دارد. هیچ Image یا Volume پاک نشده است.
