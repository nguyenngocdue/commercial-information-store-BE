#!/usr/bin/env bash
set -euo pipefail

docker compose --env-file docker/beta/.env -f docker/beta/docker-compose.yml up -d
