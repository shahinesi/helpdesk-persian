ARG FRAPPE_BUILD_IMAGE=ghcr.io/frappe/build:develop@sha256:6bf9b9443a88e823cce8882d8ff18e5e5c1c4b7b1908036047be8ea55a4e0f43
ARG FRAPPE_RUNTIME_IMAGE=ghcr.io/frappe/base:develop@sha256:c4df28afb5d53b793d0fb60aa58dab3bce3c920f9e85b426cf668f1b730ab191

FROM ${FRAPPE_BUILD_IMAGE} AS builder
ARG FRAPPE_REF
ARG ERPNEXT_REF
ARG HELPDESK_REF
ARG INSIGHTS_REF
ARG TELEPHONY_REF
ARG FRAPPE_UI_REF
USER frappe
WORKDIR /home/frappe
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN for ref in "$FRAPPE_REF" "$ERPNEXT_REF" "$HELPDESK_REF" "$INSIGHTS_REF" "$TELEPHONY_REF" "$FRAPPE_UI_REF"; do [[ "$ref" =~ ^[0-9a-f]{40}$ ]] || exit 1; done \
    && bench init --frappe-branch=develop --no-procfile --no-backups --skip-redis-config-generation --verbose /home/frappe/frappe-bench \
    && cd /home/frappe/frappe-bench \
    && git -C apps/frappe fetch --depth=1 https://github.com/shahinesi/frappe-persian.git "$FRAPPE_REF" \
    && git -C apps/frappe checkout --detach "$FRAPPE_REF" \
    && test "$(git -C apps/frappe rev-parse HEAD)" = "$FRAPPE_REF" \
    && bench get-app --skip-assets --branch=custom/develop-fa erpnext https://github.com/shahinesi/erpnext-persian \
    && git -C apps/erpnext fetch --depth=1 https://github.com/shahinesi/erpnext-persian.git "$ERPNEXT_REF" \
    && git -C apps/erpnext checkout --detach "$ERPNEXT_REF" \
    && test "$(git -C apps/erpnext rev-parse HEAD)" = "$ERPNEXT_REF" \
    && bench get-app --skip-assets --branch=develop telephony https://github.com/frappe/telephony \
    && git -C apps/telephony fetch --depth=1 https://github.com/frappe/telephony.git "$TELEPHONY_REF" \
    && git -C apps/telephony checkout --detach "$TELEPHONY_REF" \
    && test "$(git -C apps/telephony rev-parse HEAD)" = "$TELEPHONY_REF" \
    && bench get-app --skip-assets --branch=custom/develop-fa insights https://github.com/shahinesi/insights-persian \
    && git -C apps/insights fetch --depth=1 https://github.com/shahinesi/insights-persian.git "$INSIGHTS_REF" \
    && git -C apps/insights checkout --detach "$INSIGHTS_REF" \
    && test "$(git -C apps/insights rev-parse HEAD)" = "$INSIGHTS_REF" \
    && bench get-app --skip-assets --branch=custom/develop-fa helpdesk https://github.com/shahinesi/helpdesk-persian \
    && git -C /home/frappe/frappe-bench/apps/helpdesk diff --cached --quiet \
    && git -C /home/frappe/frappe-bench/apps/helpdesk diff --quiet -- . ':(exclude)yarn.lock' ':(exclude)desk/yarn.lock' \
    && git -C /home/frappe/frappe-bench/apps/helpdesk restore --worktree -- yarn.lock desk/yarn.lock \
    && git -C /home/frappe/frappe-bench/apps/helpdesk diff --quiet \
    && git -C /home/frappe/frappe-bench/apps/helpdesk fetch --depth=1 https://github.com/shahinesi/helpdesk-persian.git "$HELPDESK_REF" \
    && git -C /home/frappe/frappe-bench/apps/helpdesk checkout --detach "$HELPDESK_REF" \
    && test "$(git -C /home/frappe/frappe-bench/apps/helpdesk rev-parse HEAD)" = "$HELPDESK_REF" \
    && grep -Fq "github.com/shahinesi/frappe-ui-persian.git#$FRAPPE_UI_REF" apps/helpdesk/desk/package.json \
    && grep -Fq "frappe-ui@https://github.com/shahinesi/frappe-ui-persian.git#$FRAPPE_UI_REF\":" apps/helpdesk/desk/yarn.lock \
    && grep -Fq "resolved \"https://github.com/shahinesi/frappe-ui-persian.git#$FRAPPE_UI_REF\"" apps/helpdesk/desk/yarn.lock \
    && grep -Fq "shahinesi/frappe-ui-persian#$FRAPPE_UI_REF" apps/insights/frontend/package.json \
    && grep -Fq "frappe-ui@github:shahinesi/frappe-ui-persian#$FRAPPE_UI_REF\":" apps/insights/frontend/yarn.lock

WORKDIR /home/frappe/frappe-bench
RUN bench setup requirements --python \
    && bench setup requirements --dev \
    && PYTHONPATH=apps/frappe:apps/helpdesk env/bin/python -c 'from helpdesk.helpdesk.doctype.hd_ticket.hd_ticket import HDTicket; print(HDTicket.__name__)' \
    && npm install --global --prefix /home/frappe/.local yarn@1.22.18 \
    && export PATH="/home/frappe/.local/bin:/home/frappe/.nvm/versions/node/v24.21.0/bin:${PATH}" \
    && test "$(node --version)" = "v24.21.0" \
    && test "$(yarn --version)" = "1.22.18" \
    && cd apps/helpdesk/desk \
    && yarn install --frozen-lockfile --non-interactive \
    && yarn apply:ui-patches \
    && yarn apply:ui-patches \
    && cd /home/frappe/frappe-bench/apps/insights/frontend \
    && yarn install --frozen-lockfile --non-interactive \
    && grep -A8 -F "frappe-ui@github:shahinesi/frappe-ui-persian#$FRAPPE_UI_REF\":" yarn.lock \
    && node --conditions=import --input-type=module -e 'import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url"; const packagePath = path.resolve("node_modules/frappe-ui"); const packageRealPath = fs.realpathSync(packagePath); const manifestPath = path.join(packageRealPath, "package.json"); const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")); console.log("Insights installed frappe-ui metadata:", JSON.stringify({ packagePath, packageRealPath, manifestPath, name: manifest.name, version: manifest.version, exports: { localization: manifest.exports?.["./localization"], localizationStyle: manifest.exports?.["./localization/style.css"] } }, null, 2)); const api = import.meta.resolve("frappe-ui/localization"); const style = import.meta.resolve("frappe-ui/localization/style.css"); for (const [name, url] of [["localization", api], ["localization style", style]]) { if (url.startsWith("file:")) { const resolvedPath = fileURLToPath(url); if (!fs.existsSync(resolvedPath)) throw new Error(`${name} export target is missing: ${resolvedPath}`); } } console.log("Insights ESM public exports resolve:", JSON.stringify({ localization: api, localizationStyle: style }));' \
    && cd /home/frappe/frappe-bench \
    && mkdir -p sites \
    && printf '{}' > sites/common_site_config.json \
    && bench set-config -gp socketio_port 9000 \
    && bench compile-po-to-mo --app helpdesk --force \
    && CI=Yes bench build --apps frappe,erpnext,helpdesk,insights,telephony \
    && for app in frappe erpnext helpdesk insights; do test -d "sites/assets/$app" && find -L "sites/assets/$app" -type f -size +0c -print -quit | grep -q .; done \
    && printf '{"frappe":"%s","erpnext":"%s","helpdesk":"%s","insights":"%s","telephony":"%s","frappe_ui":"%s"}\n' "$FRAPPE_REF" "$ERPNEXT_REF" "$HELPDESK_REF" "$INSIGHTS_REF" "$TELEPHONY_REF" "$FRAPPE_UI_REF" > candidate-sha-manifest.json \
    && find apps -mindepth 1 -path '*/.git' -prune -exec rm -rf {} +

FROM ${FRAPPE_RUNTIME_IMAGE} AS runtime
USER frappe
COPY --from=builder --chown=frappe:0 /home/frappe/frappe-bench /home/frappe/frappe-bench
WORKDIR /home/frappe/frappe-bench
RUN chmod -R g=u /home/frappe/frappe-bench \
    && cp -r sites/assets assets \
    && rm -rf sites/assets
VOLUME ["/home/frappe/frappe-bench/sites", "/home/frappe/frappe-bench/logs"]
USER root
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod 755 /usr/local/bin/entrypoint.sh /usr/local/bin/start.sh
USER frappe
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["start.sh"]
