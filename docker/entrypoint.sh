#!/bin/bash
set -e

echo "=========================================================="
echo " Starting AI Job Agent Platform (All-in-One Container)"
echo " Owner: Nighwan Technology Pvt. Ltd."
echo " Target: Germany & European Union"
echo "=========================================================="

PG_VERSION=16
PG_DATA="/var/lib/postgresql/${PG_VERSION}/main"
PG_CONF_DIR="/etc/postgresql/${PG_VERSION}/main"

# Ensure directories & permissions for PostgreSQL
mkdir -p "$PG_DATA" /var/run/postgresql /var/log/postgresql /var/log/supervisor
chown -R postgres:postgres /var/lib/postgresql /var/run/postgresql /var/log/postgresql

# If cluster does not exist, create it
if [ ! -d "$PG_DATA" ] || [ ! -f "$PG_DATA/PG_VERSION" ]; then
    echo "[Entrypoint] Initializing PostgreSQL ${PG_VERSION} cluster..."
    su - postgres -c "/usr/lib/postgresql/${PG_VERSION}/bin/initdb -D '$PG_DATA' -E UTF8 --locale=C.UTF-8"
fi

# Configure PostgreSQL connection settings
mkdir -p "$PG_CONF_DIR"
if [ ! -f "$PG_CONF_DIR/postgresql.conf" ]; then
    cp "$PG_DATA/postgresql.conf" "$PG_CONF_DIR/postgresql.conf" 2>/dev/null || true
    cp "$PG_DATA/pg_hba.conf" "$PG_CONF_DIR/pg_hba.conf" 2>/dev/null || true
fi

# Ensure listen_addresses and auth rules
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" "$PG_CONF_DIR/postgresql.conf" 2>/dev/null || true
sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/g" "$PG_CONF_DIR/postgresql.conf" 2>/dev/null || true
echo "host all all 0.0.0.0/0 md5" >> "$PG_CONF_DIR/pg_hba.conf"
echo "local all all trust" >> "$PG_CONF_DIR/pg_hba.conf"

# Start temporary Postgres to run migrations / seed
echo "[Entrypoint] Starting PostgreSQL service for initialization..."
su - postgres -c "/usr/lib/postgresql/${PG_VERSION}/bin/pg_ctl -D '$PG_DATA' -o \"-c config_file=$PG_CONF_DIR/postgresql.conf\" start"

# Wait for PostgreSQL to respond
RETRIES=30
until su - postgres -c "pg_isready -q" || [ $RETRIES -eq 0 ]; do
    echo "Waiting for PostgreSQL to be ready... ($RETRIES left)"
    RETRIES=$((RETRIES-1))
    sleep 1
done

# Initialize User & Database if not already present
DB_EXISTS=$(su - postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='jobagent_db'\"" || true)
if [ "$DB_EXISTS" != "1" ]; then
    echo "[Entrypoint] Creating PostgreSQL role jobagent_user and database jobagent_db..."
    su - postgres -c "psql -c \"CREATE USER jobagent_user WITH PASSWORD 'secure_dev_password_2026' SUPERUSER;\"" || true
    su - postgres -c "psql -c \"CREATE DATABASE jobagent_db OWNER jobagent_user;\"" || true

    if [ -f /app/docker/init-db.sql ]; then
        echo "[Entrypoint] Executing /app/docker/init-db.sql with pgvector schema..."
        su - postgres -c "psql -d jobagent_db -f /app/docker/init-db.sql" || echo "Note: SQL seed completed or partial."
    fi
    echo "[Entrypoint] Database schema initialization complete."
else
    echo "[Entrypoint] Database jobagent_db already exists."
fi

# Stop temporary PostgreSQL so Supervisord can manage it as PID child
echo "[Entrypoint] Stopping temporary PostgreSQL instance..."
su - postgres -c "/usr/lib/postgresql/${PG_VERSION}/bin/pg_ctl -D '$PG_DATA' stop -m fast"

# Setup Redis configuration & permissions
mkdir -p /var/lib/redis /var/log/redis
chown -R redis:redis /var/lib/redis /var/log/redis
if [ -f /etc/redis/redis.conf ]; then
    sed -i "s/^bind .*/bind 0.0.0.0/g" /etc/redis/redis.conf || true
    sed -i "s/^protected-mode yes/protected-mode no/g" /etc/redis/redis.conf || true
fi

echo "=========================================================="
echo " Services ready! Passing control to Supervisord:"
echo " - Next.js Frontend: http://localhost:3000 (and via Nginx :80)"
echo " - Express Backend API: http://localhost:5000/api/v1"
echo " - FastAPI AI Microservice: http://localhost:8000"
echo " - PostgreSQL (pgvector): localhost:5432 (jobagent_db)"
echo " - Redis Cache & Queues: localhost:6379"
echo " - Crawler Ingestion Engine: running background cycle"
echo "=========================================================="

exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
