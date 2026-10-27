#!/usr/bin/env python3
"""Fail the image build when Helpdesk's runtime Persian labels are missing."""

import gettext
import pathlib
import sys


locale_root = pathlib.Path(sys.argv[1])
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
