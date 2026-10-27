#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "pip" && "${2:-}" == "install" ]]; then
	shift 2
	python_target=""
	pip_args=()

	while (($#)); do
		case "$1" in
			--python|-p)
				if (($# < 2)); then
					echo "uv compatibility wrapper: --python requires a path" >&2
					exit 2
				fi
				python_target=$2
				shift 2
				;;
			--python=*)
				python_target=${1#*=}
				shift
				;;
			*)
				pip_args+=("$1")
				shift
				;;
		esac
	done
	pip_options=(
		--index-url https://pypi.org/simple
		--find-links "${UV_FIND_LINKS:-/opt/frappe}"
		--timeout "${PIP_DEFAULT_TIMEOUT:-90}"
		--retries "${PIP_RETRIES:-8}"
	)

	if [[ -n "$python_target" ]]; then
		exec /usr/local/bin/python3 -m pip --python "$python_target" install \
			"${pip_options[@]}" \
			"${pip_args[@]}"
	fi

	exec /usr/local/bin/python3 -m pip install \
		"${pip_options[@]}" \
		"${pip_args[@]}"
fi

exec /usr/local/bin/uv "$@"
