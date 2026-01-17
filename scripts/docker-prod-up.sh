#!/usr/bin/env bash
set -euo pipefail

docker compose --env-file docker/production/.env -f docker/production/docker-compose.yml up -d
