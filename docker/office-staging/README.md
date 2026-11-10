# Office Staging image

This image compiles the checked-in Persian PO catalogs into runtime MO files,
then builds apps sequentially in the immutable image builder and validates the
manifest before assets are moved out of `sites/`. Sequential builds limit
peak memory on the Office host. Do not run `bench build` in an application
container that has the persistent `sites` volume mounted.

The image pins the Frappe build/base images by digest. `apps.json` selects the
Git remotes and initial branches; after clone, the builder fetches and checks
out the exact expected SHA for every app before reconciling dependencies or
building assets. Supply `docker/office-staging/apps.json` as the BuildKit secret
`apps_json` and pass its SHA-256 as `APP_MANIFEST_SHA`. The five bootstrap
branch heads and five final app commits are pinned in the `Containerfile`; the
build rejects any mismatch after checkout. The manifest digest and bootstrap
refs participate in the cached initialization layer, while final pins
invalidate the checkout/dependency/build layers. Update refs and pins together
only after compatibility checks.

## Current Staging deployment (2026-11-10)

The candidate image tag is
`helpdesk-persian:runtime-fa-a3165cb0-ada73d92-8c4d74b11-039cf39f-ins4441e48-ui0f8d2a1-welcome-body-fa`.
It pins Helpdesk to
`8c4d74b111813366bc8061d6a49d259fcfc51a12`; the source commits for Frappe,
ERPNext, Insights, and Insights' Frappe UI match the prior candidate. The
Build and Staging rollout status will be recorded after validation. The
database container remains
`a2b0a06d3e2844bc7692dc9e7688758bb42f5753591540e814ad5ab6732886cd` with the
existing `office-staging_db-data` volume. No database migration is planned.

The full E2E setup against `helpdesk-e2e.localhost` was previously blocked by
its configured MySQL account (MariaDB 1045), before test records were created.

The Helpdesk body localization translates only the exact seeded sample email
for display, preserving user-edited and ordinary email content and the stored
HTML. No branch, pull request, or merge was created for this rollout.

## Previous Staging deployment (2026-11-10)

Before this source update, the running image was
`helpdesk-persian:runtime-fa-a3165cb0-ada73d92-c2bbdcf5-039cf39f-ins4441e48-ui0f8d2a1-telephonyfa-helptitle`
with immutable image ID/digest
`sha256:3dfd4a7b5b31bbc0dca9784ec6bc5f52058e9fa7f53db65a039f6c55a1b61627`.
All six application services use this image. The database container remains
`a2b0a06d3e28` with the existing `office-staging_db-data` volume; no migration
was run. The QA user has Helpdesk Agent and Insights User access for read-only
coverage; its locale is restored to `fa` after English regression checks. No
ticket, report, or business document was created or changed.

The image pins Frappe `a3165cb0740c4fd1f16be8ae7c8f0fe9a668c020`, ERPNext
`ada73d92f566ccb855927bddedf60ee18d26ae89`, Helpdesk
`c2bbdcf5247d1b6318d02dd78fd093c87bc138f7`, Telephony
`039cf39f245d6818ead03cf94eea6ce7f9c1e1f7`, Insights
`4441e48902262a35c03b5a197ec35ffdc8cfeafa`, and Insights' Frappe UI
`0f8d2a1575ff384182060206c1ab0cb098cb4052`. The image build, six app asset
builds, 66-entry asset manifest validation, Persian catalog validation, and
ASCII display-digit validation passed. Insights' full frontend suite passed
61 files / 793 tests; the localization change was included in that run.

Read-only Playwright checks on the deployed image loaded Helpdesk dashboard
and ticket list, ERPNext Desk Accounting, and Insights Dashboards in both
locales. Persian routes reported `fa`/RTL, loaded Vazirmatn with `ss01`, and
kept display digits ASCII. The Insights empty-dashboard state is now Persian.
English reported `en`/LTR with Inter and retained English strings. On the
Helpdesk ticket date filter, the calendar showed the Jalali month, Saturday-first
weekdays, Vazirmatn/`ss01`, and ASCII day labels. With browser timezone
`Asia/Tehran`, the Tehran midnight boundary rendered `اسفند 1404` at 23:59:59
and `فروردین 1405` at 00:00:00. The Desk Accounting home also returned HTTP
403 for two permission-gated number-card/report requests; no report data was
used for localization validation.

The deployed Telephony revision does not contain local Persian catalog commit
`329e76408a1ae6d04c5f70771fe0778936ab2d2e`; GitHub rejected its push to
`frappe/telephony` with HTTP 403. Instead, the image includes the versioned
pipeline input `docker/office-staging/telephony-fa.po`, pinned by SHA-256 in
both Containerfiles, copied into the pinned Telephony source, compiled, and
checked by the image validator. A runtime smoke check confirmed its compiled
Persian catalog loads. The app pin and API/database behavior are unchanged.

The public hostname returned HTTP 404 during this rollout. Authenticated
Playwright checks reached Staging through its internal SSH tunnel.

The previous Staging image was
`helpdesk-persian:runtime-fa-7ece4ec9-ada73d9-5213e0ac-940928b-ui0f8d2a1-pdfpos`
(image ID/digest `sha256:4baafe9f03bf1fdbdb3c3777e1ce057243f5279eb838484149cb8caaf35320dc`, deployed 2026-11-09).
Its `PINNED_VERSIONS.json` records Frappe
`7ece4ec911b46c60c35dfc4fefb5c6530468626a`, ERPNext
`ada73d92f566ccb855927bddedf60ee18d26ae89`, Helpdesk
`5213e0ac133a1293dd16277c90f4f399ad7bcc3f`, Telephony
`039cf39f245d6818ead03cf94eea6ce7f9c1e1f7`, Insights
`940928b74038d2eee31e998997ed7d9f3f69feb8`, and Insights' Frappe UI
`0f8d2a1575ff384182060206c1ab0cb098cb4052`.
After checking out final revisions, the builder installs each app's locked
JavaScript dependencies before running its asset build. This is required when
a final pin adds packages that were absent from the bootstrap branch.
Insights has its own Vite frontend and island bundles; Frappe's versioned app
build command runs the Insights `yarn build` script before validating assets.

The Frappe build environment also installs Typst 0.15.0. On hosts where the
BuildKit container cannot reliably stream the 34 MB PyPI wheel, fetch it on the
build host into the Docker build context. The helper downloads bounded HTTP
ranges from the official PyPI artifact and verifies its pinned size and SHA-256
before returning:

```sh
sh docker/office-staging/fetch-typst-wheel.sh
```

The generated wheel is ignored by Git but included in the Docker context under
its full PEP 427 filename so `uv` recognizes its package, version, ABI, and
platform tags. The Containerfile verifies the same digest and directs `uv` to
this local wheel;
the wheel is copied only into the intermediate builder stage and is absent from
the resulting runtime image.

Build the candidate from the repository root after fetching the verified wheel:

```sh
sh docker/office-staging/fetch-typst-wheel.sh
APP_MANIFEST_SHA="$(sha256sum docker/office-staging/apps.json | cut -d' ' -f1)"
docker buildx build --load --progress=plain \
  --allow network.host \
  --secret id=apps_json,src=docker/office-staging/apps.json \
  --build-arg APP_MANIFEST_SHA="$APP_MANIFEST_SHA" \
  --tag helpdesk-persian:runtime-fa-510d7f3-dcf0c15-bdd66f071-i396a7e9-ui61f753a-jalali \
  --file docker/office-staging/Containerfile .
```

The build must finish successfully and the asset validator must pass before
any Staging service uses the candidate image. The final image contains a real,
image-owned `assets/` directory even when the builder's `sites/assets` path is
a symlink. Keep the previous image digest and database backup available for
rollback; image rollback is appropriate only when the candidate has not applied
a database migration.

The Banking Jalali calendar update adds `jalaali-js` and
`@persian-tools/persian-tools` to ERPNext's nested Banking package manifest and
lockfile. The staging updater verifies these dependencies in its pinned seed.
It also handles source changes without Python or app-root JavaScript dependency
changes; other dependency changes use the full
`Containerfile`.

The deployed `runtime-fa-a3165cb0-ada73d92-c2bbdcf5-039cf39f-a5340199-ui0f8d2a1-telephonyfa-helptitle`
candidate build used the prior
`runtime-fa-7ece4ec9-ada73d9-5213e0ac-940928b-ui0f8d2a1-pdfpos` image as its
dependency seed and built directly in that pinned runtime, without copying its 6 GB
filesystem into a separate builder stage. It verifies
the seed's app SHAs, proves the Frappe, ERPNext, Helpdesk and Insights Python
dependencies and app-root JavaScript dependencies did not change, then replaces
only app sources whose pins differ from the seed and the exact pinned Insights
Frappe UI package, and verifies
the formatter and ERPNext Banking date dependencies. It applies Helpdesk's versioned
Frappe UI patch only when needed, and validates exact patch postimages when the
pinned Frappe source already contains those changes, including normalization of
Windows CRLF source archives against LF Git patch blobs. This avoids reapplying
the shared UI changes to an already-localized source and avoids reinstalling the entire
Frappe Python environment from PyPI. It is valid only while that exact seed
image is present and all dependency checks pass. Use the full `Containerfile`
for Python or app-root dependency changes, or when the seed is unavailable.

Insights' pinned `frappe-ui` source is copied from its detached, exact-SHA checkout
into `frontend/node_modules/frappe-ui`. The updater verifies the dependency sections,
preserves the installed nested dependencies, and validates the formatter blob
before and after the asset build. A mismatch fails the image build before a candidate
can be activated; dependency changes use the full `Containerfile`.

The Frappe source repository is private and the build host has no GitHub key.
From the authorized Windows checkout, export the exact pinned commit as a
deterministic Git archive, verify its SHA-256 against
`FRAPPE_SOURCE_ARCHIVE_SHA256` in `Containerfile.staging-update`, gzip the tar,
and transfer that archive to the build host:

```powershell
git -C C:\path\to\frappe-persian archive --format=tar `
  --output=$env:TEMP\frappe-a3165cb0740c4fd1f16be8ae7c8f0fe9a668c020.tar `
  a3165cb0740c4fd1f16be8ae7c8f0fe9a668c020
$sourceStream = [System.IO.File]::OpenRead("$env:TEMP\frappe-a3165cb0740c4fd1f16be8ae7c8f0fe9a668c020.tar")
$compressedStream = [System.IO.File]::Create("$env:TEMP\frappe-a3165cb0740c4fd1f16be8ae7c8f0fe9a668c020.tar.gz")
$gzipStream = [System.IO.Compression.GZipStream]::new($compressedStream, [System.IO.Compression.CompressionLevel]::Optimal, $false)
try { $sourceStream.CopyTo($gzipStream) } finally { $gzipStream.Dispose(); $sourceStream.Dispose(); $compressedStream.Dispose() }
Get-FileHash $env:TEMP\frappe-a3165cb0740c4fd1f16be8ae7c8f0fe9a668c020.tar.gz -Algorithm SHA256
scp $env:TEMP\frappe-a3165cb0740c4fd1f16be8ae7c8f0fe9a668c020.tar.gz `
  carpet-erp:/home/ubuntu/helpdesk-persian-pipeline/docker/office-staging/frappe-source-a3165cb074.tar.gz
```

Build this candidate without touching the running services or their volumes:

```sh
APP_MANIFEST_SHA="$(sha256sum docker/office-staging/apps.json | cut -d' ' -f1)"
docker buildx build --load --progress=plain --allow network.host \
  --secret id=apps_json,src=docker/office-staging/apps.json \
  --build-arg APP_MANIFEST_SHA="$APP_MANIFEST_SHA" \
  --tag helpdesk-persian:runtime-fa-a3165cb0-ada73d92-78535a17-039cf39f-ins4441e48-ui0f8d2a1-welcome-fa \
  --file docker/office-staging/Containerfile.staging-update .
```

The archive is a read-only BuildKit bind mount into this temporary build stage,
so private source is verified but is not included in an image layer. Remove only
the temporary `docker/office-staging/frappe-source-a3165cb074.tar.gz` after the
build completes; preserve the pre-existing `frappe-source.tar.gz` archive.

The candidate pins Telephony source to
`039cf39f245d6818ead03cf94eea6ce7f9c1e1f7`. Since the local Persian catalog
commit `329e76408a1ae6d04c5f70771fe0778936ab2d2e` could not be pushed to
`frappe/telephony` (GitHub returned 403), the catalog is carried as the
SHA-256-checked source overlay `docker/office-staging/telephony-fa.po`, compiled
into this image, and validated by the builder.

The update image does not run database migrations. Validate it against the
separate test site first; only then recreate the intended Staging application
services with `compose.integrated-candidate.yaml` and run the browser smoke
checks. Keep the prior candidate image and existing volumes intact for rollback.

Git checkout and dependency-install `RUN` instructions use BuildKit's
`network.host` entitlement to avoid slow or stalled GitHub, PyPI, and npm
downloads through the Docker bridge. The image-asset compilation step uses the
default network mode. The builder must allow the `network.host` entitlement.
Frappe Bench still uses `uv` for virtual environments; the versioned `uv`
compatibility wrapper routes only `uv pip install` through pip, whose interrupted
wheel downloads were verified to resume successfully on this host. The wrapper
uses the official `https://pypi.org/simple` index and the verified local wheel
directory so stale injected package-index configuration cannot hide pinned
Frappe dependencies.

## Activate or roll back an image

Recreate only the application services (`backend`, `frontend`, `queue-long`,
`queue-short`, `scheduler`, and `websocket`) with the selected image. Keep the existing
`sites` volume and do not mount a separate volume at `sites/assets`; the image
owns the asset files. Do not run migrations as part of an asset-only rollout.

Use the existing `office-staging` Compose project explicitly. This prevents a
second project from being created when the base Compose files live under
`frappe_docker`:

```sh
docker compose --project-name office-staging \
  --project-directory /srv/office-staging/source/frappe_docker \
  -f /srv/office-staging/source/frappe_docker/compose.yaml \
  -f /srv/office-staging/compose.office.yaml \
  -f /home/ubuntu/helpdesk-persian-pipeline/docker/office-staging/compose.integrated-candidate.yaml \
  up -d --no-deps backend frontend websocket scheduler queue-long queue-short
```

`compose.integrated-candidate.yaml` is the versioned Staging override for
`helpdesk-persian:runtime-fa-a3165cb0-ada73d92-78535a17-039cf39f-ins4441e48-ui0f8d2a1-welcome-fa`. It uses `pull_policy: never`, so the
immutable local image must already exist on the target host. The previous deployed candidate
`helpdesk-persian:runtime-fa-cceef87b-ada73d9-efe1cfe1-940928b-ui0f8d2a1-pdfpos`,
`helpdesk-persian:runtime-fa-cceef87b-41ac010-efe1cfe1-940928b-ui0f8d2a1-pdfpos`,
`helpdesk-persian:runtime-fa-cceef87b-8e6261c8-efe1cfe1-940928b-ui0f8d2a1-pdfpos`,
`helpdesk-persian:runtime-fa-d1619647-dcf0c15-d68c193-i396a7e9-ui61f753a-jalali`,
`helpdesk-persian:runtime-fa-997b3bd-dcf0c15-02a0a07-aee50c4-ui34ac871-cachefix-c0338943f`, the earlier
`helpdesk-persian:runtime-fa-6076dd41c-i18n1` image, and the original
`helpdesk-persian:runtime-569be35` seed remain available for rollback. Build
the pinned image from this directory's `Containerfile.staging-update` before selecting it.
The current GHCR push was rejected by the registry, so this tag is host-local
until registry authorization is restored.

Frappe keeps the merged `assets.json` in the shared Redis cache. Replacing the
image does not invalidate that entry, so old cached paths can still be emitted
even when the new image contains a complete manifest. After recreating the app
services, invalidate only that cache entry and restart the backend workers so
their process-local cache is also refreshed:

```sh
docker compose exec -T backend bench --site office-staging.localhost execute \
  "frappe.client_cache.delete_value('assets_json', shared=True)"
docker compose exec -T backend bench --site office-staging.localhost execute \
  "frappe.cache.hdel('merged_translations', 'fa')"
docker compose restart backend
```

When a locale catalog changes, remove only that locale's field from
`merged_translations`; this lets Frappe reload the compiled catalog without
clearing unrelated Redis entries.

Before accepting the rollout, confirm the login page emits hashed `/assets/...`
URLs and that every referenced bundle returns HTTP 200. Use the same cache
invalidation after an image rollback. Do not clear Redis globally or remove any
volume as an asset-repair step.

### Previous deployment record — 2026-11-09

The candidate above is deployed to `office-staging`. All six application
containers (backend, frontend, both queues, scheduler, websocket) run image
`sha256:5b42cc0363c8bee60ff9fec7539d70e50cfefc39091233a48a78247af296ae56`.
The database container remained `a2b0a06d3e28` with the existing
`office-staging_db-data` volume. Only the `assets_json` cache entry and the
`fa` field of `merged_translations` were invalidated; the backend was restarted.

At that point, the QA account did not have Insights or agent access, so its
read-only dashboard data requests returned PermissionError and some pages were
captured before SPA content mounted. Those limitations were addressed for the
2026-11-10 candidate using the dedicated QA account described above.
