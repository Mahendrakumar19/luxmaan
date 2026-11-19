#!/bin/bash
# ==============================================================================
# Automated VPS Provisioning & Deployment Script for luxmaan.aiwcrm.in
# Platform: AI Job Agent Platform (Germany & EU)
# Owner: Nighwan Technology Pvt. Ltd.
# Target: Ubuntu 22.04 LTS / Debian 12 VPS
# ==============================================================================

set -e

DOMAIN="luxmaan.aiwcrm.in"
EMAIL="admin@aiwcrm.in"
APP_DIR="/opt/luxmaan"

echo "=========================================================="
echo " Starting VPS Deployment for: $DOMAIN"
echo "=========================================================="

# 1. Root check
if [ "$EUID" -ne 0 ]; then
  echo "Error: Please run as root (e.g., sudo ./setup-vps.sh)"
  exit 1
fi

# 2. Update System Packages
echo "[1/6] Updating system packages..."
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git ufw nginx certbot python3-certbot-nginx fail2ban

# 3. Install Docker Engine if not installed
echo "[2/6] Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing official Docker Engine..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
    echo "Docker installed successfully."
else
    echo "Docker is already installed: $(docker --version)"
fi

# Ensure docker compose plugin exists
apt-get install -y docker-compose-plugin || true

# 4. Configure UFW Firewall
echo "[3/6] Configuring UFW Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
# Do not expose raw internal database/backend ports to public internet
ufw --force enable
echo "Firewall active. Ports 22, 80, 443 are open."

# 5. Setup Application Directory & Permissions
echo "[4/6] Setting up project files at $APP_DIR..."
mkdir -p "$APP_DIR"

if [ -d "$APP_DIR/.git" ]; then
    echo "Existing git repo found. Pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main || true
else
    # If running script from cloned repo directory, sync to /opt/nilam
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
    if [ "$SCRIPT_DIR" != "$APP_DIR" ] && [ -f "$SCRIPT_DIR/Dockerfile" ]; then
        echo "Copying files from $SCRIPT_DIR to $APP_DIR..."
        cp -r "$SCRIPT_DIR/." "$APP_DIR/"
    fi
fi

cd "$APP_DIR"

# 6. Build and Start the Unified Container
echo "[5/6] Building and running Luxmaan All-in-One Container..."
# Stop previous container if running
docker rm -f luxmaan_all_in_one 2>/dev/null || true

# Build the all-in-one image
docker build -t luxmaan-jobagent:latest .

# Run the unified container with Traefik labels
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
  --label "traefik.http.routers.luxmaan.rule=Host(\`$DOMAIN\`)" \
  --label "traefik.http.routers.luxmaan.tls=true" \
  --label "traefik.http.routers.luxmaan.tls.certresolver=letsencrypt" \
  --label "traefik.http.services.luxmaan.loadbalancer.server.port=80" \
  luxmaan-jobagent:latest

# 7. Configure Reverse Proxy
if ss -tulpn | grep -q 'traefik'; then
    echo "[6/6] Traefik detected as primary reverse proxy on this VPS!"
    echo "Container has been registered with Traefik labels for $DOMAIN."
    echo "Traefik will automatically manage SSL and route traffic to https://$DOMAIN."
else
    echo "[6/6] Configuring Nginx & SSL for $DOMAIN..."
    mkdir -p /var/www/certbot

    # Create initial HTTP-only Nginx config to allow certbot challenge
    cat > "/etc/nginx/sites-available/$DOMAIN" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Stop apache2 if running so Nginx can bind cleanly
    systemctl stop apache2 2>/dev/null || true
    systemctl disable apache2 2>/dev/null || true

    # Clean up orphaned nginx processes
    if ! systemctl is-active --quiet nginx; then
        echo "Cleaning up any orphaned Nginx processes..."
        killall -9 nginx 2>/dev/null || true
        sleep 1
    fi

    ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && (systemctl restart nginx || systemctl start nginx)

    # Request SSL Certificate from Let's Encrypt
    echo "Requesting Let's Encrypt SSL certificate for $DOMAIN..."
    if certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect; then
        echo "SSL Certificate issued successfully!"
        
        # Install full production Nginx config with API & AI routing
        if [ -f "$APP_DIR/deploy/nginx-vps.conf" ]; then
            cp "$APP_DIR/deploy/nginx-vps.conf" "/etc/nginx/sites-available/$DOMAIN"
            nginx -t && (systemctl reload nginx || systemctl restart nginx)
            echo "Production reverse proxy routes applied."
        fi
    fi
fi

echo "=========================================================="
echo " 🎉 Deployment Complete!"
echo " Web UI:     https://$DOMAIN"
echo " API Status: https://$DOMAIN/api/v1/health (or :5000)"
echo " AI Service: https://$DOMAIN/ai/health"
echo " Container:  docker logs -f luxmaan_all_in_one"
echo "=========================================================="
