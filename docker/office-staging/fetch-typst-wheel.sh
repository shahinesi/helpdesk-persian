#!/bin/sh
set -eu

url='https://files.pythonhosted.org/packages/2b/57/e2bb9b7823c049361c9e7d2d971996430b71260bfc3a7ed289ca4b37c1b0/typst-0.15.0-cp38-abi3-manylinux_2_17_x86_64.manylinux2014_x86_64.whl'
expected_sha256='8f33d98451bab132a612b98ffc8d1830c97a076ea3f3fde11f6ff7ab9bcae89c'
output=${1:-/tmp/typst-0.15.0-cp38-abi3-manylinux_2_17_x86_64.whl}

if [ -e "$output" ]; then
	actual_sha256=$(sha256sum "$output" | cut -d' ' -f1)
	if [ "$actual_sha256" = "$expected_sha256" ]; then
		echo "Verified existing Typst wheel: $output"
		exit 0
	fi
	echo "Refusing to overwrite existing file with unexpected SHA-256: $output" >&2
	exit 1
fi

temporary="${output}.part.$$"
trap 'rm -f "$temporary"' EXIT HUP INT TERM
curl --fail --location --retry 5 --retry-all-errors --retry-delay 2 \
	--connect-timeout 20 --max-time 900 "$url" --output "$temporary"
printf '%s  %s\n' "$expected_sha256" "$temporary" | sha256sum -c -
mv "$temporary" "$output"
trap - EXIT HUP INT TERM
echo "Downloaded and verified Typst wheel: $output"
