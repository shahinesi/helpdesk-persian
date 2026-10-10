#!/usr/bin/env bash

set -euo pipefail

app="$1"
repository="$2"
ref_file="$3"
ref="$(tr -d '[:space:]' < "$ref_file")"

if [[ ! "$ref" =~ ^[0-9a-f]{40}$ ]]; then
	echo "Invalid pinned ref for $app: $ref" >&2
	exit 1
fi

bench get-app --branch develop "$repository"
git -C "apps/$app" fetch --depth=1 origin "$ref"
git -C "apps/$app" checkout --detach "$ref"
test "$(git -C "apps/$app" rev-parse HEAD)" = "$ref"
