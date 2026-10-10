# معماری وابستگی‌ها و Build فارسی

## نسخه‌ها و منبع حقیقت

| بخش | نسخه/مرجع |
|---|---|
| Helpdesk | شاخه `custom/develop-fa`؛ Build نامزد با SHA کامل Helpdesk |
| Frappe 17 | `frappe/frappe` روی SHA ثبت‌شده در `desk/patches/frappe-ui-source.ref`؛ فعلاً `5b9f9e57232612b092b0dc0bf05dcec78bf4997d` |
| Python | `>=3.14,<3.15` طبق `pyproject.toml` Frappe/Helpdesk |
| Telephony | `frappe/telephony` روی SHA در `desk/patches/telephony-source.ref` |
| ERPNext تست Backend | SHA در `desk/patches/erpnext-source.ref`؛ فقط برای تست‌هایی که این اپ را لازم دارند |
| `frappe-ui` | `1.0.0-rc.1`، نسخه و integrity در `desk/yarn.lock` |
| Node / Yarn | Node 20.20.0 برای Desk lockfile، Node 24.14.0 برای Bench، Yarn 1.22.18 |

`frappe/ui` بخشی از سورس مخزن Frappe است و با وابستگی محلی `@framework/ui: link:../../frappe/ui` استفاده می‌شود. `frappe-ui` پکیج مستقل Yarn است. Patchهای این دو مقصد جدا هستند و نباید با هم ادغام شوند.

## Patch inventory

| هدف | مسیر | روش | کنترل |
|---|---|---|---|
| Frappe `ui/` | `desk/patches/frappe-ui-framework.diff` | `desk/scripts/apply-ui-patches.sh` روی checkout Frappe | SHA منبع و reverse applicability بررسی می‌شوند؛ اعمال تکراری idempotent است |
| `frappe-ui` | `desk/patches/frappe-ui+1.0.0-rc.1.patch` | `patch-package` در `postinstall` | نسخه package و اعمال patch در clean install بررسی می‌شوند |
| اسکریپت‌های runtime | `docker/entrypoint.sh`, `docker/start.sh` | داخل Containerfile | کپی‌شده از `frappe/frappe_docker` روی SHA `docker/frappe-docker-source.ref` |

## Clean Docker Build

`docker/HelpdeskPersian.Containerfile` دیگر به image محلی `helpdesk-persian:styled` وابسته نیست. Base و Builder رسمی Frappe 17 از GHCR با manifest digest ثابت دریافت می‌شوند. Containerfile نسخه‌های دقیق Frappe و Telephony را از ref fileها می‌خواند، Helpdesk را با SHA ورودی می‌گیرد، dependencyها را از lockfile نصب می‌کند، patchها را اعمال می‌کند و assetها را می‌سازد. `.github/workflows/persian-docker-build.yml` همین فرایند را در BuildKit روی runner تمیز اجرا می‌کند و image را Push یا Deploy نمی‌کند.

اجرای این Workflow برای تغییرات فعلی هنوز انجام نشده است؛ بنابراین Clean Docker Build فعلاً **UNVERIFIED** است. اجرای محلی هم ممکن نیست چون Docker daemon روی میزبان در دسترس نیست. نتیجه نهایی فقط پس از اجرای موفق GitHub Actions قابل PASS است.

## Build فرانت‌اند مستقل

`.github/workflows/persian-clean-build.yml` یک checkout جدا برای Helpdesk و Frappe می‌سازد، ref دقیق Frappe را checkout می‌کند، `yarn install --frozen-lockfile` را با cache خالی اجرا می‌کند، idempotency patch را می‌سنجد و Vite را Build می‌کند. این تست معادل Build کامل Docker یا Runtime نیست.

## ارتقا و بازگشت

برای ارتقای Frappe، Telephony، `frappe-ui` یا imageهای Build:

1. Ref/version را در شاخه نامزد تغییر بده.
2. Clean frontend و Docker build را اجرا کن.
3. تست ترجمه، RTL، Jalali، Backend و Playwright را بررسی کن.
4. Patch ناسازگار را با حذف/نادیده‌گرفتن دور نزن؛ نامزد باید شکست بخورد تا Patch اصلاح شود.
5. برای هر انتشار SHA برنامه و image digest را ثبت کن؛ قبلی را برای Rollback نگه دار.

فعلاً Fork جدا از `frappe-ui` لازم نیست: یک patch versioned برای package و یک diff برای Frappe source استفاده می‌شود. اگر آپدیت‌های آتی به‌طور مکرر conflict ایجاد کنند، این تصمیم را با داده‌های واقعی بازبینی کن.
