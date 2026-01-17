#!/usr/bin/env bash
set -euo pipefail

docker compose --env-file docker/local/.env -f docker/local/docker-compose.yml up -d
