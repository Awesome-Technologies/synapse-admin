#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export SYNAPSE_E2E_DATA_DIR="${SYNAPSE_E2E_DATA_DIR:-/tmp/synapse-admin-e2e}"
export SYNAPSE_E2E_UID="${SYNAPSE_E2E_UID:-$(id -u)}"
export SYNAPSE_E2E_GID="${SYNAPSE_E2E_GID:-$(id -g)}"

mkdir -p "${SYNAPSE_E2E_DATA_DIR}"

if [[ ! -f "${SYNAPSE_E2E_DATA_DIR}/homeserver.yaml" ]]; then
  docker compose -f "${ROOT_DIR}/docker-compose.e2e.yml" --project-name synapse-admin-e2e run --rm synapse generate
fi

node "${ROOT_DIR}/scripts/e2e/configure-synapse.mjs" "${SYNAPSE_E2E_DATA_DIR}/homeserver.yaml"
