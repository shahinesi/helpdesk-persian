#!/usr/bin/env bash
set -euo pipefail

patch_file="patches/frappe-ui+1.0.0-rc.1.patch"
target_patch="$(mktemp)"
trap 'rm -f "$target_patch"' EXIT

sed -n '/^diff --git a\/node_modules\/frappe-ui\/vite\/utils.js /,$p' "$patch_file" > "$target_patch"
test -s "$target_patch"
git apply --check "$target_patch"
git apply "$target_patch"
