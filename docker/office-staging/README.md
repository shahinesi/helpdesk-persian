# Office Staging image

This image builds assets in the immutable image builder and validates the
manifest before assets are moved out of `sites/`. Do not run `bench build` in
an application container that has the persistent `sites` volume mounted.

The image pins the Frappe build/base images by digest and checks the five app
SHAs recorded by the staging release. Supply `docker/office-staging/apps.json`
as the BuildKit secret `apps_json`, and set `HELPDESK_EXPECTED_SHA` to the exact
commit selected by that manifest. Update refs and pins together only after
compatibility checks.

The build must finish successfully and the asset validator must pass before
any Staging service uses the candidate image. Keep the previous image tag and
database backup available for rollback; image rollback is appropriate only
when the candidate has not applied a database migration.
