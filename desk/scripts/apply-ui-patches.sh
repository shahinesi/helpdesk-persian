#!/usr/bin/env bash

set -euo pipefail

desk_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
patch_dir="$desk_dir/patches"
framework_ui="$desk_dir/../../frappe/ui"
frappe_ui="$desk_dir/node_modules/frappe-ui"

if [[ ! -d "$framework_ui" ]]; then
	echo "Frappe UI source is missing: expected $framework_ui (run inside a Frappe bench checkout)." >&2
	exit 1
fi

if [[ ! -d "$frappe_ui" ]]; then
	echo "frappe-ui is not installed: run yarn install without --ignore-scripts." >&2
	exit 1
fi

frappe_ui_version="$(node -p "require('$frappe_ui/package.json').version")"
if [[ "$frappe_ui_version" != "1.0.0-rc.1" ]]; then
	echo "Unsupported frappe-ui version: $frappe_ui_version (expected 1.0.0-rc.1)." >&2
	exit 1
fi

if git -C "$framework_ui" rev-parse --verify HEAD >/dev/null 2>&1; then
	expected_ref="$(tr -d '[:space:]' < "$patch_dir/frappe-ui-source.ref")"
	actual_ref="$(git -C "$framework_ui" rev-parse HEAD)"
	if [[ "$actual_ref" != "$expected_ref" ]]; then
		echo "Unsupported frappe/ui source: $actual_ref (expected $expected_ref)." >&2
		exit 1
	fi
fi

if ! git -C "$frappe_ui" apply --reverse --check -p3 "$patch_dir/frappe-ui+1.0.0-rc.1.patch" >/dev/null 2>&1; then
	echo "frappe-ui patch is missing or has drifted; reinstall dependencies before building." >&2
	exit 1
fi

framework_patch="$patch_dir/frappe-ui-framework.diff"
if git -C "$framework_ui" apply --reverse --check --directory=ui -p1 "$framework_patch" >/dev/null 2>&1; then
	echo "Frappe UI Persian patch is already applied."
else
	echo "Applying Frappe UI Persian patch."
	git -C "$framework_ui" apply --directory=ui -p1 "$framework_patch"
fi
