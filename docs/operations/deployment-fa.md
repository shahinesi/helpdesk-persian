# Runbook انتشار

## وضعیت فعلی

Stack مشاهده‌شده روی میزبان `carpet-erp` با Compose project به‌نام `helpdesk-persian-test` اجرا می‌شود. سرویس‌های frontend، backend، workerها و scheduler اکنون از Image `helpdesk-persian:runtime-b978318cd` با شناسه `sha256:8a4ed272e5f8661bb270ed6b5930ed5fab692d385dc2d67abd01bcb1c9a3066d` استفاده می‌کنند. همین Stack برای دامنه `helpdesk.ircarpet-r.com` در Traefik route دارد؛ بنابراین نام `test` به‌تنهایی ثابت نمی‌کند داده‌ها آزمایشی‌اند.

در ۹ اکتبر ۲۰۲۶ نسخه `b978318cd83e249ba24d7702dd1be862a1596345` به همین Stack منتشر شد؛ به‌دلیل route عمومی، آن را انتشار روی محیط متصل به دامنه در نظر بگیر، نه Staging ایزوله. فقط شش سرویس برنامه بازسازی شدند؛ دیتابیس، Redis و Volumeها دست‌نخورده ماندند و Migration اجرا نشد. قبل از تغییر Backup دیتابیس، فایل‌های public/private و تنظیمات سایت تهیه شد. فشرده‌سازی DB، فهرست TARها و JSON تنظیمات اعتبارسنجی شدند؛ Restore آزمایشی انجام نشده است. شناسه، هش فایل‌ها و شواهد در manifest روی سرور ثبت شده‌اند.

در بررسی فعلی شاخه `feat/persian-setup-wizard` و سرور روی SHA `b978318cd83e249ba24d7702dd1be862a1596345` هستند. Lint، Server و Clean Frontend Build موفق‌اند. هر دو shard تست Playwright تمام شده‌اند: shard اول موفق و shard دوم ناموفق است؛ یک تست فیلتر فهرست تیکت، ردیف مورد انتظار را پیدا نکرد (`e2e/tests/tickets/list/filter-field-types.spec.ts:225`). این شکست در مسیر Settings نیست، اما وضعیت CI را قرمز نگه می‌دارد و علتش هنوز رفع نشده است. Build کامل image روی میزبان موفق شد، ولی به image پایه محلی `helpdesk-persian:styled` وابسته است؛ بنابراین از یک host خالی بازتولیدپذیر نیست. فضای آزاد پیش از Build حدود 6.8 GB و پس از آن حدود 6.5 GB بود؛ Image حدود 14.2 GB است. پاک‌سازی image یا volume انجام نده.

## انتشار مجاز پس از پذیرش

1. SHA و Image digest نامزد انتشار را ثبت کن.
2. از دیتابیس، فایل‌های Public/Private و تنظیمات سایت Backup بگیر و checksum، خوانایی و در صورت امکان Restore ایزوله را تأیید کن.
3. اختلاف Compose و Volumeها را ثبت کن؛ سرویس دیتابیس را بازسازی یا Volume را حذف نکن.
4. Image را با برچسب SHA بساز؛ از `latest` استفاده نکن.
5. پیش از Deploy به دامنه عمومی، نقش و جداسازی محیط را اثبات کن؛ صرفاً `test` بودن نام Stack کافی نیست.
6. Persian/RTL، Login، تیکت‌ها، فایل‌ها، API، Worker و لاگ‌ها را بررسی کن.
7. Production فقط بعد از پذیرش صریح نسخه و اثبات سازگاری Migration منتشر شود.

## وضعیت نامزد فعلی

Candidate فعلی روی همان Branch build و Deploy شده است. `bench build --apps frappe,helpdesk` پس از حذف `desk/node_modules` و نصب lockfile موفق شد؛ سورس `frappe/ui` از SHA پین‌شده دریافت شد و Patchها اعمال شدند. این Build از image پایه محلی `helpdesk-persian:styled` استفاده کرد، پس Clean Build مستقل از میزبان هنوز اثبات نشده است. CI clean frontend build موفق است. سرور از SHA فعلی است؛ دیتابیس، تنظیمات سایت و Volumeها تغییر نکرده‌اند.
