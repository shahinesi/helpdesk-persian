# Office Staging image

This image builds apps sequentially in the immutable image builder and validates
the manifest before assets are moved out of `sites/`. Sequential builds limit
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
  --tag helpdesk-persian:runtime-fa-585f75d \
  --file docker/office-staging/Containerfile .
```

The build must finish successfully and the asset validator must pass before
any Staging service uses the candidate image. The final image contains a real,
image-owned `assets/` directory even when the builder's `sites/assets` path is
a symlink. Keep the previous image digest and database backup available for
rollback; image rollback is appropriate only when the candidate has not applied
a database migration.

For a source-only update whose Python dependency manifests are unchanged, the
versioned `Containerfile.staging-update` reuses the existing
`runtime-569be35` dependency seed and preserves its installed Python and Node
packages. It verifies the seed's app SHAs, proves the Helpdesk and Insights
Python dependencies did not change, checks the relevant JavaScript packages,
then replaces Helpdesk, Insights, and Insights' pinned Frappe UI source before
building and validating their assets. It applies only the new Vite path hunk
from Helpdesk's versioned Frappe UI patch, leaving the seed image's other
already-applied package hunks and patch-package state intact. This avoids reinstalling the entire
Frappe Python environment from PyPI. It is only valid while that exact seed
image is present and the dependency checks pass; use the full `Containerfile`
when the base app pins or dependency manifests change.

Build this candidate without touching the running services or their volumes:

```sh
docker image inspect helpdesk-persian:runtime-569be35 --format '{{.Id}}'
docker buildx build --load --progress=plain --allow network.host \
  --tag helpdesk-persian:runtime-fa-585f75d \
  --file docker/office-staging/Containerfile.staging-update .
```

The update image does not run database migrations. Validate it against the
separate test site first; only then recreate the intended Staging application
services with `compose.integrated-candidate.yaml` and run the browser smoke
checks. Keep the `runtime-569be35` image and existing volumes intact for
rollback.

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
`queue-short`, and `websocket`) with the selected image. Keep the existing
`sites` volume and do not mount a separate volume at `sites/assets`; the image
owns the asset files. Do not run migrations as part of an asset-only rollout.

`compose.integrated-candidate.yaml` is the versioned Staging override for
`helpdesk-persian:runtime-fa-585f75d`. It uses `pull_policy: never`, so the
immutable local image must already exist on the target host. The previous
`helpdesk-persian:runtime-569be35` image remains available for rollback. Build
the pinned image from this directory's `Containerfile` before selecting it.
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
docker compose restart backend
```

Before accepting the rollout, confirm the login page emits hashed `/assets/...`
URLs and that every referenced bundle returns HTTP 200. Use the same cache
invalidation after an image rollback. Do not clear Redis globally or remove any
volume as an asset-repair step.
