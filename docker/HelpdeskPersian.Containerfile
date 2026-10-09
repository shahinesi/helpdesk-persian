FROM helpdesk-persian:styled AS frappe-ui-source

USER root
COPY desk/patches/frappe-ui-source.ref /tmp/frappe-ui-source.ref
RUN ref="$(tr -d '[:space:]' < /tmp/frappe-ui-source.ref)" \
    && git init -q /tmp/frappe-source \
    && git -C /tmp/frappe-source remote add origin https://github.com/frappe/frappe.git \
    && git -C /tmp/frappe-source config core.sparseCheckout true \
    && printf '/ui/\n' > /tmp/frappe-source/.git/info/sparse-checkout \
    && git -C /tmp/frappe-source fetch --depth=1 --filter=blob:none origin "$ref" \
    && git -C /tmp/frappe-source checkout --detach FETCH_HEAD \
    && test "$(git -C /tmp/frappe-source rev-parse HEAD)" = "$ref"

FROM helpdesk-persian:styled

USER root
RUN find /home/frappe/frappe-bench/apps/helpdesk -mindepth 1 -maxdepth 1 ! -name desk -exec rm -rf {} + \
    && find /home/frappe/frappe-bench/apps/helpdesk/desk -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {} +
COPY --from=frappe-ui-source --chown=frappe:frappe /tmp/frappe-source/ui/ /home/frappe/frappe-bench/apps/frappe/ui/
COPY --chown=frappe:frappe . /home/frappe/frappe-bench/apps/helpdesk/

USER frappe
WORKDIR /home/frappe/frappe-bench
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN source /home/frappe/.nvm/nvm.sh \
    && node_version="$(tr -d '[:space:]' < apps/helpdesk/desk/.nvmrc)" \
    && nvm install "$node_version" \
    && nvm exec "$node_version" npm install --global yarn@1.22.18 \
    && rm -rf apps/helpdesk/desk/node_modules/frappe-ui \
    && cd apps/helpdesk/desk \
    && nvm exec "$node_version" yarn install --frozen-lockfile --non-interactive
RUN mkdir -p sites && printf '{}' > sites/common_site_config.json \
    && source /home/frappe/.nvm/nvm.sh \
    && node_version="$(tr -d '[:space:]' < apps/helpdesk/desk/.nvmrc)" \
    && bench set-config -gp socketio_port 9000 \
    && bench compile-po-to-mo --app helpdesk --force \
    && (cd apps/helpdesk/desk && nvm exec "$node_version" yarn apply:ui-patches) \
    && CI=Yes nvm exec "$node_version" bench build --apps frappe,helpdesk
