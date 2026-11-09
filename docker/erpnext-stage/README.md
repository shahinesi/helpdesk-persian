# ERPNext 16 Jalali Datepicker staging image

This image rebuilds the standalone Jalali Shamsi Datepicker app for the separate
ERPNext 16 staging site. The app source archive is exported from repository
commit `03c7416` and stored with this build recipe because the upstream app
repository is readable but does not grant this account push access.

- Base image: `frappe/erpnext@sha256:eee240a179ff494cb82ad067d853c8db3f87171d86324f4b326892654e342144`
- App source: `Atshan/jalali_shamsi_datepicker` commit `03c7416`
- The Containerfile checks the source archive SHA-256 before extraction.
- The app has no Python dependencies beyond Frappe, already in the base image;
  the build registers its source path in the virtualenv without downloading a
  package build backend.
- Its browser bundle is built with pnpm 11.25.0 from the pinned JavaScript
  lockfile, checked in with the app source, and verified by the unit suite. The
  ERPNext 16 base image otherwise tries to rerun the app build through Yarn,
  where the locked JavaScript dependencies are unavailable offline.
- The image links app `public` files into `bench/assets`, served by Frappe at `/assets`.
- No database migration is needed; this change only updates frontend code and a
  font asset. Keep the existing `erpnext-stage_sites` volume attached read-only
  for candidate checks, then reuse it when replacing application containers.

Build from the repository root:

```sh
docker build --progress=plain \
  --file docker/erpnext-stage/Dockerfile \
  --tag erpnext-jalali:stage-03c7416-rtlfont-rtlfont \
  docker/erpnext-stage
```

Before activating the candidate, check the image with a one-off container and
the existing site volume mounted read-only. Do not run `bench migrate` for this
frontend-only update.
