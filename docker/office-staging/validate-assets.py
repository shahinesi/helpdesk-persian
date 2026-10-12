#!/usr/bin/env python3
"""Fail an Office image build if bundled asset mappings do not resolve."""

import json
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit


assets_root = Path(sys.argv[1]).resolve()
manifest_path = assets_root / "assets.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

required = {
    "desk.bundle.js",
    "libs.bundle.js",
    "frappe-web.bundle.js",
    "desk.bundle.css",
    "erpnext.bundle.js",
    "insights.chart.island.js",
    "insights.dashboard.island.js",
}
missing = sorted(required - manifest.keys())
if missing:
    raise SystemExit(f"Required asset keys missing from {manifest_path}: {missing}")

unresolved = []
for key, value in manifest.items():
    path = urlsplit(value).path
    if not path.startswith("/assets/"):
        continue
    target = assets_root / unquote(path.removeprefix("/assets/"))
    if not target.is_file():
        unresolved.append((key, value, str(target)))

if unresolved:
    for key, value, target in unresolved:
        print(f"unresolved asset: {key} -> {value} ({target})", file=sys.stderr)
    raise SystemExit(f"{len(unresolved)} manifest asset(s) do not resolve")

print(f"validated {len(manifest)} asset mappings from {manifest_path}")
