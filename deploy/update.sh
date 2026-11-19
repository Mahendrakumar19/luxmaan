#!/bin/bash
# ==============================================================================
# Quick Zero-Downtime Redeployment Script for luxmaan.aiwcrm.in
# ==============================================================================
set -e

APP_DIR="/opt/luxmaan"
cd "$APP_DIR"

echo "=== Pulling latest changes from Git ==="
git pull origin main

echo "=== Building container image ==="
docker build -t luxmaan-jobagent:latest .

echo "=== Restarting container ==="
docker rm -f luxmaan_all_in_one 2>/dev/null || true

docker run -d \
  --name luxmaan_all_in_one \
  --restart always \
  -p 127.0.0.1:3010:3000 \
  -p 127.0.0.1:5010:5000 \
  -p 127.0.0.1:8010:8000 \
  -p 127.0.0.1:5433:5432 \
  -p 127.0.0.1:6380:6379 \
  -v luxmaan_pgdata:/var/lib/postgresql \
  -v luxmaan_redisdata:/var/lib/redis \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.luxmaan.entrypoints=web,websecure" \
  --label "traefik.http.routers.luxmaan.rule=Host(\`luxmaan.aiwcrm.in\`)" \
  --label "traefik.http.routers.luxmaan.tls=true" \
  --label "traefik.http.services.luxmaan.loadbalancer.server.port=80" \
  luxmaan-jobagent:latest

echo "=== Done! Checking health ==="
sleep 5
curl -I http://127.0.0.1:5010/health || true
echo "Container status:"
docker ps --filter "name=luxmaan_all_in_one"
