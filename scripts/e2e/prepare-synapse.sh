#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export SYNAPSE_DATA_DIR="${SYNAPSE_DATA_DIR:-/tmp/synapse}"

mkdir -p "${SYNAPSE_DATA_DIR}"

if [[ ! -f "${SYNAPSE_DATA_DIR}/homeserver.yaml" ]]; then
  docker compose -f "${ROOT_DIR}/docker-compose.yml" --project-name synapse-admin-e2e run --rm synapse generate
fi

docker run --rm \
  -v "${ROOT_DIR}:/workspace" \
  -v "${SYNAPSE_DATA_DIR}:/data" \
  -w /workspace \
  node:lts \
  node ./scripts/e2e/configure-synapse.mjs /data/homeserver.yaml
