ARG FRAPPE_BUILD_IMAGE=ghcr.io/frappe/build:develop@sha256:6bf9b9443a88e823cce8882d8ff18e5e5c1c4b7b1908036047be8ea55a4e0f43
ARG FRAPPE_RUNTIME_IMAGE=ghcr.io/frappe/base:develop@sha256:c4df28afb5d53b793d0fb60aa58dab3bce3c920f9e85b426cf668f1b730ab191

FROM public.ecr.aws/docker/library/node:20.20.0-bookworm-slim@sha256:d8a35d586fad3af7abb6fdb9ba972388395405f4d462da9e4a4ddcde67b5e0fb AS node-runtime
RUN npm install --global --prefix /opt/yarn-v1.22.18 yarn@1.22.18

FROM ${FRAPPE_BUILD_IMAGE} AS builder
ARG HELPDESK_REF
USER frappe
WORKDIR /home/frappe
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
COPY --from=node-runtime /usr/local/ /opt/node-v20/
COPY --from=node-runtime /opt/yarn-v1.22.18/ /opt/yarn-v1.22.18/
COPY --chown=frappe:frappe desk/patches/frappe-ui-source.ref /tmp/frappe-source.ref
COPY --chown=frappe:frappe desk/patches/telephony-source.ref /tmp/telephony-source.ref
RUN test -n "$HELPDESK_REF" \
    && [[ "$HELPDESK_REF" =~ ^[0-9a-f]{40}$ ]] \
    && bench init --frappe-branch=develop --no-procfile --no-backups --skip-redis-config-generation --verbose /home/frappe/frappe-bench \
    && cd /home/frappe/frappe-bench \
    && frappe_ref="$(tr -d '[:space:]' < /tmp/frappe-source.ref)" \
    && git -C /home/frappe/frappe-bench/apps/frappe fetch --depth=1 upstream "$frappe_ref" \
    && git -C /home/frappe/frappe-bench/apps/frappe checkout --detach "$frappe_ref" \
    && test "$(git -C /home/frappe/frappe-bench/apps/frappe rev-parse HEAD)" = "$frappe_ref" \
    && bench get-app --branch=develop telephony https://github.com/frappe/telephony \
    && telephony_ref="$(tr -d '[:space:]' < /tmp/telephony-source.ref)" \
    && git -C /home/frappe/frappe-bench/apps/telephony fetch --depth=1 upstream "$telephony_ref" \
    && git -C /home/frappe/frappe-bench/apps/telephony checkout --detach "$telephony_ref" \
    && test "$(git -C /home/frappe/frappe-bench/apps/telephony rev-parse HEAD)" = "$telephony_ref" \
    && bench get-app --branch=custom/develop-fa helpdesk https://github.com/shahinesi/helpdesk-persian \
    && git -C /home/frappe/frappe-bench/apps/helpdesk fetch --depth=1 upstream "$HELPDESK_REF" \
    && git -C /home/frappe/frappe-bench/apps/helpdesk checkout --detach "$HELPDESK_REF" \
    && test "$(git -C /home/frappe/frappe-bench/apps/helpdesk rev-parse HEAD)" = "$HELPDESK_REF"

WORKDIR /home/frappe/frappe-bench
RUN bench setup requirements --dev \
    && export PATH="/opt/yarn-v1.22.18/bin:/opt/node-v20/bin:${PATH}" \
    && test "$(node --version)" = "v20.20.0" \
    && test "$(yarn --version)" = "1.22.18" \
    && cd apps/helpdesk/desk \
    && yarn install --frozen-lockfile --non-interactive \
    && yarn apply:ui-patches \
    && yarn apply:ui-patches \
    && cd /home/frappe/frappe-bench \
    && mkdir -p sites \
    && printf '{}' > sites/common_site_config.json \
    && bench set-config -gp socketio_port 9000 \
    && bench compile-po-to-mo --app helpdesk --force \
    && CI=Yes bench build --apps frappe,helpdesk,telephony \
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
