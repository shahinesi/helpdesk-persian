# معیار پذیرش فارسی و Build

## وضعیت تأییدشده — ۱۰ نوامبر ۲۰۲۶

- **PR #1:** در GitHub Merge شده است. Branch محلی `feat/persian-setup-wizard` روی SHA `9efa5d6d516ef153dcbe322f04bee994d6275ff0` قرار دارد؛ این SHAهای بعد از Merge به‌طور خودکار جزو Merge قبلی محسوب نمی‌شوند.
- **Runtime:** Image `helpdesk-persian:runtime-fa-a3165cb0-ada73d92-9efa5d6d5-039cf39f-ins4441e48-ui0f8d2a1-welcome-greeting-fa` با شناسه `sha256:7cd791c2f3f804d77b79b02091ff1f88f4a8cee2115fc5c113180f7ed5f7f967` روی شش سرویس برنامهٔ `office-staging` اجرا شد. DB، Volumeها و سرویس‌های زیرساخت دست‌نخورده ماندند؛ Migration اجرا نشد و imageهای rollback حفظ شدند.
- **تأیید مرورگر:** حساب QA مجاز با locale واقعی فارسی و سپس انگلیسی وارد شد. فارسی: `lang=fa`، `dir=rtl`، Vazirmatn با `ss01`، متن نمونهٔ Welcome ترجمه‌شده و بدون رقم Unicode فارسی/عربی در DOM. انگلیسی: `lang=en`، `dir=ltr` و متن نمونهٔ اصلی انگلیسی حفظ شد. locale حساب QA به فارسی و timezone آن روی `Asia/Tehran` باقی گذاشته شد. تست فقط خواندنی بود.
- **تست‌های واحد/کامپوننت:** ۳۳ از ۳۳ موفق؛ شامل timezone تهران و مرز روز، تاریخ‌های جلالی، رقم‌های canonical و رگرسیون نمایش انگلیسی.
- **اعتبارسنجی Image:** ۶۶ asset mapping معتبر؛ catalogهای ترجمه بررسی و رقم‌های canonical در پنج catalog تأیید شدند.
- **E2E استاندارد:** اجرا نشد؛ اتصال پایگاه دادهٔ محیط E2E با MariaDB `1045` رد شد. هیچ fixture یا داده‌ای نوشته نشد. سایت عمومی `helpdesk-persian-test` نیز تغییر داده نشد.
- **Source coverage این نوبت:** روتر منبع شامل ۲۸ رکورد مسیر است؛ `desk/src` شامل ۳۳۰ فایل Vue است. جست‌وجوی ترکیبی Date API، formatter، picker، calendar، `moment()` و `dayjs()`، ۲۰۵ محل در ۳۹ فایل پیدا کرد (این تعداد مسیر مستقل تاریخ نیست). همهٔ ۲۸ Route و تمام روابط فرزند/Shared Component در این نوبت به‌صورت کامل بازبینی نشده‌اند؛ بنابراین پوشش جامع Source و دفتر تعیین‌تکلیف ۶۶ مسیر تاریخ **NOT COMPLETE** است.
- **ساختار تغییر اخیر:** منطق نمایش محتوای ایمیل نمونهٔ Welcome در لایهٔ نمایش باقی می‌ماند؛ متن ذخیره‌شده، API، دیتابیس، payload پاسخ و زبان انگلیسی تغییر نمی‌کنند. اصلاح‌ها با commitهای `8c4d74b111813366bc8061d6a49d259fcfc51a12` و `9efa5d6d516ef153dcbe322f04bee994d6275ff0` ثبت و روی branch موجود push شدند.
- **وضعیت Build/Deploy:** Build و Deploy image بالا موفق بودند. `yarn tsc --noEmit` از اجرای قبلی خطاهای متعدد در Helpdesk و `frappe/ui` داشته و در این نوبت دوباره اجرا نشده است؛ وضعیت فعلی این gate **NOT RUN (known prior failure)** است.

جزئیات زیر snapshot تاریخی ۱۰ اکتبر ۲۰۲۶ هستند و وضعیت زندهٔ فعلی را توصیف نمی‌کنند.

## گیت‌های فعلی — commit `3d597d68e1b89b700884441e65d02ccc6f2a294a`، ۱۰ اکتبر ۲۰۲۶

- Translation gate: ۲۲۸۳ ورودی فعال، بدون ترجمهٔ ناقص، fuzzy یا خطای placeholder؛ ۱۰۰٪.
- Lint: موفق.
- Server tests: موفق.
- Clean frontend build: نصب از cache خالی با `--frozen-lockfile`، بررسی pin منبع Frappe UI، اجرای idempotent Patch دوبار و `yarn build` در GitHub Actions موفق.
- Playwright: هر دو shard موفق. شکست قبلی `Opening Date` از fixture تاریخ UTC در برابر timezone سایت CI بود؛ fixture اکنون تاریخ جاری Backend را نگه می‌دارد و منطق فیلتر محصول تغییر نکرد. selector Gmail نیز با نام رسمی Provider هماهنگ است.
- نسخه‌های Pipeline: Node 20.20.0، Yarn 1.22.18، Vue 3.5.31، Vite 5.4.21، TypeScript 5.9.3، `frappe-ui` 1.0.0-rc.1.
- `yarn tsc --noEmit` در بررسی قبلی خطاهای متعدد در Helpdesk و `frappe/ui` داشت؛ این گیت همچنان FAIL/UNRESOLVED است.

## هشدارهای Build

Build موفق، هشدارهای فعلی را نشان داد: دو Component auto-import هم‌نام (`TicketFeedback` و `TicketTimeline`)، داده قدیمی Browserslist و Chunkهای JavaScript بزرگ‌تر از 500KB. این هشدارها Build را متوقف نکردند؛ برای اصلاحشان باید علت و اثر جداگانه بررسی شود.

`yarn tsc --noEmit` در Checkout تمیز موفق نشد و خطاهای TypeScript متعددی در کد Helpdesk و سورس `frappe/ui` گزارش کرد؛ بنابراین گیت TypeScript فعلاً FAIL است، هرچند Vite build موفق بود. این اختلاف به‌تنهایی ثابت نمی‌کند خطاها از تغییرات این کار آمده‌اند؛ باید خطاها نسبت به Base مقایسه و جداگانه رفع شوند.

## وضعیت PR و محیط

PR شماره ۱ باز است؛ Base=`develop`، Head=`feat/persian-setup-wizard`، اکنون SHA `59a719a7a991a6c9ba0bd7ddc706b7f123061629`. تمام گیت‌ها روی commit کد `3d597d68e1b89b700884441e65d02ccc6f2a294a` موفق بودند. اجرای دوباره روی تغییرات مستندات به‌دلیل Docker Hub rate limit برای image `mariadb:10.6` قبل از شروع Python و Playwright متوقف شد؛ Merge انجام نشده است.

Stack متصل به دامنه Image `helpdesk-persian:runtime-3d597d68` با digest `sha256:3a9a9823e5bc18e1c695c7340a50aca4380f1ea54e17acc4f41db622f52aebad` را اجرا می‌کند. Full Docker Build از archive دقیق همین commit موفق شد؛ Home، Login، API ping و assetهای CSS/فونت/JavaScript پاسخ HTTP 200 دادند. DB/Redis/Volumeها تغییر نکردند و Migration اجرا نشد. Backup تازه تهیه و خوانایی و checksum آن بررسی شد؛ Restore آزمایشی نشد. Rollback image قبلی حفظ شده است.

Runtime زندهٔ Settings پس از Deploy: **UNVERIFIED**. تست‌های Playwright در CI روی محیط ایزوله موفق‌اند؛ این نتیجه جایگزین بررسی زندهٔ Settings نیست. برای ورود به سایت زنده، credential معتبرِ حساب تست و profile مرورگر مستقل لازم است. `yarn tsc --noEmit` همچنان FAIL/UNRESOLVED است و بررسی Restore ایزوله و LTR/موبایل/Accessibility هم انجام نشده است.
