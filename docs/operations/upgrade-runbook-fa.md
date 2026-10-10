# Runbook ارتقا

1. `upstream-sync.yml` را دستی اجرا یا منتظر اجرای زمان‌بندی‌شده بمان.
2. Mirrorهای `vendor/*` و SHAهای Upstream را بررسی کن.
3. Proposal مربوط به خط فارسی را باز کن؛ تغییرات Patch و Migration را جداگانه مرور کن.
4. Clean install را با Yarn و lockfile اجرا کن. Patch ناسازگار باید Build را متوقف کند.
5. Build فرانت‌اند و تست‌های Backend/UI پروژه را اجرا کن.
6. نسخه نامزد را در Staging مجزا با DB/ایمیل/Webhook ایزوله آزمایش کن.
7. پس از پذیرش، Backup تازه بگیر و انتشار را با SHA/digest مشخص انجام بده.
8. تست پس از Deploy و برنامه Rollback را اجرا و ثبت کن.

ارتقای خط `main` Runbook مستقلی می‌خواهد؛ تا زمانی که `custom/main-fa` و pin وابستگی‌های مخصوص Frappe 15/16 آماده و تست نشده‌اند، از خط `develop` چیزی به `main` منتقل نکن.
