#!/bin/bash
set -e

echo "=========================================================="
echo " Building & Running AI Job Agent in a Single Container"
echo "=========================================================="

# Check Docker daemon
if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker daemon is not running. Please start Docker first."
    exit 1
fi

echo ""
echo "[1/2] Building All-in-One Docker Image..."
docker build -t nilam-jobagent:latest .

echo ""
echo "[2/2] Running All-in-One Container..."
docker rm -f nilam_all_in_one 2>/dev/null || true

docker run -d \
    --name nilam_all_in_one \
    -p 80:80 \
    -p 3000:3000 \
    -p 5000:5000 \
    -p 8000:8000 \
    -p 5432:5432 \
    -p 6379:6379 \
    -v nilam_pgdata:/var/lib/postgresql \
    -v nilam_redisdata:/var/lib/redis \
    nilam-jobagent:latest

echo ""
echo "=========================================================="
echo " Container started successfully! Everything is running."
echo " - Frontend UI:              http://localhost:3000"
echo " - Unified Gateway (Nginx):  http://localhost"
echo " - Backend REST API:         http://localhost:5000/api/v1"
echo " - AI Microservice:          http://localhost:8000/health"
echo " - View logs:                docker logs -f nilam_all_in_one"
echo "=========================================================="
