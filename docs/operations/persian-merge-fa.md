# ورود تغییرات به شاخه فارسی

تغییرات Helpdesk از `upstream/develop` ابتدا در `vendor/develop` Mirror می‌شوند؛ سپس فقط یک Proposal به `custom/develop-fa` ساخته می‌شود. تغییرات `upstream/main` هرگز با `develop` یا `custom/develop-fa` ادغام نمی‌شوند.

برای هر Proposal:

1. SHA مبنا و SHA مقصد Upstream را ثبت کن.
2. فایل‌های ترجمه، RTL، تاریخ جلالی، API، وابستگی، Migration و Patchهای Frappe UI را بازبینی کن.
3. Conflict را در شاخه Proposal حل کن؛ تاریخچه شاخه اصلی را بازنویسی نکن.
4. Clean install، Patch gate، Frontend build و تست‌های موجود را اجرا کن.
5. CI موفق و بازبینی انسانی را پیش‌شرط Merge قرار بده.
6. پس از Merge، Staging و پذیرش Runtime انجام بده؛ سپس انتشار با SHA ثابت برنامه‌ریزی شود.

تغییرات عمومی که در هر دو خط لازم‌اند باید جداگانه با API و وابستگی‌های همان خط سازگار شوند؛ Cherry-pick کور یا Merge متقاطع پذیرفته نیست.
