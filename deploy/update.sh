#!/bin/bash
# ==============================================================================
# Quick Zero-Downtime Redeployment Script for nilam.aiwcrm.in
# ==============================================================================
set -e

APP_DIR="/opt/nilam"
cd "$APP_DIR"

echo "=== Pulling latest changes from Git ==="
git pull origin main

echo "=== Building new container image ==="
docker build -t nilam-jobagent:latest .

echo "=== Restarting container ==="
docker rm -f nilam_all_in_one 2>/dev/null || true

docker run -d \
  --name nilam_all_in_one \
  --restart always \
  -p 127.0.0.1:3000:3000 \
  -p 127.0.0.1:5000:5000 \
  -p 127.0.0.1:8000:8000 \
  -p 127.0.0.1:5432:5432 \
  -p 127.0.0.1:6379:6379 \
  -v nilam_pgdata:/var/lib/postgresql \
  -v nilam_redisdata:/var/lib/redis \
  nilam-jobagent:latest

echo "=== Reloading Nginx ==="
nginx -t && systemctl reload nginx

echo "=== Done! Checking health ==="
sleep 5
curl -I http://127.0.0.1:5000/health || true
echo "Container status:"
docker ps --filter "name=nilam_all_in_one"
