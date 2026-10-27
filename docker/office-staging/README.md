# Office Staging image

This image builds apps sequentially in the immutable image builder and validates
the manifest before assets are moved out of `sites/`. Sequential builds limit
peak memory on the Office host. Do not run `bench build` in an application
container that has the persistent `sites` volume mounted.

The image pins the Frappe build/base images by digest. `apps.json` selects the
Git remotes and initial branches; after clone, the builder fetches and checks
out the exact expected SHA for every app before reconciling dependencies or
building assets. Supply `docker/office-staging/apps.json` as the BuildKit secret
`apps_json`, pass its SHA-256 as `APP_MANIFEST_SHA`, and provide all five
`*_EXPECTED_SHA` bootstrap values. The separate `*_PINNED_SHA` values select
the final app commits; their defaults match the currently tested Persian
branches. The manifest digest and bootstrap refs participate in the cached
initialization layer, while final pins invalidate the checkout/dependency/build
layers. Update refs and pins together only after compatibility checks.
After checking out final revisions, the builder installs each app's locked
JavaScript dependencies before running its asset build. This is required when
a final pin adds packages that were absent from the bootstrap branch.
Insights has its own Vite frontend and island bundles; the builder runs its
versioned `yarn build` script before linking and validating the final assets.

The Frappe build environment also installs Typst 0.15.0. On hosts where the
BuildKit container cannot reliably stream the 34 MB PyPI wheel, fetch it on the
build host into the Docker build context. The helper downloads bounded HTTP
ranges from the official PyPI artifact and verifies its pinned size and SHA-256
before returning:

```sh
sh docker/office-staging/fetch-typst-wheel.sh docker/office-staging/typst.whl
```

The generated wheel is ignored by Git but included in the Docker context. The
Containerfile verifies the same digest and directs `uv` to this local wheel;
the wheel is copied only into the intermediate builder stage and is absent from
the resulting runtime image.

The build must finish successfully and the asset validator must pass before
any Staging service uses the candidate image. The final image contains a real,
image-owned `assets/` directory even when the builder's `sites/assets` path is
a symlink. Keep the previous image digest and database backup available for
rollback; image rollback is appropriate only when the candidate has not applied
a database migration.

## Activate or roll back an image

Recreate only the application services (`backend`, `frontend`, `queue-long`,
`queue-short`, and `websocket`) with the selected image. Keep the existing
`sites` volume and do not mount a separate volume at `sites/assets`; the image
owns the asset files. Do not run migrations as part of an asset-only rollout.

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
