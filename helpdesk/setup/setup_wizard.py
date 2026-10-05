# Copyright (c) 2022, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt
import frappe


def set_fresh_setup_language():
    """Use Persian for the unconfigured setup wizard request without saving it."""
    request = getattr(frappe.local, "request", None)
    if (
        not request
        or not request.path.startswith("/desk/")
        or "setup-wizard" not in request.path
        or frappe.is_setup_complete()
    ):
        return

    settings = frappe.db.get_value(
        "System Settings",
        "System Settings",
        ["language", "country", "time_zone", "currency"],
        as_dict=True,
    )
    if (
        settings
        and settings.get("language")
        and (
            settings.get("language") != "English"
            or any(settings.get(key) for key in ("country", "time_zone", "currency"))
        )
    ):
        return

    frappe.local.lang = "fa"


# nosemgrep
def setup_complete(args=None):
    email = args.get("email") or frappe.session.user
    if not email:
        return
    # Create first Agent for the user
    new_user = frappe.db.get_list(
        "User", filters={"email": email}, limit=1, pluck="name"
    )
    if not new_user:
        return
    new_user = new_user[0]
    new_agent = frappe.new_doc("HD Agent")
    new_agent.user = new_user
    new_agent.agent_name = new_user
    new_agent.insert(ignore_if_duplicate=True)
