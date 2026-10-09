# موجودی محیط Helpdesk

تاریخ مشاهده: ۹ اکتبر ۲۰۲۶. این سند اطلاعات عملیاتی غیرمحرمانه را نگه می‌دارد؛ ENV، رمزها، Tokenها و محتوای `site_config.json` در آن درج نمی‌شوند.

| مورد | وضعیت مشاهده‌شده |
|---|---|
| میزبان SSH | `carpet-erp` |
| مسیر Repository | `/home/ubuntu/helpdesk-persian` |
| SHA و وضعیت Working Tree | `b978318cd83e249ba24d7702dd1be862a1596345`، پاک |
| روش اجرا | Docker Compose |
| Compose project | `helpdesk-persian-test` |
| Image برنامه | `helpdesk-persian:runtime-b978318cd`, `sha256:8a4ed272e5f8661bb270ed6b5930ed5fab692d385dc2d67abd01bcb1c9a3066d` |
| DB | MariaDB 11.8، container healthy |
| Cache/Queue | Redis 8.6، سرویس‌های Up |
| دامنه | Traefik برای `helpdesk.ircarpet-r.com` به frontend این Stack route دارد |
| نسخه Helpdesk | 1.22.2، UNVERSIONED در Image |
| نسخه Frappe | 17.0.0-dev، UNVERSIONED در Image |
| نسخه frappe-ui | 1.0.0-rc.1 |
| Snapshot | `/home/ubuntu/helpdesk-persian-backups/candidate-b978318cd/`؛ DB gzip و TARها قابل خواندن و checksum ثبت شده؛ Restore آزمایشی نشده |
| همگامی با branch فعلی | سرور و branch روی SHA `b978318cd83e249ba24d7702dd1be862a1596345` هستند |
| وضعیت CI شاخه محلی/PR | Lint، Server و Clean Frontend Build موفق؛ Playwright shard 1 موفق، shard 2 شکست در تست فیلتر فهرست تیکت؛ جزئیات در `persian-acceptance-fa.md` |
| Build prerequisites | Full app image روی میزبان ساخته شد، اما به پایه محلی `helpdesk-persian:styled` متکی است؛ Clean build مستقل از host هنوز اثبات نشده. فضای آزاد بعد از Build حدود 6.5 GB و Image حدود 14.2 GB است |
| وضعیت سرویس | شش سرویس برنامه با image جدید Running؛ MariaDB Healthy؛ دامنه `https://helpdesk.ircarpet-r.com/helpdesk/home` پاسخ HTTP 200 |
| اثر Deploy | فقط شش سرویس برنامه جایگزین شدند؛ DB، Redis، Volumeها بدون تغییر؛ Migration اجرا نشد |

یک Container دیگر با نام `helpdesk-final-3790` و Image جداگانه نیز مشاهده شد؛ رابطه‌اش با دامنه و Stack فعلی تأیید نشده و دست‌کاری نشده است. به‌دلیل route عمومی و دو Container اجرایی، محیط را صرفاً بر اساس نام Compose «آزمایشی» یا «Production» طبقه‌بندی نکن.

Image پایه محلی، مانع بازتولید Full image build روی یک میزبان خالی است؛ recipe ساخت پایه باید نسخه‌بندی شود. هیچ Image یا Volume پاک نشده است.
