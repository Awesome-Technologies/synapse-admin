#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export SYNAPSE_DATA_DIR="${SYNAPSE_DATA_DIR:-/tmp/synapse}"
export SYNAPSE_ADMIN_BASE_URL="${SYNAPSE_BASE_URL:-http://127.0.0.1:8080}"
export SYNAPSE_BASE_URL="${SYNAPSE_BASE_URL:-http://127.0.0.1:8008}"
export E2E_BASE_URL="${E2E_BASE_URL:-${SYNAPSE_ADMIN_BASE_URL}}"

cleanup() {
  if [[ "${KEEP_E2E_STACK:-0}" == "1" ]]; then return; fi
  if [[ "${E2E_RUN_STATUS:-0}" != "0" ]]; then return; fi
  docker compose -f "${ROOT_DIR}/docker-compose.yml" --project-name synapse-admin-e2e down -v --remove-orphans
}

trap cleanup EXIT

E2E_RUN_STATUS=1

rm -rf "${SYNAPSE_DATA_DIR}"

"${ROOT_DIR}/scripts/e2e/prepare-synapse.sh"

docker compose -f "${ROOT_DIR}/docker-compose.yml" --project-name synapse-admin-e2e up -d --build

echo "Wait for ${SYNAPSE_ADMIN_BASE_URL}/config.json"
node "${ROOT_DIR}/scripts/e2e/wait-for-url.mjs" "${SYNAPSE_ADMIN_BASE_URL}/config.json" 120000
echo "Wait for ${SYNAPSE_BASE_URL}/_matrix/client/versions"
node "${ROOT_DIR}/scripts/e2e/wait-for-url.mjs" "${SYNAPSE_BASE_URL}/_matrix/client/versions" 120000
echo "Register admin account"
node "${ROOT_DIR}/scripts/e2e/register-admin.mjs"

echo "Start playwright tests"
yarn playwright test

E2E_RUN_STATUS=0
