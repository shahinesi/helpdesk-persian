# Copyright (c) 2022, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt
import frappe


def set_fresh_setup_language():
    """Default first-time setup and guest login to Persian without saving it."""
    request = getattr(frappe.local, "request", None)
    if (
        request
        and request.path.rstrip("/") == "/login"
        and not frappe.form_dict.get("_lang")
        and not request.cookies.get("preferred_language")
    ):
        frappe.local.lang = "fa"
        return

    if (
        not request
        or not request.path.startswith("/desk/")
        or "setup-wizard" not in request.path
        or frappe.is_setup_complete()
    ):
        return

    settings = frappe.get_cached_doc("System Settings")
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
