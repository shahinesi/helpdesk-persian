#!/usr/bin/env python3
"""Fail the image build when Helpdesk's runtime Persian labels are missing."""

import gettext
import pathlib
import re
import sys


locale_root = pathlib.Path(sys.argv[1])
apps_to_check = sys.argv[2:]
catalog = gettext.translation(
    "helpdesk", localedir=str(locale_root), languages=["fa"], fallback=False
)
expected = {
    "First Ticket": "اولین تیکت",
    "Question": "پرسش",
    "Unspecified": "مشخص‌نشده",
}
missing = {
    message: (catalog.gettext(message), translation)
    for message, translation in expected.items()
    if catalog.gettext(message) != translation
}
if missing:
    raise SystemExit(f"Helpdesk Persian MO catalog is missing expected labels: {missing}")

print(f"validated {len(expected)} Helpdesk Persian translations from {locale_root}")

frappe_catalog = gettext.translation(
    "frappe", localedir=str(locale_root), languages=["fa"], fallback=False
)
frappe_expected = {"Continue": "ادامه"}
frappe_missing = {
    message: (frappe_catalog.gettext(message), translation)
    for message, translation in frappe_expected.items()
    if frappe_catalog.gettext(message) != translation
}
if frappe_missing:
    raise SystemExit(f"Frappe Persian MO catalog is missing expected labels: {frappe_missing}")

print(f"validated {len(frappe_expected)} Frappe Persian translations from {locale_root}")

insights_catalog = gettext.translation(
    "insights", localedir=str(locale_root), languages=["fa"], fallback=False
)
insights_expected = {"Continue": "ادامه"}
insights_missing = {
    message: (insights_catalog.gettext(message), translation)
    for message, translation in insights_expected.items()
    if insights_catalog.gettext(message) != translation
}
if insights_missing:
    raise SystemExit(f"Insights Persian MO catalog is missing expected labels: {insights_missing}")

print(f"validated {len(insights_expected)} Insights Persian translations from {locale_root}")

# Rendered numeric strings stay canonical ASCII; Vazirmatn supplies the glyphs.
# Catch static Persian/Arabic-Indic digits in any app's compiled fa catalog.
noncanonical_digits = re.compile(r"[\u0660-\u0669\u06F0-\u06F9]")
catalog_dir = locale_root / "fa" / "LC_MESSAGES"
digit_errors = []
catalog_names = apps_to_check or [path.stem for path in catalog_dir.glob("*.mo")]
for app_name in catalog_names:
    mo_path = catalog_dir / f"{app_name}.mo"
    if not mo_path.is_file():
        raise SystemExit(f"Missing compiled Persian catalog: {mo_path}")
    with mo_path.open("rb") as stream:
        compiled = gettext.GNUTranslations(stream)
    for translation in compiled._catalog.values():
        if isinstance(translation, str) and noncanonical_digits.search(translation):
            digit_errors.append((mo_path.name, translation))

if digit_errors:
    sample = digit_errors[:10]
    raise SystemExit(
        "Persian compiled translations contain noncanonical Unicode digits; "
        f"keep display digits ASCII: {sample}"
    )

print(f"validated canonical ASCII digits in {len(catalog_names)} Persian app catalogs")
