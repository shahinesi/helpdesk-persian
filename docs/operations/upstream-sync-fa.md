# همگام‌سازی Upstream

## اجرای فعلی

Workflow در `.github/workflows/upstream-sync.yml` برای اجرای روزانه و دستی تعریف شده است. ابتدا `main`، `main-hotfix`، `develop` و `legacy` را از `frappe/helpdesk` می‌گیرد و Mirrorهای `vendor/*` را فقط در صورت امکان Fast-forward به‌روزرسانی می‌کند. تاریخچه جلوتر یا واگرا باعث توقف و خطای روشن می‌شود؛ هیچ Force Push انجام نمی‌شود.

اگر `vendor/develop` تغییر کند و `custom/develop-fa` هنوز آن را نداشته باشد، Workflow یک شاخه ثابت `sync/upstream-develop-fa` می‌سازد یا جلو می‌برد و یک Draft PR به `custom/develop-fa` ایجاد یا به‌روزرسانی می‌کند. Merge Conflict باعث توقف پیش از Push می‌شود. هیچ Merge خودکار یا Deployment خودکاری فعال نیست.

در حال حاضر برای `custom/main-fa` Proposal ساخته نمی‌شود، چون شاخه وجود ندارد و وابستگی‌های خط `main` با خط `develop` متفاوت‌اند. Workflow زمان‌بندی‌شده پس از قرارگرفتن در Default Branch فعال خواهد شد؛ تا آن زمان می‌توان آن را با `workflow_dispatch` آزمایش کرد.

## کنترل سلامت

- Mirror باید یا برابر Upstream باشد یا Fast-forward شود.
- Proposal باید به خط فارسی متناظر متصل باشد.
- Patchها، تغییر وابستگی‌ها، Migrationها و تست‌های CI باید در PR دیده شوند.
- شاخه upstream ناموجود یا تاریخچه واگرا باید Failure بدهد، نه اینکه شاخه موجود را بازنویسی کند.
