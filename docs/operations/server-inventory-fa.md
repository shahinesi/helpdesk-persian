# موجودی محیط Helpdesk

تاریخ مشاهده: ۹ اکتبر ۲۰۲۶. این سند اطلاعات عملیاتی غیرمحرمانه را نگه می‌دارد؛ ENV، رمزها، Tokenها و محتوای `site_config.json` در آن درج نمی‌شوند.

| مورد | وضعیت مشاهده‌شده |
|---|---|
| میزبان SSH | `carpet-erp` |
| مسیر Repository | `/home/ubuntu/helpdesk-persian` |
| SHA و وضعیت Working Tree | `e0c78c32402c0789f8898db66d219c0c0290158d`، پاک |
| روش اجرا | Docker Compose |
| Compose project | `helpdesk-persian-test` |
| Image برنامه | `helpdesk-persian:runtime-e0c78c324`، digest ثبت‌شده در Runbook انتشار |
| DB | MariaDB 11.8، container healthy |
| Cache/Queue | Redis 8.6، سرویس‌های Up |
| دامنه | Traefik برای `helpdesk.ircarpet-r.com` به frontend این Stack route دارد |
| نسخه Helpdesk | 1.22.2، UNVERSIONED در Image |
| نسخه Frappe | 17.0.0-dev، UNVERSIONED در Image |
| نسخه frappe-ui | 1.0.0-rc.1 |
| Snapshot | مسیر ثبت‌شده در `rollback-fa.md` |

یک Container دیگر با نام `helpdesk-final-3790` و Image جداگانه نیز مشاهده شد؛ رابطه‌اش با دامنه و Stack فعلی تأیید نشده و دست‌کاری نشده است. به‌دلیل route عمومی و دو Container اجرایی، محیط را صرفاً بر اساس نام Compose «آزمایشی» یا «Production» طبقه‌بندی نکن.
