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
| همگامی با branch فعلی | سرور روی SHA `e0c78c32402c0789f8898db66d219c0c0290158d` است؛ branch محلی/PR روی `3ac43410518fc4a4446815d5e756e1d65c727335` قرار دارد |
| وضعیت CI شاخه محلی/PR | Lint، Clean Frontend Build، Server و UI Tests موفق‌اند؛ Full Docker image و runtime پذیرش هنوز تأیید نشده‌اند |
| Build prerequisites | Containerfile سورس `frappe/ui` را از ref ثابت می‌گیرد؛ فضای آزاد آخرین مشاهده حدود ۹ GB از ۷۷ GB و image فعلی برنامه حدود ۱۴ GB است |

یک Container دیگر با نام `helpdesk-final-3790` و Image جداگانه نیز مشاهده شد؛ رابطه‌اش با دامنه و Stack فعلی تأیید نشده و دست‌کاری نشده است. به‌دلیل route عمومی و دو Container اجرایی، محیط را صرفاً بر اساس نام Compose «آزمایشی» یا «Production» طبقه‌بندی نکن.

به‌دلیل کمبود منبع Frappe UI در checkout و فضای آزاد، روی سرور build/deploy تازه انجام نشده است. قبل از Deploy باید محیط build ایزوله، ظرفیت دیسک و اثر Pull کردن Image دقیقاً ارزیابی شوند؛ هیچ Image یا Volume پاک نشده است.
