# RFC: آمادگی Staging و Office برای Frappe Persian

**وضعیت:** طرح برای بازبینی؛ هیچ سرور، سایت، دیتابیس یا تنظیم عملیاتی بررسی یا تغییر داده نشده است.
**تاریخ snapshot:** ۲۰۲۶-۱۰-۱۲ (Asia/Tehran).

## ماتریس نسخه مشاهده‌شده

| اپ | شاخه محصول و SHA بررسی‌شده | الزام اعلام‌شده | ارزیابی محدود |
|---|---|---|---|
| Frappe Framework | `frappe/frappe:develop` — `bb683fba750690311b2bc9ab3e50879363760290` | شاخه توسعه Frappe 17؛ Python 3.14، MariaDB 11.8 در مستندات جاری | فقط مبنای نامزد Staging؛ SHA باید در زمان ساخت دوباره پین شود. |
| ERPNext Persian | `custom/develop-fa` — `d2072755c94adc101f9571e5263badc1e6493082` | Python ≥3.14، Frappe `>=17.0.0-dev,<18` | بازه manifest با F17 سازگار به نظر می‌رسد؛ نصب مشترک اثبات نشده. |
| Helpdesk Persian | `custom/develop-fa` — `e56ff43a81173c4723c7eef029ea8e759d777ade` | Python `>=3.14,<3.15`، Frappe `>=17.0.0-dev,<18` و Telephony | بازه manifest با F17 سازگار به نظر می‌رسد؛ Telephony و migration ترکیبی هنوز تأیید نشده‌اند. سایت فعلی خارج از این برنامه و دست‌نخورده است. |
| Insights Persian | `custom/develop-fa` — `110ca16d118081cfc4908accdb0bd3e88667f571` | Python ≥3.10، Frappe ≥15 | بازه نسخه اجازه F17 را می‌دهد؛ ماتریس توسعه‌اش F17 را دارد، اما نصب ترکیبی ERPNext/Helpdesk را آزمایش نمی‌کند. |

این‌ها SHAهای snapshot هستند، نه نسخه انتشار. پیش از هر ساخت، تمام SHAها، dependencyها و image digestها باید از Refهای جاری مجدداً ثبت شوند. وجود بازه سازگار در `pyproject.toml` معادل سازگاری عملی نیست.

## تصمیم Topology

یک Bench/Site واحد از نظر بازه‌های اعلام‌شده محتمل است، اما برای Office **هنوز قابل تأیید نیست**. مسیر کم‌ریسک: یک محیط Staging ایزوله با یک F17 پین‌شده بسازید و نصب ترکیبی Frappe + ERPNext + Helpdesk + Telephony را روی site آزمایشی اثبات کنید؛ Insights را سپس با دو مسیر مقایسه کنید:

1. نصب روی همان Site فقط اگر app install، migrations، assets، permissions و تست‌های integration همه موفق شوند.
2. اگر dependency، دسترسی یا بار خواندن ناسازگار بود، Insights را در Site/سرویس جدا نگه دارید و با دسترسی read-only یا replica به منبع Frappe متصل کنید.

ClickHouse از کد Insights به‌عنوان connector خارجی اختیاری پشتیبانی می‌شود، اما اجباری‌بودن آن برای Office ثابت نشده و در Compose توسعه Insights سرویس ClickHouse دیده نشده است. آن را به زیرساخت لازم اضافه نکنید مگر نیاز واقعی محصول اثبات شود.

## Staging و Release Gates

1. شبکه، Site، DB، Redis، volumes و حساب‌های آزمایشی جداگانه؛ بدون کپی Production در گام اول.
2. نسخه‌های پین‌شده: Frappe، ERPNext، Helpdesk، Telephony، Insights، Python، Node، MariaDB و Redis؛ ثبت SHA و image digest.
3. Outbound email، webhook و scheduler/jobهای عملیاتی در Staging مهار شوند.
4. نصب همه Apps و اجرای migrations فقط روی دیتابیس تازه Staging؛ آزمون clean restore با داده مصنوعی.
5. آزمون Login، نقش/مجوز، API، assets، background jobs، یکپارچگی تیکت/ERP، خواندن Insights، RTL و جلالی.
6. ساخت و بازیابی Backup دیتابیس و فایل‌های public/private در محیط ایزوله؛ ثبت زمان، checksum و نتیجه restore.
7. پیش از Release Candidate: پذیرش کاربر، آزمون ارتقا از نسخه قبلی، بررسی امنیت، ظرفیت و تعیین rollback ref/image digest.
8. برای Production آینده: تغییر فقط با مجوز صریح جداگانه، پنجره نگهداری، health checks و rollback تمرین‌شده. Rollback پس از تغییر schema ممکن است به restore نیاز داشته باشد؛ downgrade کورکورانه امن نیست.

Compose توسعه Helpdesk با MariaDB 10.8 و `frappe/bench:latest` مبنای مناسب F17 Office نیست. baseline پیشنهادی برای بررسی Staging از ورودی‌های رسمی F17 و imageهای immutable تهیه شود؛ از `latest` استفاده نشود.

## مسیر فعلی و حفاظت

`helpdesk.ircarpet-r.com` در این مأموریت فقط به‌عنوان سیستم موجود شناسایی شده و هیچ اتصال، read/write، restart، migration یا deploy به آن انجام نشده است. وضعیت ERPNext Stage و توپولوژی سرور هم از GitHub قابل اثبات نبود و باید در فاز Discovery عملیاتی، فقط‌خواندنی بررسی شود.

## پورتال Office، ورود و دسترسی

- **هویت واحد:** اگر اپ‌ها روی یک Frappe Site باشند، از User و Session همان Site استفاده شود؛ کاربر یا Session موازی برای App Launcher ساخته نشود. نقش‌های مشترک فقط دسترسی پایه بدهند و مجوزهای هر اپ در خود اپ باقی بمانند.
- **App Launcher:** فهرست برنامه‌ها از مجوز واقعی کاربر تولید شود. پنهان‌کردن Tile فقط تجربه کاربری است و جایگزین مجوز سمت سرور نیست. مسیرهای Helpdesk، ERPNext و Insights باید پیش از نمایش با دسترسی همان کاربر بررسی شوند.
- **RBAC:** ماتریس نقش پیشنهادی شامل «کاربر پشتیبانی»، «کارشناس Helpdesk»، «فروش/مالی ERP»، «مدیر سیستم» و «تحلیل‌گر Insights» است؛ این نام‌ها صرفاً طرح‌اند و تا کشف نقش‌های موجود به‌عنوان Role واقعی ثبت یا ایجاد نمی‌شوند.
- **Insights جداگانه:** اگر به دلیل وابستگی یا بار خواندن روی Site جدا نصب شود، ورود یکپارچه فقط با سازوکار SSO پشتیبانی‌شده و آزمون‌شده انجام شود. دسترسی داده با حساب سرویس read-only/replica محدود باشد؛ Secret مشترک، دسترسی DB عمومی یا دورزدن Permissionهای Frappe مجاز نیست.
- **گیت پذیرش:** آزمون چند کاربر با نقش‌های متفاوت، دسترسی مستقیم URL، API، پایان Session، خروج سراسری/محلی، غیرفعال‌شدن کاربر و عدم نشت داده بین اپ‌ها لازم است. تا آن زمان App Launcher و SSO در حد طراحی باقی می‌مانند.

## موانع و تصمیم‌های لازم

- نصب و Migration ترکیبی چهار اپ روی F17 هنوز آزمایش نشده است.
- سازگاری دقیق Telephony با SHA نامزد F17 نامشخص است.
- پیکربندی replica/credentials و سقف بار Insights مشخص نشده.
- دسترسی‌ها، backups، restore، SSL/DNS و ظرفیت Stageهای موجود در این مأموریت بررسی نشده‌اند.
- پیش از Stage واقعی باید نام/مالک محیط Stage، منابع مجاز و سیاست داده آزمایشی مشخص شوند.

## منابع

- [پیش‌نیازهای Frappe Framework](https://docs.frappe.io/framework-git/getting-started/prerequisites)
- [راهنمای نصب Frappe](https://docs.frappe.io/books/installation)
- [Frappe `develop` pyproject](https://github.com/frappe/frappe/blob/develop/pyproject.toml)
- `pyproject.toml` در شاخه‌های محصول بررسی‌شده Helpdesk، ERPNext و Insights.
- `compat-matrix.yml` در Insights؛ این ماتریس ترکیب Frappe 17 را بررسی می‌کند، نه نصب هم‌زمان سه اپ.
