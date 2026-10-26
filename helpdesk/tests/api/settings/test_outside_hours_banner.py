import unittest
from datetime import datetime

from helpdesk.helpdesk.doctype.hd_settings.helpers import _get_banner_date_context


class TestOutsideHoursBannerDateContext(unittest.TestCase):
    def test_persian_locale_defers_date_formatting_to_the_ui(self):
        response_by = datetime(2026, 3, 20, 20, 45)

        values = _get_banner_date_context(response_by, "fa_IR")

        self.assertEqual(
            values["next_working_day"],
            "__HELPDESK_LOCALIZED_DATE:next_working_day__",
        )
        self.assertEqual(
            values["expected_response"],
            "__HELPDESK_LOCALIZED_DATE:expected_response__",
        )
        self.assertEqual(
            values["next_working_daytime"],
            "__HELPDESK_LOCALIZED_DATE:next_working_daytime__",
        )

    def test_english_template_values_keep_the_existing_format(self):
        response_by = datetime(2026, 3, 25, 15, 5)

        values = _get_banner_date_context(response_by, "en")

        self.assertIs(values["next_working_daytime"], response_by)
        self.assertEqual(values["next_working_day"], "Wednesday, 25 Mar")
        self.assertEqual(values["next_working_date"], "25 Mar")
        self.assertEqual(values["expected_response"], "15:05, Wednesday, 25 Mar")

    def test_missing_response_date_returns_empty_template_values(self):
        values = _get_banner_date_context(None, "fa")

        self.assertTrue(all(value is None for value in values.values()))


if __name__ == "__main__":
    unittest.main()
