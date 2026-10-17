#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
	echo "Usage: $0 /path/to/frappe-ui-persian" >&2
	exit 2
fi

desk_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fui_repo="$(cd "$1" && pwd)"
fui_ref="58dec793b0227614d396ba293395c6bcc60e1425"
patch_file="$desk_dir/patches/frappe-ui+1.0.0.patch"
tmp_dir="$(mktemp -d)"
base_tree="$tmp_dir/base"
check_tree="$tmp_dir/check"

cleanup() {
	git -C "$fui_repo" worktree remove --force "$base_tree" >/dev/null 2>&1 || true
	git -C "$fui_repo" worktree remove --force "$check_tree" >/dev/null 2>&1 || true
	rm -rf "$tmp_dir"
}
trap cleanup EXIT

actual_ref="$(git -C "$fui_repo" rev-parse HEAD)"
if [[ "$actual_ref" != "$fui_ref" ]]; then
	echo "Expected Frappe UI $fui_ref, found $actual_ref." >&2
	exit 1
fi
if [[ -n "$(git -C "$fui_repo" status --porcelain)" ]]; then
	echo "Frappe UI source must be clean before patch regeneration." >&2
	exit 1
fi
if ! grep -Fq "$fui_ref" "$desk_dir/package.json" || ! grep -Fq "$fui_ref" "$desk_dir/yarn.lock"; then
	echo "Helpdesk package.json and yarn.lock must both pin $fui_ref." >&2
	exit 1
fi

python3 - "$patch_file" "$tmp_dir/source.patch" <<'PY'
from pathlib import Path
import sys

source_path, output_path = map(Path, sys.argv[1:])
lines = source_path.read_text().splitlines(keepends=True)
target = "@@ -52,6 +78,25 @@ export type TimeGrain =\n"
starts = [index for index, line in enumerate(lines) if line == target]
if len(starts) > 1:
    raise SystemExit(f"expected at most one obsolete shared date hunk, found {len(starts)}")
if starts:
    start = starts[0]
    end = next(
        (index for index in range(start + 1, len(lines))
         if lines[index].startswith("@@ ") or lines[index].startswith("diff --git ")),
        len(lines),
    )
    body = "".join(lines[start:end])
    if "Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-arabext'" not in body:
        raise SystemExit("target hunk did not match the obsolete shared chart formatter")
    lines = lines[:start] + lines[end:]
output_path.write_text("".join(lines))
PY

git -C "$fui_repo" worktree add --detach "$base_tree" "$fui_ref" >/dev/null
git -C "$base_tree" apply --3way -p3 "$tmp_dir/source.patch"
git -C "$base_tree" -c core.abbrev=7 diff --cached --binary \
	--src-prefix=a/node_modules/frappe-ui/ \
	--dst-prefix=b/node_modules/frappe-ui/ > "$tmp_dir/generated.patch"

if grep -Fq "Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-arabext'" "$tmp_dir/generated.patch"; then
	echo "Generated patch still contains the shared Persian date formatter." >&2
	exit 1
fi
for required in "getChartFontFamily" "formatSuffix" "formatValue"; do
	if ! grep -Fq "$required" "$tmp_dir/generated.patch"; then
		echo "Generated patch lost Helpdesk chart behavior: $required" >&2
		exit 1
	fi
done

git -C "$fui_repo" worktree add --detach "$check_tree" "$fui_ref" >/dev/null
git -C "$check_tree" apply --check -p3 "$tmp_dir/generated.patch"
mv "$tmp_dir/generated.patch" "$patch_file"
echo "Regenerated $patch_file from Frappe UI $fui_ref."
