# ==============================================================================
# AI Job Agent Platform - All-in-One Multi-Service Unified Container
# Packages: Frontend (Next.js), Backend (Express), AI Microservice (FastAPI),
#           Crawler Worker, PostgreSQL 16 (pgvector), Redis 7, Nginx Gateway
# Owner: Nighwan Technology Pvt. Ltd.
# Target Market: Germany (DE) & European Union (EU)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Backend (TypeScript Node.js)
# ------------------------------------------------------------------------------
FROM node:20-bookworm-slim AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build
RUN npm prune --production

# ------------------------------------------------------------------------------
# Stage 2: Build Frontend (Next.js 14+)
# ------------------------------------------------------------------------------
FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
RUN npm run build
RUN npm prune --production

# ------------------------------------------------------------------------------
# Stage 3: Python Virtual Environment Builder
# ------------------------------------------------------------------------------
FROM python:3.12-slim-bookworm AS python-builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install lightweight CPU-only PyTorch first
RUN pip install --no-cache-dir torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu

# Install AI Service dependencies
COPY ai-service/requirements.txt /tmp/ai-requirements.txt
RUN pip install --no-cache-dir -r /tmp/ai-requirements.txt

# Install Crawler Service dependencies
COPY crawler-service/requirements.txt /tmp/crawler-requirements.txt
RUN pip install --no-cache-dir -r /tmp/crawler-requirements.txt

# ------------------------------------------------------------------------------
# Stage 4: Final Unified Production Container
# ------------------------------------------------------------------------------
FROM python:3.12-slim-bookworm AS final

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PATH="/opt/venv/bin:$PATH"

# 1. Install Node.js 20 from node builder
COPY --from=node:20-bookworm-slim /usr/local /usr/local

# 2. Install PostgreSQL 16 with pgvector, Redis, Supervisor, and Nginx
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    lsb-release \
    ca-certificates \
    supervisor \
    redis-server \
    nginx \
    procps \
    && echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-16 \
        postgresql-16-pgvector \
    && rm -rf /var/lib/apt/lists/*

# 3. Copy Python Virtual Environment
COPY --from=python-builder /opt/venv /opt/venv

# 4. Copy Backend application
WORKDIR /app/backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./

# 5. Copy Frontend application
WORKDIR /app/frontend
COPY --from=frontend-builder /app/frontend/.next ./.next
COPY --from=frontend-builder /app/frontend/node_modules ./node_modules
COPY --from=frontend-builder /app/frontend/package*.json ./
COPY --from=frontend-builder /app/frontend/next.config.mjs ./
RUN mkdir -p ./public

# 6. Copy AI Service & Crawler Service
WORKDIR /app/ai-service
COPY ai-service/ ./

WORKDIR /app/crawler-service
COPY crawler-service/ ./

# 7. Copy Docker configuration & Database scripts
WORKDIR /app
COPY docker/ /app/docker/

# 8. Configure Supervisor and Nginx
RUN cp /app/docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf \
    && cp /app/docker/nginx.conf /etc/nginx/sites-available/default \
    && chmod +x /app/docker/entrypoint.sh

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="postgresql://jobagent_user:secure_dev_password_2026@127.0.0.1:5432/jobagent_db"
ENV REDIS_URL="redis://127.0.0.1:6379"
ENV AI_SERVICE_URL="http://127.0.0.1:8000"
ENV NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
ENV BACKEND_INTERNAL_URL="http://127.0.0.1:5000"

# Exposed Ports:
# 80: Unified Nginx HTTP Gateway (Frontend + API reverse proxy)
# 3000: Next.js Frontend Web App
# 5000: Express Backend Web API
# 8000: FastAPI AI Microservice
# 5432: PostgreSQL + pgvector
# 6379: Redis
EXPOSE 80 3000 5000 8000 5432 6379

WORKDIR /app
ENTRYPOINT ["/app/docker/entrypoint.sh"]
