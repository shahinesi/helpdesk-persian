# معماری وابستگی‌های Frontend و Patchها

## دو منبع UI متفاوت

`frappe/ui` بخشی از Source مخزن Frappe است و Helpdesk با وابستگی محلی `@framework/ui: link:../../frappe/ui` به آن وصل می‌شود. `frappe-ui` پکیج مستقلی از Yarn با نسخه `1.0.0-rc.1` است. این دو کد در مسیرهای جدا نصب می‌شوند و Patch یکسان یا Package واحد نیستند.

## نسخه‌های مبنا

| بخش | مقدار ثبت‌شده |
|---|---|
| Helpdesk branch | `feat/persian-setup-wizard`؛ SHA انتشار در manifest هر استقرار ثبت می‌شود |
| Frappe UI source | `frappe/frappe` SHA `c4472b622192e0b1cbdbaa9792a38f4e5006e9f6`، در `desk/patches/frappe-ui-source.ref` |
| `frappe-ui` | `1.0.0-rc.1`، tarball integrity در `desk/yarn.lock` |
| Vue / Vite / TypeScript | 3.5.31 / 5.4.21 / 5.9.3 |
| Node / Yarn | 20.20.0 / 1.22.18، در `.nvmrc` و `packageManager` |

## راهبرد Patch

| هدف | فایل نسخه‌بندی‌شده | روش اعمال | پوشش |
|---|---|---|---|
| Frappe `ui/` | `desk/patches/frappe-ui-framework.diff` | `desk/scripts/apply-ui-patches.sh` از ریشه مخزن Frappe؛ پین SHA در checkout دارای Git اعتبارسنجی می‌شود | Activity timeline، نمایش متن تغییرات، ارقام و تمام متن‌ها و برچسب‌های onboarding و Help Center |
| پکیج `frappe-ui` | `desk/patches/frappe-ui+1.0.0-rc.1.patch` | `patch-package` در `postinstall` | ۳۷ فایل؛ Jalali picker، RTL، متن‌های انتخاب، فونت Vazirmatn، نمودارها، Editor و کنترل‌های مشترک |

Patchها پس از ممیزی در دو Artifact ادغام شدند. Patchهای قدیمی حذف‌شده در Git bundle بازیابی‌پذیرند؛ قابلیت‌هایشان در Patch ادغام‌شده یا خود upstream حضور دارد. Patch اعمال‌نشده با خطا Build را متوقف می‌کند. اسکریپت Build نسخه `frappe-ui` را بررسی می‌کند و Patchهای منبع Frappe را فقط یک‌بار اعمال می‌کند.

## Build تمیز

از ریشه `frappe-bench/apps/helpdesk/desk` اجرا کن:

```sh
yarn install --frozen-lockfile --non-interactive
yarn apply:ui-patches
yarn apply:ui-patches
yarn build
```

مسیر نسبی `@framework/ui` به وجود sibling در `frappe-bench/apps/frappe/ui` وابسته است. Workflow `persian-clean-build.yml` روی commit `af3ed4a2de6f3698e21f2ccb909f4aca1be20236` با cache خالی، Frappe source pin ثابت، نصب `--frozen-lockfile`، دو بار اجرای Patch و `yarn build` موفق شد. این مدرک، Clean Frontend Build را تأیید می‌کند؛ جایگزین Full Docker Build، تست کامل Backend یا Runtime پذیرش نیست.

### ساخت image با Docker

`docker/HelpdeskPersian.Containerfile` پیش از Build، `frappe/ui` را به‌صورت sparse از همان SHA در `frappe-ui-source.ref` دریافت و SHA را اعتبارسنجی می‌کند. Node `20.20.0` و Yarn `1.22.18` از مرحلهٔ Node رسمی و نسخه‌بندی‌شده می‌آیند؛ Node 20 فقط برای نصب قفل‌شدهٔ وابستگی‌های Desk در prefix جدا استفاده می‌شود. پیش از نصب، کل `desk/node_modules` image پایه حذف می‌شود تا نصب از Lockfile به ماژول‌های باقی‌مانده وابسته نباشد. مرحلهٔ نهایی، Node `24.21.0` موجود در image پایه را برای `bench build` نگه می‌دارد، چون bundler این خط Node `>=24` می‌خواهد. اگر ref یا Patch ناسازگار باشد، Build متوقف می‌شود.

این recipe به image پایهٔ موجود `helpdesk-persian:styled` نیاز دارد و نسخهٔ دقیق آن باید در manifest استقرار ثبت شود. image `runtime-324a2e118` ساخته و روی stack تست اجرا شد، اما آن build هنوز `node_modules` به‌ارث‌رسیده از image پایه داشت؛ پس Clean Docker Install محسوب نمی‌شود. اصلاح فعلی کل پوشه را پیش از نصب پاک می‌کند و باید با Build تازه اعتبارسنجی شود.

## ارتقا و بازگشت

برای تغییر Frappe یا `frappe-ui`، ابتدا نسخه و ref را در یک branch آزمایشی به‌روزرسانی کن؛ تمام Patchها را از نصب خالی اعمال کن و Build و تست‌های RTL/Jalali/English را اجرا کن. عدم تطبیق Patch باید به Failure منجر شود؛ حذف خودکار Patch، `|| true` یا استفاده از `node_modules` قبلی مجاز نیست.

فعلاً Fork جدا برای `frappe-ui` نساختیم: نسخه پکیج دقیقاً pin است، Patch package واحد است و CI نصب تمیز و applicability را کنترل می‌کند. اگر آپدیت‌های بعدی مرتباً Conflict ایجاد کرد یا مصرف‌کننده‌های دیگری همین Patchها را خواستند، Fork اختصاصی گزینه مناسب‌تری خواهد بود.
