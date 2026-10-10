# همگام‌سازی Upstream

## اجرای فعلی

Workflow در `.github/workflows/upstream-sync.yml` در شاخه فارسی فعلی برای اجرای روزانه و دستی تعریف شده است. ابتدا `main`، `main-hotfix`، `develop` و `legacy` را از `frappe/helpdesk` می‌گیرد و Mirrorهای `vendor/*` را فقط در صورت امکان Fast-forward به‌روزرسانی می‌کند. تاریخچه جلوتر یا واگرا باعث توقف و خطای روشن می‌شود؛ هیچ Force Push انجام نمی‌شود. در ۹ اکتبر ۲۰۲۶، این فایل روی Default Branch (`develop`) وجود نداشت؛ بنابراین Schedule خودکار و `workflow_dispatch` از Default Branch فعال نیستند.

اگر `vendor/develop` تغییر کند و `custom/develop-fa` هنوز آن را نداشته باشد، Workflow شاخهٔ ثابت `sync/upstream-develop-fa` را می‌سازد یا جلو می‌برد و Draft PR متناظر را ایجاد یا به‌روزرسانی می‌کند. برای خط پایدار نیز همین مسیر مستقل از `vendor/main` به `custom/main-fa` و شاخهٔ `sync/upstream-main-fa` آماده است؛ تا پیش از ایجاد `custom/main-fa` فقط با پیام روشن رد می‌شود. Merge Conflict باعث توقف پیش از Push می‌شود. هیچ Merge خودکار یا Deployment خودکاری فعال نیست. `main-hotfix` و `legacy` فقط Mirror می‌شوند.

در حال حاضر Proposal پایدار ساخته نمی‌شود، چون `custom/main-fa` هنوز وجود ندارد و سازگاری فارسی‌سازی با وابستگی‌های خط `main` اثبات نشده است. برای فعال‌شدن Schedule، Workflow باید پس از بازبینی روی Default Branch قرار بگیرد؛ پیش از آن، `workflow_dispatch` نیز به‌دلیل نبود Workflow در Default Branch در GitHub قابل اجرا نیست.

## کنترل سلامت

- Mirror باید یا برابر Upstream باشد یا Fast-forward شود.
- Proposal باید به خط فارسی متناظر متصل باشد.
- Patchها، تغییر وابستگی‌ها، Migrationها و تست‌های CI باید در PR دیده شوند.
- شاخه upstream ناموجود یا تاریخچه واگرا باید Failure بدهد، نه اینکه شاخه موجود را بازنویسی کند.
