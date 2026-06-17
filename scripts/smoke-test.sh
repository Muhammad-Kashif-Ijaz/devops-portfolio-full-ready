#!/usr/bin/env sh
set -eu

BASE_URL="${1:-http://127.0.0.1:8080}"

curl -fsS "$BASE_URL/healthz" >/dev/null
curl -fsS "$BASE_URL/" | grep -qi "Muhammad Kashif"

echo "Smoke test passed for $BASE_URL"
