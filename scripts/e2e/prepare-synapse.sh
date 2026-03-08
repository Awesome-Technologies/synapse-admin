#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export SYNAPSE_E2E_DATA_DIR="${SYNAPSE_E2E_DATA_DIR:-/tmp/synapse-admin-e2e}"

mkdir -p "${SYNAPSE_E2E_DATA_DIR}"

if [[ ! -f "${SYNAPSE_E2E_DATA_DIR}/homeserver.yaml" ]]; then
  docker compose -f "${ROOT_DIR}/docker-compose.e2e.yml" --project-name synapse-admin-e2e run --rm synapse generate
fi

docker run --rm \
  -v "${ROOT_DIR}:/workspace" \
  -v "${SYNAPSE_E2E_DATA_DIR}:/data" \
  -w /workspace \
  node:lts \
  node ./scripts/e2e/configure-synapse.mjs /data/homeserver.yaml
