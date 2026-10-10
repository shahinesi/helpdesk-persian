# همگام‌سازی Upstream

## سیاست

فقط `frappe/helpdesk:develop` وارد جریان روزانه می‌شود. مقصد آینه `vendor/develop` است و مقصد پیشنهاد تغییر `custom/develop-fa`. هیچ ادغام یا Deploy خودکاری به شاخه محصول وجود ندارد. شاخه `develop` پیش‌فرض فقط میزبان Workflow است و خود Workflow تنها با PR مستقل وارد آن می‌شود.

## اجرای روزانه و دستی

`.github/workflows/upstream-sync.yml` برای اجرای روزانه و `workflow_dispatch` آماده است. Workflow SHA رسمی را از `frappe/helpdesk:develop` می‌گیرد و فقط اگر SHA موجود `vendor/develop` نیای `SHA رسمی` باشد، آن را Fast-forward می‌کند. اگر آینه جلوتر یا واگرا باشد، اجرا با خطا می‌ایستد و Branch را بازنویسی نمی‌کند.

پس از همگام‌سازی، Workflow با ادغام آزمایشی upstream در شاخه نامزد `sync/upstream-develop-fa` یک Draft PR به `custom/develop-fa` ایجاد یا به‌روزرسانی می‌کند. نامزد شامل SHA مبنا، SHA رسمی، SHA ادغام‌شده و وضعیت تست است. Conflict باعث توقف پیش از Push/PR می‌شود. PRهای باز تکراری ساخته نمی‌شوند.

CI نامزد باید نصب وابستگی‌ها، پین Frappe/Telephony، اعمال Patchها، Build، ترجمه، RTL، Jalali، تست Backend و Playwright را اجرا کند. موفقیت Workflow به معنی تأیید Merge نیست. Merge و انتشار نیازمند بازبینی انسانی‌اند.

زمان‌بندی GitHub Actions فقط وقتی فعال می‌شود که نسخه Workflow روی شاخه پیش‌فرض باشد. این نسخه ابتدا در PR کوچک مستقل ارائه می‌شود؛ Default Branch تغییر نمی‌کند و PR بدون تأیید مالک Merge نمی‌شود.

## عیب‌یابی

- `vendor/develop` واگرا یا جلوتر از Upstream: تاریخچه را بررسی کن؛ Force-push نکن.
- Merge conflict در نامزد: فایل‌های متعارض، migrations، API/dependencies و patchهای RTL/Jalali را دستی بررسی کن؛ Conflict را با انتخاب کورکورانه حل نکن.
- CI ناموفق: Draft PR برای Merge آماده نیست؛ SHA و لاگ مرحله شکست را ثبت کن.
- SHA Frappe عوض شده: Patchهای `frappe/ui` باید روی ref جدید دوباره آزموده شوند؛ صرفاً به‌روزرسانی ref کافی نیست.
