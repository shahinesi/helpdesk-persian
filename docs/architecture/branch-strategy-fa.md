# راهبرد شاخه‌های Helpdesk فارسی

تاریخ ممیزی: ۹ اکتبر ۲۰۲۶

## وضعیت فعلی

| شاخه | وضعیت مشاهده‌شده | کاربرد |
|---|---|---|
| `main` | هم‌تراز `upstream/main`، نسخه 1.30.1 | خط پایدار رسمی |
| `main-hotfix` | هم‌تراز `upstream/main-hotfix` | اصلاح‌های نسخه پایدار |
| `develop` | پنج Commit جلوتر از `upstream/develop` | شاخه پیش‌فرض Fork و مبنای PR فعلی |
| `legacy` | هم‌تراز `upstream/legacy` | نگهداری خط قدیمی |
| `vendor/main` | هم‌تراز `upstream/main` | Mirror پایدار؛ بدون تغییر اختصاصی |
| `vendor/main-hotfix` | هم‌تراز `upstream/main-hotfix` | Mirror اصلاح‌های نسخه پایدار |
| `vendor/develop` | هم‌تراز `upstream/develop` | Mirror توسعه |
| `vendor/legacy` | هم‌تراز `upstream/legacy` | Mirror خط قدیمی |
| `custom/develop-fa` | ۱۱۹ Commit جلوتر و بدون عقب‌ماندگی نسبت به Upstream | نسخه فارسی توسعه |
| `custom/main-fa` | وجود ندارد | تا اثبات سازگاری ایجاد/اعلام نمی‌شود |
| `feat/persian-setup-wizard` | PR شماره ۱، باز | شاخه تغییرات فارسی فعلی |

Default Branch روی `develop` باقی می‌ماند؛ تغییرش تا آماده‌شدن خط پایدار فارسی انجام نمی‌شود. `main` و `develop` دو خط مستقل‌اند: وابستگی Helpdesk در `main` به Frappe 15/16 و Python 3.10+ محدود است، در حالی که `develop` به Frappe 16/17 و Python 3.14 نیاز دارد.

## جریان نگهداری

```mermaid
flowchart TD
  U1[Upstream main] --> V1[vendor/main]
  U2[Upstream develop] --> V2[vendor/develop]
  V2 --> P2[پیشنهاد PR به custom/develop-fa]
  P2 --> C2[CI و بازبینی انسانی]
  C2 --> S2[Staging با SHA ثابت]
  S2 --> A[تأیید انتشار]
  A --> D[انتشار کنترل‌شده]
  V1 --> P1[custom/main-fa پس از سازگارسازی مستقل]
```

Mirrorهای `vendor/*` فقط با Fast-forward به‌روزرسانی می‌شوند. شاخه‌های فارسی با Merge یا PR مستقل، بدون Force Push و بدون ادغام متقاطع `main` و `develop` نگهداری می‌شوند. CI و ساخت Proposal به‌تنهایی مجوز Merge یا Deploy نیستند.
