import frappe
from frappe.translate import get_all_translations


# nosemgrep: frappe-semgrep-rules.rules.security.guest-whitelisted-method -- public translation catalog only; no site or user data is returned.
@frappe.whitelist(allow_guest=True, methods=["GET"])
def get_translations():
    language = None
    if frappe.session.user != "Guest":
        language = frappe.db.get_value("User", frappe.session.user, "language")
    if not language:
        language = frappe.db.get_single_value("System Settings", "language")
    return {"language": language, "messages": get_all_translations(language)}
