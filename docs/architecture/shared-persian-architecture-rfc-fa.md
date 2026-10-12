# RFC: زیرساخت فارسی مشترک Frappe و Frappe UI

**وضعیت:** طرح برای بازبینی؛ اجرای آن نیازمند تأیید مالک محصول است
**مبنای بررسی Helpdesk:** شاخه `custom/develop-fa`، SHA `e56ff43a81173c4723c7eef029ea8e759d777ade`
**دامنه:** تحقیق سورس؛ هیچ کد یا رفتار محصولی در این RFC تغییر نکرده است.

## خلاصه تصمیم پیشنهادی

زیرساخت را به دو مرز نگهداری تقسیم کنیم: قابلیت‌های عمومی Framework در `frappe-persian` یا Upstream رسمی Frappe؛ کنترل‌های Vue و الگوهای مشترک رابط در `frappe-ui-persian`. واژگان و جریان‌های Helpdesk در خود Helpdesk بمانند. انتقال باید تدریجی و پشت نسخه‌های پین‌شده باشد؛ تا وقتی آزمون مصرف‌کننده‌ها قبول نشده، Patchهای فعلی حذف نشوند.

## موجودی موجود در Helpdesk

| قابلیت | محل فعلی | مقصد پیشنهادی |
|---|---|---|
| کاتالوگ اختصاصی، حدود ۲٬۲۸۴ پیام `msgid` | `helpdesk/locale/fa.po` | Helpdesk؛ واژگان تیکت و عملیات آن عمومی نیستند. |
| بارگذاری ترجمه Desk و جایگزینی پارامترها | `desk/src/translation.ts`، `helpdesk/api/general.py` | قرارداد عمومی Locale در Framework؛ اتصال و ترجمه دامنه‌ای در اپ مصرف‌کننده. |
| ترتیب بارگذاری ترجمه پیش از import اپ و Locale روز.js | `desk/src/main.js` | API/Extension point رسمی Frappe UI؛ حفظ ترتیب در مصرف‌کننده. |
| پیش‌فرض فارسی در Setup تازه | `helpdesk/setup/setup_wizard.py`، `helpdesk/hooks.py` | سیاست نصب عمومی در Frappe Persian؛ Helpdesk نباید تنظیمات سایت موجود را بازنویسی کند. |
| `dir` و فونت Vazirmatn | `desk/src/index.css`، `desk/src/main.js`، `helpdesk/public/css/persian-font.css` | Direction و فونت عمومی در Frappe UI Persian؛ وصله Sidebar ویژه Helpdesk در خود اپ بماند. دو تعریف فونت و CSS تکراری نیازمند حذف فقط پس از مهاجرت موفق‌اند. |
| نمایش جلالی و بازه تاریخ | `desk/src/utils.ts` | API presentation مشترک در Frappe UI Persian؛ ورودی و خروجی API همچنان Gregorian/ISO. |
| قالب‌بندی عدد و رقم فارسی | `desk/src/utils/number.ts` | formatter مشترک UI، با حفظ مقادیر canonical و حالت‌های null/zero. |
| Date/DateRange/DateTime و کنترل‌های مشترک | `desk/patches/frappe-ui+1.0.0-rc.1.patch` | ابتدا API رسمی؛ در صورت نبود extension point، Patch نسخه‌بندی‌شده یا Fork Frappe UI Persian. |
| Activity Timeline و Onboarding در `frappe/ui` | `desk/patches/frappe-ui-framework.diff` | سورس Framework است و باید جداگانه در Frappe Persian یا PR رسمی نگهداری شود؛ با پکیج npm یکی نیست. |
| تعطیلات، نمودار داشبورد، ایمیل، فرم‌ها و واژگان Helpdesk | `desk/src/pages/dashboard/` و اجزای Helpdesk | Helpdesk؛ فقط formatterها و primitiveهای عمومی استخراج شوند. |

نسخه‌های ثبت‌شده در Lockfile بررسی‌شده: `frappe-ui@1.0.0-rc.1`، `jalaali-js@2.0.1` و `@persian-tools/persian-tools@4.0.4`. منبع `frappe/ui` جدا از بسته npm است و در snapshot با SHA `5b9f9e57232612b092b0dc0bf05dcec78bf4997d` مشخص شده. Patch بسته npm شامل ۳۷ فایل و حدود ۴٬۱۲۶ خط؛ Patch Framework چهار فایل و حدود ۳۸۲ خط است. این گستردگی هزینه ارتقا را بالا می‌برد و حذف یکجای Patchها را ناموجه می‌کند.

## معماری و وابستگی

```text
Frappe Persian / upstream Frappe
  ├─ locale، gettext، تنظیمات نصب تازه و ترجمه عمومی Desk
  └─ سورس مستقل frappe/ui: Timeline و Onboarding عمومی

Frappe UI Persian (نسخه/SHA پین‌شده)
  ├─ RTL، Vazirmatn، Form/Select/Dialog/Tooltip/Calendar
  ├─ formatter نمایشی تاریخ و عدد
  └─ مصرف‌کننده‌ها: Helpdesk؛ سپس Insights و CRM پس از اثبات مصرف واقعی

Helpdesk Persian
  ├─ fa.po و منطق/متن دامنه‌ای Helpdesk
  ├─ API اتصال ترجمه و جریان Setup مخصوص Helpdesk
  └─ مصرف‌کننده لایه‌های مشترک پس از آزمون برابری رفتار
```

## ترتیب اجرایی و معیار عبور

1. Patchهای فعلی را به سه دسته Framework، UI عمومی و Helpdesk-specific تفکیک و برای هر فایل مالک و تست ثبت کنید.
2. قرارداد واحد Locale/Direction و formatterها را تعریف کنید. Date UI فقط نمایش را جلالی کند و مقدار ذخیره/ارسال همچنان ISO/Gregorian باشد.
3. API رسمی Frappe UI را برای slots، props و locale بررسی کنید. قابلیت‌های رسمی را به Patch تبدیل نکنید.
4. اگر بخش بزرگی از Patch عمومی همچنان لازم بود، Frappe UI Persian را با نام/API سازگار و نسخه‌های صریح نگهداری کنید؛ Patchهای `frappe/ui` همچنان مستقل بمانند.
5. یک مصرف‌کننده آزمایشی Helpdesk با dependency پین‌شده بسازید؛ Patchها تا برابری بصری و رفتاری باقی بمانند.
6. پس از Helpdesk، Insights و CRM را فقط براساس dependency واقعی ارزیابی کنید. ERPNext/HRMS الزاماً مصرف‌کننده این کتابخانه Vue نیستند.
7. هر مرحله باید clean install/build، pin SHA و راه بازگشت به نسخه قبلی داشته باشد. هیچ آپدیت Upstream یا انتشار خودکاری پذیرفته نشود.

## مجموعه آزمون مشترک

- ترجمه فارسی/انگلیسی، تغییر Locale بدون متن stale، placeholder و پارامترها.
- RTL/LTR در Select، Combobox، جدول، Dialog، Tooltip، منو، Focus و صفحه‌کلید.
- Vazirmatn در ورودی، جدول، نمودار، Tooltip و صفحه عمومی.
- تقویم جلالی: ابتدا/انتهای ماه و سال، سال کبیسه، بازه، timezone تهران و مرز نیمه‌شب؛ payload باید Gregorian/ISO بماند.
- عددهای صفر/null، درصد، جداکننده‌ها، رشته ترکیبی فارسی/لاتین.
- Empty/loading/error، نمودار و جدول، موبایل و Zoom.
- Patch applicability و عدم دوباره‌اعمال Patch، clean install از Lockfile، build مستقل و ثبت SHA دقیق.

## ریسک‌ها و کارهای موازی فاز اجرایی

ریسک اصلی، وابستگی Patchها به نسخه RC و به SHA مستقل `frappe/ui` است. دو محل فونت و CSSهای تکراری نیز امکان drift دارند. کاتالوگ Helpdesk نباید به ترجمه عمومی منتقل شود. قرارداد تاریخ/منطقه زمانی باید presentation-only بماند.

پس از تأیید، می‌توان هم‌زمان این کارها را در مخزن‌های مجزا پیش برد: (۱) inventory و API/extension point در Frappe، (۲) Patch inventory و strategy انتشار Frappe UI Persian، (۳) تست قرارداد Locale/Date/Number، (۴) مصرف‌کننده آزمایشی Helpdesk. انتقال کد، حذف Patch یا تغییر dependency در این مأموریت انجام نشده است.

## محدودیت شواهد

این RFC از سورس محلی Helpdesk در SHA بالا و بررسی‌های خواندنی تهیه شده؛ اجرای Runtime یا Build، آزمون Production و پذیرش سایر اپ‌ها را اثبات نمی‌کند.

## قرارداد اجرایی تثبیت‌شده برای نمونه اولیه

- **مرز Core:** کاتالوگ‌ها و قرارداد Locale سمت Framework، اتصال عمومی Desk به Locale، و پیش‌فرض‌های فقط برای نصب تازه. هرگز زبان/تنظیمات یک Site یا User موجود بازنویسی نشود. کد Core به Helpdesk یا بسته Vue وابسته نشود.
- **مرز UI:** اجزای Vue قابل‌استفاده مجدد، RTL/LTR، کلاس/توکن Vazirmatn، و formatterهای نمایشی تاریخ و عدد. اپ مصرف‌کننده مالک `lang` و `dir` سند و ترجمه‌های دامنه‌ای خود است.
- **نسخه‌بندی:** Core، سورس مستقل `frappe/ui` و بسته `frappe-ui` نسخه‌های جدا دارند. مصرف‌کننده باید نسخه و SHA هر منبع را دقیق Pin کند؛ `develop`/`latest` مرجع انتشار نیست.
- **API مشترک:** رابط اولیه UI فقط از Entry Point عمومی و مستند استفاده می‌کند: خواندن واکنشی `lang`/`dir` سند و قالب‌بندی نمایشی تاریخ/عدد. تا زمان تثبیت Export و پذیرش مصرف‌کننده، API داخلی فعلی قرارداد عمومی محسوب نمی‌شود.
- **Locale و تقویم:** `fa` و `en` دو Locale آزمون‌اند؛ RTL بر اساس `dir` سند، با CSS منطقی و جداسازی رشته‌های فنی LTR. جلالی فقط در خروجی نمایش است؛ ورودی، API و Database همچنان Gregorian/ISO می‌مانند. مقدار صفر با `null` یکی نیست.
- **مصرف‌کننده‌ها:** Helpdesk اولین مصرف‌کننده آزمایشی است؛ Insights و CRM پس از تأیید dependency واقعی. ERPNext و HRMS فقط اگر مصرف واقعی Vue/Frappe UI ثابت شود. رشته‌ها و منطق هر اپ در خود اپ می‌ماند.
- **گیت سازگاری:** نصب از Lockfile، parse/typecheck/build، placeholder و تغییر reactive زبان، RTL/LTR و صفحه‌کلید، مرزهای ماه/سال/سال کبیسه و timezone، حفظ payload ISO، صفر/null و smoke test روی SHAهای پین‌شده لازم است. Patchهای Helpdesk تا قبولی این گیت‌ها حذف یا جایگزین نمی‌شوند.

**محدودیت API:** Hookهای دقیق Frappe برای تنظیمات تازه و exportهای پایدار Frappe UI باید برای هر SHA انتخابی جداگانه تأیید شوند. این قرارداد مرز و رفتار هدف را مشخص می‌کند و ادعای وجود API منتشرشده برای همه موارد نیست.
