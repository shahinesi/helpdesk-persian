# راهنمای نصب Helpdesk با Docker و Traefik

> نوع سند: راهنمای اجرایی و یادداشت تجربه نصب
>
> مخاطب: مدیر سرور، توسعه‌دهنده و عامل هوش مصنوعی
>
> دامنه این سند: نصب شاخه `develop` از Helpdesk روی یک سرور Docker که Traefik از قبل روی آن اجرا می‌شود.
>
> وضعیت تجربه مرجع: نصب انجام شد؛ سرویس از HTTPS پاسخ `200` و HTTP به HTTPS پاسخ `301` داد.

## خلاصه قابل‌خواندن برای عامل هوش مصنوعی

- برنامه، Frappe Helpdesk است؛ backend آن Frappe و frontend آن از طریق سرویس Nginx ارائه می‌شود.
- در تجربه ثبت‌شده، image پایه با `easy-install.py build` و `images/layered/Containerfile` ساخته شد.
- image اولیه فقط اپ Helpdesk را داشت. چون Helpdesk به اپ `telephony` هم نیاز داشت، نصب Helpdesk به خطای نبود ماژول Telephony رسید. image دوم از روی image اول ساخته شد و Telephony به آن اضافه شد.
- روی یک سرور دارای Traefik، اجرای Traefik دوم یا اشغال مجدد پورت‌های عمومی `80/443` لازم نیست. سرویس frontend روی loopback منتشر و به شبکه خارجی Traefik وصل می‌شود؛ Traefik گواهی TLS و redirect را انجام می‌دهد.
- موفقیت فرمان نصب را به‌تنهایی ملاک نگیرید: Easy Install در تجربه مرجع با وجود شکست ساخت سایت کد خروجی صفر داد. وضعیت اپ‌ها و پاسخ HTTP را جداگانه بررسی کنید.
- شاخه Helpdesk و Frappe باید با هم سازگار باشند. این راهنما برای `develop` نوشته شده؛ نسخه‌های release را با جدول سازگاری upstream انتخاب کنید.
- این راهنما اطلاعات محرمانه ندارد. دامنه، مسیرهای سرور، نام image، پورت loopback و نام شبکه مثال هستند و باید با محیط مقصد تطبیق داده شوند.

## معماری هدف

```text
مرورگر --HTTPS--> Traefik موجود --شبکه Docker--> frontend:8080
                                                   |
                   backend:8000 <-----------------+
                       |             |
                    MariaDB       Redis/Socket.IO/worker
```

TLS در Traefik خاتمه پیدا می‌کند. ارتباط Traefik تا frontend داخل شبکه Docker است. پورت برنامه روی host فقط به `127.0.0.1` bind می‌شود تا دسترسی عمومی مستقیم ایجاد نشود. نام سایت Frappe باید با Host درخواست برابر باشد؛ در compose معمولاً `FRAPPE_SITE_NAME_HEADER` روی مقدار پیش‌فرض `$host` می‌ماند.

## پیش‌نیازها

1. Docker Engine و Docker Compose plugin روی میزبان نصب و قابل اجرا باشند.
2. رکورد DNS دامنه به IP سرور اشاره کند و firewall ورودی `80/443` را به Traefik موجود برساند.
3. Traefik از قبل در حال اجرا باشد و نام شبکه Docker خارجی آن را بدانید؛ در مثال پایین `traefik-public` است.
4. entrypointهای HTTP و HTTPS و نام certificate resolver را از پیکربندی واقعی Traefik بردارید. مثال‌ها به‌ترتیب `http`، `https` و `le` هستند؛ در سرور دیگر ممکن است فرق کنند.
5. برای دریافت sourceهای عمومی GitHub و imageهای رسمی دسترسی شبکه لازم است. اگر repo خصوصی شد، دسترسی Git باید جداگانه و بدون قرار دادن کلید خصوصی در image یا مخزن تنظیم شود.
6. برای یک آزمایش سریع، منابع کافی برای چند container و image build در نظر بگیرید؛ build خود image همچنان به زمان و فضای دیسک نیاز دارد.

## انتخاب branch و منبع اپ

برای این تجربه، اپ Helpdesk از fork `shahinesi/helpdesk-persian` و شاخه `develop` گرفته شد. branch در `apps.json` باید نام branch باشد، نه SHA commit. تلاش با SHA در فیلد `branch` با خطای `Remote branch <SHA> not found` روبه‌رو شد. اگر به pin کردن commit نیاز دارید، آن را با سازوکار پشتیبانی‌شده builder انجام دهید و ابتدا در نسخه همان builder بررسی کنید.

README رسمی Helpdesk نصب Telephony را پیش از Helpdesk نشان می‌دهد. image نهایی باید هر دو اپ را داشته باشد؛ نصب فقط Helpdesk در تجربه مرجع به `ModuleNotFoundError: No module named 'telephony'` رسید.

## مرحله ۱: دریافت ابزار نصب

روی سرور، یک پوشه مخصوص deployment بسازید. این نام صرفاً نمونه است:

```bash
mkdir -p ~/helpdesk-deploy
cd ~/helpdesk-deploy
wget -O easy-install.py https://frappe.io/easy-install.py
git clone https://github.com/frappe/frappe_docker.git
```

ابزار و composeهای تولیدشده را در همین پوشه یا مسیر عملیاتی محدود نگه دارید. فایل `.env`، رمزهای تولیدشده و volumeهای Docker را به مخزن Git اضافه نکنید.

## مرحله ۲: ساخت image برنامه

### ۲.۱ تعریف اپ Helpdesk

برای تکرار image اولیه تجربه مرجع، فایل `helpdesk-apps.json` را بسازید:

```json
[
  {
    "url": "https://github.com/shahinesi/helpdesk-persian.git",
    "branch": "develop"
  }
]
```

این image شامل Helpdesk است و هنوز Telephony ندارد.

### ۲.۲ build با imageهای لایه‌ای رسمی

```bash
python3 easy-install.py build \
  --frappe-branch develop \
  --apps-json ./helpdesk-apps.json \
  --containerfile ./frappe_docker/images/layered/Containerfile \
  --tag helpdesk-persian:test
```

در این تجربه، `images/custom/Containerfile` گیر کرد: مرحله build که nvm را اجرا می‌کرد، در container هنگام دسترسی به `iojs.org` پیش نرفت. استفاده از `images/layered/Containerfile` و imageهای پایه آماده `frappe/base` و `frappe/build` از همان نصب مجدد toolchain جلوگیری کرد و build را به پایان رساند. اگر شبکه build به registry یا sourceهای لازم دسترسی ندارد، ابتدا همان دسترسی را عیب‌یابی کنید؛ این تجربه ثابت نمی‌کند هر خطای build با layered image حل می‌شود.

نسخه Frappe را صریحاً با Helpdesk هماهنگ کنید. مقدار پیش‌فرض builder می‌تواند شاخه دیگری باشد؛ حذف `--frappe-branch develop` ممکن است ترکیب ناسازگار بسازد.

### ۲.۳ افزودن Telephony به image نهایی

فایل `telephony.Containerfile`:

```dockerfile
FROM helpdesk-persian:test AS telephony
USER frappe
WORKDIR /home/frappe/frappe-bench
RUN bench get-app --branch=develop --skip-assets https://github.com/frappe/telephony \
    && bench setup requirements --python telephony \
    && bench set-config -gp socketio_port 9000 \
    && bench build

FROM helpdesk-persian:test
USER root
COPY --from=telephony --chown=frappe:0 /home/frappe/frappe-bench/apps/telephony /home/frappe/frappe-bench/apps/telephony
COPY --from=telephony --chown=frappe:0 /home/frappe/frappe-bench/env /home/frappe/frappe-bench/env
COPY --from=telephony /home/frappe/frappe-bench/sites/assets /tmp/telephony-assets
RUN cp -a /tmp/telephony-assets/. /home/frappe/frappe-bench/assets/ && rm -rf /tmp/telephony-assets
USER frappe
```

ساخت این image، bundle رابط Helpdesk را تولید می‌کند. برای صفحه ورود Frappe یک build جدا برای اپ `frappe` هم لازم است؛ اگر فقط مرحله بالا اجرا شود، ممکن است manifest assetها خالی بماند و مرورگر CSS/JS صفحه ورود را پیدا نکند. فایل `frappe-assets.Containerfile` را بسازید:

```dockerfile
FROM helpdesk-persian:with-assets AS asset-builder
USER frappe
WORKDIR /home/frappe/frappe-bench
RUN bench set-config -gp socketio_port 9000 && bench build --apps frappe

FROM helpdesk-persian:with-assets
USER root
COPY --from=asset-builder /home/frappe/frappe-bench/assets /tmp/frappe-assets
RUN cp -a /tmp/frappe-assets/. /home/frappe/frappe-bench/assets/ && rm -rf /tmp/frappe-assets
USER frappe
```

`socketio_port` در build stage لازم است چون build فرانت‌اند Helpdesk آن را از `common_site_config.json` می‌خواند. تنظیم مرحله build فقط برای تولید bundle است؛ سرویس configurator مقدار runtime را زمان اجرای compose تنظیم می‌کند.

ساخت imageها:

```bash
docker build -f telephony.Containerfile -t helpdesk-persian:with-assets .
docker build -f frappe-assets.Containerfile -t helpdesk-persian:styled .
```

در مرحله دوم، کل پوشه `assets` شامل `assets.json` و symlinkهای اپ کپی می‌شود؛ کپی‌کردن تنها `sites/assets` برای صفحه ورود کافی نیست. هر دو image محلی هستند و به registry عمومی push نمی‌شوند.

## مرحله ۳: ایجاد سایت با Easy Install

اگر Traefik از قبل مالک پورت‌های عمومی است، به Easy Install بگویید SSL را داخل stack برنامه نسازد. مقادیر نمونه را جایگزین کنید:

```bash
SITE=helpdesk.example.com
PROJECT=helpdesk-test
IMAGE=helpdesk-persian
TAG=styled

python3 easy-install.py deploy \
  --project "$PROJECT" \
  --sitename "$SITE" \
  --email admin@example.com \
  --image "$IMAGE" \
  --version "$TAG" \
  --app telephony \
  --app helpdesk \
  --no-ssl \
  --http-port 18080
```

Easy Install فایل compose، تنظیمات و رمزهای اولیه را می‌سازد. در این سناریو `--no-ssl` یعنی TLS به reverse proxy بیرونی واگذار می‌شود؛ به‌تنهایی HTTPS عمومی را فعال نمی‌کند. نگهداری فایل `.env` و هر فایل رمز که installer می‌سازد باید محدود به سرور بماند.

در نصب مرجع، ساخت سایت با image ناقص شکست خورد اما برنامه Easy Install کد خروجی صفر برگرداند. پس از اصلاح image، ابتدا Telephony و سپس Helpdesk نصب شدند. اگر فرمان deploy تمام شد ولی `list-apps` اپ‌ها را نشان نداد، خروجی را موفق فرض نکنید و بخش عیب‌یابی را ببینید.

## مرحله ۴: وصل کردن frontend به Traefik موجود

فایل override برای compose بسازید؛ نام فایل را متناسب با compose تولیدشده تعیین کنید. پورت published سرویس frontend باید فقط loopback باشد. برای نمونه:

```yaml
services:
  frontend:
    networks:
      - default
      - traefik-public
    ports:
      - "127.0.0.1:18080:8080"
    labels:
      - traefik.enable=true
      - traefik.docker.network=traefik-public
      - traefik.http.routers.helpdesk-http.entrypoints=http
      - traefik.http.routers.helpdesk-http.rule=Host(`helpdesk.example.com`)
      - traefik.http.routers.helpdesk-http.middlewares=helpdesk-https-redirect
      - traefik.http.routers.helpdesk-http.service=helpdesk
      - traefik.http.routers.helpdesk-https.entrypoints=https
      - traefik.http.routers.helpdesk-https.rule=Host(`helpdesk.example.com`)
      - traefik.http.routers.helpdesk-https.tls.certresolver=le
      - traefik.http.routers.helpdesk-https.service=helpdesk
      - traefik.http.middlewares.helpdesk-https-redirect.redirectscheme.scheme=https
      - traefik.http.middlewares.helpdesk-https-redirect.redirectscheme.permanent=true
      - traefik.http.services.helpdesk.loadbalancer.server.port=8080

networks:
  traefik-public:
    external: true
    name: traefik-public
```

مقادیر `helpdesk.example.com`، `traefik-public`، `http`، `https` و `le` نمونه‌اند. آن‌ها را با Host rule، شبکه، entrypoint و resolver واقعی سرور جایگزین کنید. اگر compose اصلی از قبل پورت frontend را منتشر می‌کند، merge نهایی باید فقط یک bind loopback برای همان پورت داشته باشد؛ از bind عمومی `0.0.0.0:18080` خودداری کنید.

در این تجربه، installer فایل compose را با الگوی `<project>-compose.yml` ساخت. مسیر واقعی را بررسی کنید؛ سپس آن را در متغیر `BASE_COMPOSE` قرار دهید:

```bash
BASE_COMPOSE="${PROJECT}-compose.yml"
docker compose -f "$BASE_COMPOSE" -f traefik-override.yml up -d
```

قبل از اجرا می‌توانید merge را فقط برای مشاهده بررسی کنید:

```bash
docker compose -f "$BASE_COMPOSE" -f traefik-override.yml config
```

خروجی `config` شامل مقادیر environment و ممکن است شامل secret باشد؛ آن را عمومی نکنید و بدون پالایش در گزارش یا چت نگذارید.

## مرحله ۵: بررسی نصب و دسترسی

از مسیر compose واقعی استفاده کنید:

```bash
docker compose -f "$BASE_COMPOSE" -f traefik-override.yml ps
docker compose -f "$BASE_COMPOSE" -f traefik-override.yml exec backend \
  bench --site "$SITE" list-apps
```

در فهرست اپ‌ها باید `frappe`، `telephony` و `helpdesk` دیده شوند. اگر `telephony` یا `helpdesk` نصب نشده، تنها پس از اطمینان از اینکه سایت درست است و دیتابیس همان سایت مقصد است، نصب ترتیبی را اجرا کنید:

```bash
docker compose -f "$BASE_COMPOSE" -f traefik-override.yml exec backend \
  bench --site "$SITE" install-app telephony
docker compose -f "$BASE_COMPOSE" -f traefik-override.yml exec backend \
  bench --site "$SITE" install-app helpdesk
```

آدرس Helpdesk معمولاً زیرمسیر `/helpdesk` است. از یک کلاینت بیرونی بررسی کنید:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  "https://$SITE/helpdesk"
curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' \
  "http://$SITE/helpdesk"
```

گواهی TLS را با اعتبارسنجی عادی curl بررسی کنید؛ از `-k` استفاده نکنید. در تجربه مرجع HTTPS کد `200` و HTTP کد `301` همراه مقصد HTTPS داد.

پس از تغییر imageهای asset، cache سایت را خالی و backend را restart کنید تا HTML مسیر hashدار تازه را بسازد:

```bash
docker compose -f "$BASE_COMPOSE" exec backend \
  bench --site "$SITE" clear-cache
docker compose -f "$BASE_COMPOSE" restart backend
```

صفحه ورود باید به assetهایی مثل `/assets/frappe/dist/css/login.bundle.<hash>.css` و `/assets/frappe/dist/js/frappe-web.bundle.<hash>.js` اشاره کند. URLهای بدون hash مثل `/login.bundle.css` در این image مسیر درست نیستند. کد HTTP خود CSS و JS hashدار را هم جدا بررسی کنید.

## عیب‌یابی بر اساس نشانه

| نشانه | معنی محتمل | اقدام محدود |
|---|---|---|
| `Remote branch <SHA> not found` | مقدار `branch` در apps JSON نام branch نیست | branch معتبر مثل `develop` بگذارید؛ SHA را در این فیلد قرار ندهید. |
| Build روی درخواست `iojs.org` می‌ایستد | مرحله nvm/toolchain به منبعی دسترسی ندارد یا image custom آن را دوباره دانلود می‌کند | نام مرحله و log را ثبت کنید؛ برای این تجربه، build با layered Containerfile رسمی و imageهای base/build آماده شد. |
| `KeyError: 'telephony'` یا `No module named 'telephony'` | image یا سایت اپ Telephony را ندارد | image نهایی را با Telephony بسازید؛ سپس در سایت ابتدا Telephony و بعد Helpdesk را نصب و `list-apps` را دوباره بررسی کنید. |
| صفحه ورود بدون استایل است یا دکمه‌ها کار نمی‌کنند | CSS/JS یا `assets.json` در image نهایی موجود نیست، یا backend هنوز cache قدیمی دارد | `assets.json` و URLهای hashدار صفحه را بررسی کنید؛ `bench build --apps frappe` را در مرحله‌ای دارای Node اجرا و کل پوشه `assets` را به image نهایی کپی کنید، سپس cache را خالی و backend را restart کنید. |
| Easy Install خروجی صفر می‌دهد ولی سایت بالا نمی‌آید | کد خروجی ابزار کافی نیست و ممکن است یکی از مراحل داخلی شکست خورده باشد | `docker compose ps`، log همان سرویس و `bench --site ... list-apps` را بررسی کنید. |
| Traefik خطای شبکه می‌دهد | frontend به شبکه خارجی Traefik متصل نیست یا نام شبکه در label متفاوت است | وجود شبکه Docker، اتصال frontend به آن و مقدار `traefik.docker.network` را تطبیق دهید. |
| گواهی صادر نمی‌شود | DNS، پورت‌های ورودی، resolver یا challenge در Traefik درست نیست | ابتدا دسترسی بیرونی دامنه و تنظیمات خود Traefik را بررسی کنید؛ گواهی را از داخل Helpdesk تنظیم نکنید. |
| دامنه باز می‌شود ولی سایت Frappe پیدا نمی‌شود | Host header با نام سایت Frappe تطبیق ندارد | `FRAPPE_SITE_NAME_HEADER` و نام سایت ساخته‌شده را بررسی کنید. |

## به‌روزرسانی و نگهداری

- پیش از تغییر branch یا image، از دیتابیس و فایل‌های سایت backup بگیرید و قابل‌بازیابی بودن backup را جداگانه بررسی کنید.
- image را با tag مشخص بسازید؛ `latest` یا tag متغیر، rollback را مبهم می‌کند.
- برای تغییر Helpdesk، Frappe و Telephony، سازگاری نسخه‌های هر سه را بررسی کنید و image نهایی را پیش از جایگزینی image جاری بسازید.
- داده پایدار در volumeهای Docker است. حذف volume، `docker compose down -v` یا پاک‌کردن پوشه‌های سایت برای رفع خطای نصب می‌تواند داده را نابود کند؛ برای عیب‌یابی این کارها را اجرا نکنید.
- کلید SSH خصوصی، فایل `.env`، رمز DB/Administrator، backup، certificate و داده‌های volume نباید در Git، image یا این راهنمای عمومی قرار بگیرند. کلید عمومی را فقط در تنظیم Deploy Key یا SSH keys حساب GitHub ثبت کنید.
- برای push/pull سرور، کلید خصوصی فقط روی همان سرور و با دسترسی فایل محدود بماند. مسیر کلید و آدرس واقعی سرور جزو محتوای این سند نیست.

## منبع‌های رسمی

- [README رسمی Helpdesk](https://github.com/frappe/helpdesk/blob/develop/README.md) — self-hosting، نصب Telephony و Helpdesk، و جدول سازگاری branchها.
- [راهنمای رسمی ساخت image در frappe_docker](https://github.com/frappe/frappe_docker/blob/main/docs/02-setup/02-build-setup.md) — apps JSON، Containerfileهای custom و layered.
- [Containerfile لایه‌ای رسمی](https://github.com/frappe/frappe_docker/blob/main/images/layered/Containerfile) — ساخت image اپ روی base/build imageهای Frappe.

## چک‌لیست پایان نصب

- [ ] DNS دامنه به سرور اشاره می‌کند.
- [ ] frontend فقط روی loopback میزبان منتشر شده و به شبکه Traefik وصل است.
- [ ] Traefik برای دامنه HTTPS معتبر می‌دهد و HTTP را به HTTPS می‌فرستد.
- [ ] `bench --site <دامنه> list-apps` هر سه اپ Frappe، Telephony و Helpdesk را نشان می‌دهد.
- [ ] `https://<دامنه>/helpdesk` پاسخ مورد انتظار می‌دهد.
- [ ] compose، `.env`، رمزها، کلید خصوصی و volumeها در مخزن عمومی قرار نگرفته‌اند.
