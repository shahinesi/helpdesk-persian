FROM helpdesk-persian:styled

USER root
RUN find /home/frappe/frappe-bench/apps/helpdesk -mindepth 1 -maxdepth 1 ! -name desk -exec rm -rf {} + \
    && find /home/frappe/frappe-bench/apps/helpdesk/desk -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {} +
COPY --chown=frappe:frappe . /home/frappe/frappe-bench/apps/helpdesk/

USER frappe
WORKDIR /home/frappe/frappe-bench
RUN rm -rf apps/helpdesk/desk/node_modules/frappe-ui \
    && cd apps/helpdesk/desk && yarn install --frozen-lockfile --non-interactive
RUN mkdir -p sites && printf '{}' > sites/common_site_config.json \
    && bench set-config -gp socketio_port 9000 \
    && CI=Yes bench build --apps frappe,helpdesk
