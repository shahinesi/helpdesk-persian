# syntax=docker/dockerfile:1
FROM frappe/erpnext@sha256:eee240a179ff494cb82ad067d853c8db3f87171d86324f4b326892654e342144

USER frappe
WORKDIR /home/frappe/frappe-bench

ARG JALALI_SOURCE_SHA256=154bdca9106ac48e496d0f2ea492f338c52d39290c68aff915400ca86ab7dbc9
COPY --chown=frappe:frappe jalali_shamsi_datepicker-09d8fad.tar.gz /tmp/jalali_shamsi_datepicker.tar.gz

RUN python3 - "$JALALI_SOURCE_SHA256" <<'PY'
import hashlib
import pathlib
import shutil
import sys
import tarfile

archive = pathlib.Path("/tmp/jalali_shamsi_datepicker.tar.gz")
expected = sys.argv[1].lower()
actual = hashlib.sha256(archive.read_bytes()).hexdigest()
if actual != expected:
    raise SystemExit(f"Jalali app source SHA-256 mismatch: {actual} != {expected}")

apps = pathlib.Path("apps")
target = apps / "jalali_shamsi_datepicker"
staging = apps / ".jalali_shamsi_datepicker-source"
if target.exists() or staging.exists():
    raise SystemExit("Jalali app source target unexpectedly exists in the base image")
staging.mkdir()
with tarfile.open(archive, "r:gz") as source:
    for member in source.getmembers():
        path = pathlib.PurePosixPath(member.name)
        if path.is_absolute() or ".." in path.parts:
            raise SystemExit(f"Unsafe source archive path: {member.name}")
    source.extractall(staging, filter="data")
staging.rename(target)
PY

RUN python3 - <<'PY'
import pathlib

app = pathlib.Path("/home/frappe/frappe-bench/apps/jalali_shamsi_datepicker")
required = (
    app / "jalali_shamsi_datepicker/public/js/jalali_shamsi_datepicker.bundle.js",
    app / "jalali_shamsi_datepicker/public/css/custom.css",
    app / "jalali_shamsi_datepicker/public/fonts/Vazirmatn-wght.woff2",
)
missing = [str(path) for path in required if not path.is_file()]
if missing:
    raise SystemExit(f"Missing prebuilt Jalali assets: {missing}")

site_packages = pathlib.Path("env/lib/python3.14/site-packages")
site_packages.joinpath("jalali_shamsi_datepicker.pth").write_text(
    "/home/frappe/frappe-bench/apps/jalali_shamsi_datepicker\n", encoding="utf-8"
)
PY
