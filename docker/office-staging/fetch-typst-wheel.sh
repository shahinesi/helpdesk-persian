#!/bin/sh
set -eu

url='https://files.pythonhosted.org/packages/2b/57/e2bb9b7823c049361c9e7d2d971996430b71260bfc3a7ed289ca4b37c1b0/typst-0.15.0-cp38-abi3-manylinux_2_17_x86_64.manylinux2014_x86_64.whl'
expected_sha256='8f33d98451bab132a612b98ffc8d1830c97a076ea3f3fde11f6ff7ab9bcae89c'
expected_size=34161270
chunk_size=4000000
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
part_prefix="${temporary}.chunk."
trap 'rm -f "$temporary" "${part_prefix}"*' EXIT HUP INT TERM
: > "$temporary"
start=0
while [ "$start" -lt "$expected_size" ]; do
	end=$((start + chunk_size - 1))
	if [ "$end" -ge "$expected_size" ]; then
		end=$((expected_size - 1))
	fi
	part="${part_prefix}${start}"
	status=$(curl --fail --location --silent --show-error --retry 5 \
		--retry-all-errors --retry-delay 1 --connect-timeout 20 --max-time 120 \
		--range "$start-$end" "$url" --output "$part" --write-out '%{http_code}')
	if [ "$status" != 206 ]; then
		echo "Expected HTTP 206 for bytes $start-$end, received $status" >&2
		exit 1
	fi
	wanted_bytes=$((end - start + 1))
	actual_bytes=$(wc -c < "$part" | tr -d '[:space:]')
	if [ "$actual_bytes" -ne "$wanted_bytes" ]; then
		echo "Expected $wanted_bytes bytes for range $start-$end, received $actual_bytes" >&2
		exit 1
	fi
	cat "$part" >> "$temporary"
	rm -f "$part"
	start=$((end + 1))
done

actual_size=$(wc -c < "$temporary" | tr -d '[:space:]')
if [ "$actual_size" -ne "$expected_size" ]; then
	echo "Expected $expected_size bytes, received $actual_size" >&2
	exit 1
fi
printf '%s  %s\n' "$expected_sha256" "$temporary" | sha256sum -c -
mv "$temporary" "$output"
trap - EXIT HUP INT TERM
echo "Downloaded and verified Typst wheel: $output"
