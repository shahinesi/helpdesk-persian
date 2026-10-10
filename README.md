<div align="center" markdown="1" dir="rtl">

<img src=".github/hd-logo.svg" alt="نشان هلپ‌دسک فرپی" width="80"/>

# هلپ‌دسک فارسی

**سامانهٔ پشتیبانی مشتری بر پایهٔ Frappe Helpdesk**

این مخزن، فورک فارسی پروژهٔ متن‌باز [Frappe Helpdesk](https://github.com/frappe/helpdesk) است. مالکیت و اعتبار پروژهٔ اصلی متعلق به تیم Frappe است؛ این فورک برای تجربهٔ فارسی و راست‌چین نگهداری می‌شود.

[وب‌سایت Frappe](https://frappe.io/helpdesk) · [مستندات اصلی](https://docs.frappe.io/helpdesk) · [راهنمای نصب این فورک](docs/self-hosted-docker-fa.md)

</div>

<div align="center">
  <img src="./.github/Hero2.png" alt="نمایی از هلپ‌دسک" width="100%" />
</div>

## معرفی

هلپ‌دسک ابزاری متن‌باز برای مدیریت تیکت‌ها و درخواست‌های پشتیبانی است. این فورک، کد اصلی Frappe Helpdesk را با تمرکز بر زبان فارسی، چیدمان راست‌چین و پیش‌فرض‌های مناسب کاربران ایرانی دنبال می‌کند.

### ویژگی‌ها

- درگاه کارشناسان و مشتریان برای ثبت و پیگیری درخواست‌ها
- مدیریت تیکت، اولویت، وضعیت، تخصیص و تیم‌ها
- تعریف SLA و پایش زمان پاسخ‌گویی و حل درخواست
- پایگاه دانش برای انتشار راهنما و مقاله
- پاسخ‌های آماده برای پیام‌های پرتکرار
- اتصال به Frappe Framework و ERPNext
- رابط کاربری راست‌چین و فونت محلی Vazirmatn

### فارسی‌سازی این فورک

ترجمه‌ها در کاتالوگ استاندارد gettext پروژه نگهداری می‌شوند. تغییرات مربوط به فارسی‌سازی، فونت و راست‌چین در همین مخزن اعمال می‌شوند و فایل‌های Frappe Core را تغییر نمی‌دهند. گزارش پوشش ترجمه و وضعیت قابلیت‌ها را در Pull Requestها دنبال کنید؛ تا تکمیل ترجمهٔ همهٔ رشته‌ها، پوشش کامل ادعا نمی‌شود.

فونت پیش‌فرض رابط کاربری این نسخه **Vazirmatn نسخهٔ v33.003** است. فایل WOFF2 و مجوز OFL آن در مخزن نگهداری می‌شوند؛ برنامه برای نمایش فونت به CDN نیاز ندارد. پروژهٔ رسمی: [Vazirmatn](https://github.com/rastikerdar/vazirmatn).

## نصب Production و Self-host

راهنمای اجرایی نصب Docker در کنار Traefik موجود، ساخت image، تنظیم HTTPS و بررسی سرویس در [راهنمای نصب Self-host](docs/self-hosted-docker-fa.md) آمده است. پیش از اجرا، مقادیر دامنه، شبکه، پورت و certificate resolver را با سرور خود تطبیق دهید.

برای نصب روی زیرساخت Frappe موجود، ابتدا Telephony را دریافت و سپس Helpdesk را از این فورک نصب کنید:

```bash
bench get-app --branch develop https://github.com/frappe/telephony.git
bench get-app --branch develop https://github.com/shahinesi/helpdesk-persian.git
bench --site helpdesk.example.com install-app telephony
bench --site helpdesk.example.com install-app helpdesk
bench build --app helpdesk
```

برای نصب کنار ERPNext، برنامه‌ها را روی همان Frappe site نصب کنید و سازگاری نسخهٔ ERPNext، Frappe، Telephony و Helpdesk را پیش از Production بررسی کنید. راهنمای عمومی استقرار Frappe در [مستندات رسمی](https://frappeframework.com/docs/user/en/installation) قرار دارد.

## نصب Development

### اجرای Docker

Docker و Docker Compose را نصب کنید، سپس فایل‌های compose و اسکریپت راه‌اندازی را از شاخهٔ `develop` دریافت کنید:

```bash
mkdir helpdesk-persian-dev
cd helpdesk-persian-dev
wget -O docker-compose.yml https://raw.githubusercontent.com/shahinesi/helpdesk-persian/develop/docker/docker-compose.yml
wget -O init.sh https://raw.githubusercontent.com/shahinesi/helpdesk-persian/develop/docker/init.sh
```

سپس سرویس‌ها را اجرا کنید:

```bash
docker compose up -d
```

در صورت موفقیت، محیط توسعه طبق تنظیمات compose در نشانی محلی تعریف‌شده در فایل در دسترس خواهد بود. رمز پیش‌فرض را فقط در محیط محلی و آزمایشی استفاده کنید.

### نصب محلی روی Frappe Bench

یک Frappe Bench سازگار با شاخهٔ `develop` آماده کنید، Redis و MariaDB را اجرا کنید و site بسازید:

```bash
bench start
bench new-site helpdesk.test
bench --site helpdesk.test add-to-hosts
bench get-app --branch develop https://github.com/frappe/telephony.git
bench get-app --branch develop https://github.com/shahinesi/helpdesk-persian.git
bench --site helpdesk.test install-app telephony
bench --site helpdesk.test install-app helpdesk
bench build --app helpdesk
```

برای دسترسی به صفحهٔ Helpdesk، مسیر `/helpdesk` را روی دامنهٔ محلی site باز کنید.

### توسعهٔ فرانت‌اند

در پوشهٔ برنامه، وابستگی‌ها را مطابق lockfile نصب و Vite را اجرا کنید:

```bash
cd frappe-bench/apps/helpdesk/desk
yarn install --frozen-lockfile
yarn dev
```

برای دسترسی از دستگاه یا دامنهٔ محلی دیگر، گزینهٔ `--host` را مطابق نیاز محیط توسعه به فرمان Vite اضافه کنید. ساخت Production با فرمان زیر انجام می‌شود:

```bash
yarn build
```

## پیش‌فرض‌های نصب تازه

در Setup Wizard نصب تازه، زبان فارسی و مقادیر منطقه‌ای ایران هدف این فورک هستند:

```text
Language: fa (فارسی)
Country: Iran
Time zone: Asia/Tehran
Currency: IRR
```

مقدار ذخیره‌شدهٔ ارز `IRR` است؛ متن نمایشی آن «IRR (ریال)» خواهد بود. مقادیر موجود در site پیکربندی‌شده نباید با این پیش‌فرض‌ها بازنویسی شوند.

## به‌روزرسانی

قبل از به‌روزرسانی، از پایگاه داده و فایل‌های site نسخهٔ پشتیبان بگیرید. سپس نسخه‌ها و تغییرات شاخه را بررسی کنید و از روش عملیاتی Bench یا Docker همان محیط استفاده کنید. نمونهٔ به‌روزرسانی Bench:

```bash
bench update --pull
bench --site helpdesk.example.com migrate
bench build --app helpdesk
```

برای Docker، image جدید را با نسخه‌های سازگار بسازید یا دریافت کنید، سپس سرویس‌ها را طبق راهنمای نصب و رویهٔ استقرار خود به‌روزرسانی کنید. فرمان‌ها و ترتیب دقیق می‌توانند با معماری سرور متفاوت باشند.

## ترجمه‌ها

- کاتالوگ فارسی: `helpdesk/locale/fa.po`
- قالب استخراج رشته‌ها: `helpdesk/locale/main.pot`
- پیکربندی Crowdin: `crowdin.yml`
- بررسی پوشش: `python scripts/check_fa_translation.py`

رشتهٔ جدید در رابط کاربری را با سازوکار ترجمهٔ Frappe علامت‌گذاری کنید، POT را با ابزار رسمی پروژه به‌روز کنید و ترجمهٔ فارسی را در همان تغییر اضافه کنید. بررسی پوشش در CI اجرا می‌شود و تا زمانی که رشته‌های فعال خالی باقی مانده باشند، باید شکست بخورد.

## ساختار پروژه

- `desk/` — رابط کاربری Vue و TypeScript
- `helpdesk/` — برنامهٔ Frappe، APIها، مدل‌ها و ترجمه‌ها
- `docs/` — راهنماهای این فورک
- `docker/` — فایل‌های اجرای Docker
- `frappe-ui/` — وابستگی فرعی Frappe UI؛ مستندات و کد آن متعلق به پروژهٔ upstream است

## مشارکت

برای گزارش مشکل یا پیشنهاد تغییر، ابتدا issueهای باز و راهنمای مشارکت Frappe Helpdesk را بررسی کنید. تغییرهای مربوط به زبان فارسی، RTL، فونت و مستندات این فورک را در Pull Request همین مخزن ارسال کنید. رشته‌های تازهٔ رابط کاربری باید ترجمه و با check پوشش اعتبارسنجی شوند.

- [Issueهای Frappe Helpdesk](https://github.com/frappe/helpdesk/issues)
- [راهنمای مشارکت upstream](https://github.com/frappe/erpnext/wiki/Contribution-Guidelines)
- [ترجمه‌های پروژهٔ اصلی](https://crowdin.com/project/frappe)
- [جامعهٔ Frappe](https://discuss.frappe.io/c/frappehelpdesk/69)

## پروژهٔ اصلی و مجوز

این مخزن فورک فارسی [Frappe Helpdesk](https://github.com/frappe/helpdesk) است. Frappe Framework و Frappe UI نیز پروژه‌های جداگانه و متن‌باز هستند. اعتبار، علائم تجاری و حقوق پروژه‌های upstream متعلق به صاحبان همان پروژه‌ها باقی می‌ماند.

متن قانونی اصلی در فایل [`LICENSE`](LICENSE) حفظ شده است و ترجمه نشده است. مجوز فونت Vazirmatn در [`desk/src/assets/fonts/vazirmatn/OFL.txt`](desk/src/assets/fonts/vazirmatn/OFL.txt) قرار دارد.
