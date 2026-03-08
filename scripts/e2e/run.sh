#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export SYNAPSE_E2E_DATA_DIR="${SYNAPSE_E2E_DATA_DIR:-/tmp/synapse-admin-e2e}"
export SYNAPSE_E2E_BASE_URL="${SYNAPSE_E2E_BASE_URL:-http://127.0.0.1:8080}"
export E2E_BASE_URL="${E2E_BASE_URL:-${SYNAPSE_E2E_BASE_URL}}"

cleanup() {
  if [[ "${KEEP_E2E_STACK:-0}" == "1" ]]; then
    return
  fi

  docker compose -f "${ROOT_DIR}/docker-compose.e2e.yml" --project-name synapse-admin-e2e down -v --remove-orphans
}

trap cleanup EXIT

rm -rf "${SYNAPSE_E2E_DATA_DIR}"

"${ROOT_DIR}/scripts/e2e/prepare-synapse.sh"

docker compose -f "${ROOT_DIR}/docker-compose.e2e.yml" --project-name synapse-admin-e2e up -d --build

node "${ROOT_DIR}/scripts/e2e/wait-for-url.mjs" "${SYNAPSE_E2E_BASE_URL}/config.json" 120000
node "${ROOT_DIR}/scripts/e2e/wait-for-url.mjs" "${SYNAPSE_E2E_BASE_URL}/_matrix/client/versions" 120000
node "${ROOT_DIR}/scripts/e2e/register-admin.mjs"

yarn playwright test
