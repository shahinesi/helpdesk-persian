# Recovery manifest — 2026-10-09

Snapshot captured at 2026-10-09 19:52 UTC before additional branch synchronization or deployment.

## Repository

Repository: `shahinesi/helpdesk-persian`  
Default branch: `develop`  
Working branch: `feat/persian-setup-wizard`  
Working tree at snapshot: clean  
Feature SHA at snapshot: `57446ad5d4e78cae713b2b2edb48927b2a3b9828`

| Ref | SHA |
|---|---|
| `origin/develop` | `4fa67fc613c98acf90344e9836749ec5364098be` |
| `origin/main` / `origin/vendor/main` | `1c3361cc0019deec6f84035a9352270b4e4eb5cb` |
| `origin/main-hotfix` / `origin/vendor/main-hotfix` | `26dbace988e0664ce0fbecedf91f1e63a80d46de` |
| `origin/legacy` / `origin/vendor/legacy` | `602cacdea690b1b35f5a40444761e05db3c2ab90` |
| `origin/vendor/develop` | `60e7641011607294724c95995a216a17a993df56` |
| `origin/custom/develop-fa` | `3ac43410518fc4a4446815d5e756e1d65c727335` |
| `origin/sync/develop-fa` | `0c595b1e01cd5660eb158ded417529804b178b6c` |
| `origin/feat/persian-setup-wizard` | `57446ad5d4e78cae713b2b2edb48927b2a3b9828` |

Upstream SHAs: `main` `1c3361cc0019deec6f84035a9352270b4e4eb5cb`; `develop` `60e7641011607294724c95995a216a17a993df56`; `main-hotfix` `d978f39d2a0186d2d03aa21cf9a679a483bf2146`; `legacy` `602cacdea690b1b35f5a40444761e05db3c2ab90`.

`develop` has 5 fork-only commits and is 10 commits behind upstream, so it is not a safe fast-forward mirror. `main-hotfix` is a safe 20-commit fast-forward candidate. `custom/develop-fa` has 179 commits beyond its merge base and is 10 commits behind upstream; it remains unchanged. `custom/main-fa` does not exist. Upstream `main` and `develop` diverge from merge base `536d06681ffbb31ea5a770a5340294c12825c714` by 2,608 and 3,542 commits respectively.

PR #1 is open from `feat/persian-setup-wizard` to `develop`; GitHub reports `MERGEABLE`, with checks still running. No merge was performed.

## Running site

SSH inventory name: `carpet-erp`  
Compose project: `helpdesk-persian-test`  
Public route: `helpdesk.ircarpet-r.com`  
Running application SHA: `b978318cd83e249ba24d7702dd1be862a1596345`  
Running application image digest: `sha256:8a4ed272e5f8661bb270ed6b5930ed5fab692d385dc2d67abd01bcb1c9a3066d`  
HTTP check before changes: `200`  
Free disk at snapshot: `6.4 GB`

The route is public; the Compose project name alone does not prove the database contains only test records. Database, Redis, site settings, and volumes were unchanged.

## Pre-deployment backup

Backup directory inside the persistent Bench site volume:

`/home/frappe/frappe-bench/sites/backups/pre-57446ad5`

Backup timestamp: `2026-10-09 23:20` Asia/Tehran. `gzip -t` passed for the SQL archive; both `.tgz` archives listed successfully; the site-config JSON parsed. The backup has not been restored in an isolated site.

| Artifact | SHA-256 |
|---|---|
| Database | `f6992bb600e5a838a80d5c6eb20d5db45643326e87b916de79d009f1b8471c5c` |
| Public files | `0a3fea366575e4c144e5d258df62bba26b39daa0e3a3fe194bfddaecc5ce7169` |
| Private files | `b226759f387318b3453aa1eed65883d00e11aea286c9de82601b4a2700beb457` |
| Site configuration archive | `3fa3145d92e7aedeb84bb6f92104897f0ffa262e7cfb2dd3c1223b144efd15a4` |

No backup contents or credential values are committed here.

## Safe changes after the snapshot

The remote `main-hotfix` and `vendor/main-hotfix` refs were each fast-forwarded from `26dbace988e0664ce0fbecedf91f1e63a80d46de` to upstream SHA `d978f39d2a0186d2d03aa21cf9a679a483bf2146`. The update used ordinary non-force pushes; the remote refs were read back and verified. All other refs and the running site remained unchanged at that point.
