from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import patch

import frappe

from helpdesk.setup.setup_wizard import set_fresh_setup_language


class TestFreshSetupLanguage(TestCase):
    def test_unconfigured_wizard_request_uses_persian(self):
        with (
            patch.object(frappe, "is_setup_complete", return_value=False),
            patch.object(frappe, "db", SimpleNamespace(get_value=None)),
            patch.object(
                frappe.local,
                "request",
                SimpleNamespace(path="/desk/build/setup-wizard/0"),
                create=True,
            ),
            patch.object(frappe.local, "lang", "en", create=True),
        ):
            with patch.object(frappe.db, "get_value", return_value={}):
                set_fresh_setup_language()
            self.assertEqual(frappe.local.lang, "fa")

    def test_existing_settings_are_preserved(self):
        settings = {
            "language": "English",
            "country": "Germany",
            "time_zone": "Europe/Berlin",
            "currency": "EUR",
        }
        with (
            patch.object(frappe, "is_setup_complete", return_value=False),
            patch.object(frappe, "db", SimpleNamespace(get_value=None)),
            patch.object(
                frappe.local,
                "request",
                SimpleNamespace(path="/desk/build/setup-wizard/0"),
                create=True,
            ),
            patch.object(frappe.local, "lang", "en", create=True),
        ):
            with patch.object(frappe.db, "get_value", return_value=settings):
                set_fresh_setup_language()
            self.assertEqual(frappe.local.lang, "en")

    def test_default_english_without_region_uses_persian(self):
        settings = {"language": "English"}
        with (
            patch.object(frappe, "is_setup_complete", return_value=False),
            patch.object(frappe, "db", SimpleNamespace(get_value=None)),
            patch.object(
                frappe.local,
                "request",
                SimpleNamespace(path="/desk/build/setup-wizard/0"),
                create=True,
            ),
            patch.object(frappe.local, "lang", "en", create=True),
        ):
            with patch.object(frappe.db, "get_value", return_value=settings):
                set_fresh_setup_language()
            self.assertEqual(frappe.local.lang, "fa")

    def test_missing_language_with_existing_region_uses_persian(self):
        settings = {
            "country": "Germany",
            "time_zone": "Europe/Berlin",
            "currency": "EUR",
        }
        with (
            patch.object(frappe, "is_setup_complete", return_value=False),
            patch.object(frappe, "db", SimpleNamespace(get_value=None)),
            patch.object(
                frappe.local,
                "request",
                SimpleNamespace(path="/desk/build/setup-wizard/0"),
                create=True,
            ),
            patch.object(frappe.local, "lang", "en", create=True),
        ):
            with patch.object(frappe.db, "get_value", return_value=settings):
                set_fresh_setup_language()
            self.assertEqual(frappe.local.lang, "fa")
