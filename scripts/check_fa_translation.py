#!/usr/bin/env python3
"""Fail when active Persian translations are incomplete or alter placeholders."""

import ast
import collections
import string
import re
import sys
from pathlib import Path


def parse_catalog(path):
    entries = []
    obsolete_count = 0
    for block in path.read_text(encoding="utf-8").split("\n\n"):
        entry = {"flags": set(), "msgid": "", "plural": None, "msgstr": {}}
        active = None
        obsolete = False
        for line in block.splitlines():
            if line.startswith("#~"):
                obsolete = True
                continue
            if line.startswith("#, "):
                entry["flags"].update(flag.strip() for flag in line[3:].split(","))
                continue
            if line.startswith("#") or not line:
                continue

            field = re.match(r"(msgctxt|msgid_plural|msgid)\s+(.*)", line)
            if field:
                active = field.group(1)
                value = ast.literal_eval(field.group(2))
                if active == "msgid":
                    entry["msgid"] += value
                elif active == "msgid_plural":
                    entry["plural"] = value
                continue

            translation = re.match(r"msgstr(?:\[(\d+)\])?\s+(.*)", line)
            if translation:
                index = translation.group(1) or "0"
                active = f"msgstr:{index}"
                entry["msgstr"][index] = ast.literal_eval(translation.group(2))
                continue

            if line.startswith('"') and active:
                value = ast.literal_eval(line)
                if active == "msgid":
                    entry["msgid"] += value
                elif active == "msgid_plural":
                    entry["plural"] = (entry["plural"] or "") + value
                elif active.startswith("msgstr:"):
                    index = active.split(":", 1)[1]
                    entry["msgstr"][index] += value

        if obsolete:
            obsolete_count += bool(re.search(r"^#~ msgid ", block, re.MULTILINE))
            continue
        if entry["msgid"] or entry["msgstr"]:
            entries.append(entry)
    return entries, obsolete_count


def check(path):
    entries, obsolete_count = parse_catalog(path)
    header = next((entry for entry in entries if not entry["msgid"]), None)
    # The PO header is intentionally not part of the active message list.
    entries = [entry for entry in entries if entry["msgid"]]
    nplurals = 2
    if header:
        header_text = header["msgstr"].get("0", "")
        match = re.search(r"nplurals\s*=\s*(\d+)", header_text)
        if match:
            nplurals = int(match.group(1))

    fuzzy = [entry for entry in entries if "fuzzy" in entry["flags"]]
    incomplete_plural = [
        entry
        for entry in entries
        if entry["plural"] is not None
        and any(not entry["msgstr"].get(str(index), "") for index in range(nplurals))
    ]
    untranslated = [
        entry
        for entry in entries
        if any(not value for value in entry["msgstr"].values()) or not entry["msgstr"]
    ]
    translated = [
        entry
        for entry in entries
        if entry not in untranslated
        and entry not in fuzzy
        and entry not in incomplete_plural
    ]
    placeholder_errors = []
    for entry in entries:
        for index, translated_text in entry["msgstr"].items():
            if not translated_text:
                continue
            source = entry["msgid"]
            if index != "0" and entry["plural"] is not None:
                source = entry["plural"]
            source_fields = collections.Counter(
                field for _, field, _, _ in string.Formatter().parse(source) if field
            )
            printf_fields = collections.Counter(
                re.findall(
                    r"%(?:\([^)]+\))?[#0 +\-]?(?:\d+|\*)?(?:\.\d+|\.\*)?[a-zA-Z]",
                    source,
                )
            )
            try:
                translated_fields = collections.Counter(
                    field
                    for _, field, _, _ in string.Formatter().parse(translated_text)
                    if field
                )
            except ValueError:
                placeholder_errors.append((entry["msgid"], index, "invalid brace format"))
                continue
            if source_fields != translated_fields:
                placeholder_errors.append((entry["msgid"], index, "brace placeholders differ"))
            if "python-format" in entry["flags"]:
                translated_printf = collections.Counter(
                    re.findall(
                        r"%(?:\([^)]+\))?[#0 +\-]?(?:\d+|\*)?(?:\.\d+|\.\*)?[a-zA-Z]",
                        translated_text,
                    )
                )
                if printf_fields != translated_printf:
                    placeholder_errors.append((entry["msgid"], index, "printf placeholders differ"))

    print(f"Total active entries: {len(entries)}")
    print(f"Translated: {len(translated)}")
    print(f"Untranslated: {len(untranslated)}")
    print(f"Fuzzy: {len(fuzzy)}")
    print(f"Plural incomplete: {len(incomplete_plural)}")
    print(f"Placeholder errors: {len(placeholder_errors)}")
    print(f"Obsolete: {obsolete_count}")
    coverage = 100 * len(translated) / len(entries) if entries else 100
    print(f"Coverage: {coverage:.2f}%")
    for label, problems in (
        ("untranslated", untranslated),
        ("fuzzy", fuzzy),
        ("plural incomplete", incomplete_plural),
    ):
        for entry in problems[:5]:
            print(f"{label}: {entry['msgid']}", file=sys.stderr)
    for msgid, index, reason in placeholder_errors[:10]:
        print(f"placeholder error ({reason}, form {index}): {msgid}", file=sys.stderr)

    return bool(untranslated or fuzzy or incomplete_plural or placeholder_errors)


if __name__ == "__main__":
    catalog = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("helpdesk/locale/fa.po")
    raise SystemExit(check(catalog))
