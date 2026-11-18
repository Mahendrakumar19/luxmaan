# Production Deployment & Installation Guide
**Platform:** AI Job Agent Platform (Germany & European Union)  
**Owner:** Nighwan Technology Pvt. Ltd.  
**Target Environment:** AWS Frankfurt (`eu-central-1`) / Self-Hosted Linux  

---

## 1. Prerequisites

- **Docker:** Version 24.0+ & Docker Compose v2.20+
- **Host OS:** Ubuntu 22.04 LTS / Debian 12 / macOS
- **System Resources:** Min. 4 vCPU, 8 GB RAM, 50 GB SSD
- **Network Ingress:** Ports 80 (HTTP) & 443 (HTTPS) with TLS certificates

---

## 2. Quickstart with Docker Compose

1. **Clone the repository:**
   ```bash
   git clone <repo-url> nilam
   cd nilam
   ```

2. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your production secrets:
   # POSTGRES_PASSWORD, JWT_SECRET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
   ```

3. **Start All Microservices:**
   ```bash
   docker compose up -d --build
   ```

4. **Verify Health Status:**
   ```bash
   docker compose ps
   ```
   - PostgreSQL (`pgvector/pgvector:pg16`): Port 5432
   - Redis: Port 6379
   - Python AI Microservice (FastAPI): `http://localhost:8000/health`
   - .NET 10 Web API Core: `http://localhost:5000/swagger`
   - Next.js 14+ Frontend: `http://localhost:3000`

---

## 3. Database Migration & Initialization

The PostgreSQL container executes `docker/init-db.sql` automatically upon initial boot.
To manually verify or rerun initialization:
```bash
docker exec -i jobagent_postgres psql -U jobagent_user -d jobagent_db < docker/init-db.sql
```

---

## 4. Running the Job Ingestion Worker

The crawler worker can be executed either as a continuous daemon or triggered via cron / systemd:
```bash
# Manual one-off ingestion
docker compose run --rm crawler-service python worker.py
```

---

## 5. Security & GDPR Hardening in Production

1. **AWS Frankfurt Region Binding:**
   Ensure S3 bucket and database instances are explicitly configured in AWS Frankfurt:
   `AWS_REGION=eu-central-1`
2. **Reverse Proxy & TLS Termination:**
   Deploy Nginx or Traefik with Let's Encrypt certificates in front of the services.
3. **Data Retention Policies:**
   Configure automatic purging of transient parsing artifacts older than 30 days.

