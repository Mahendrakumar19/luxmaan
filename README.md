# AI Job Agent Platform (Germany & European Union)
**Owner:** Nighwan Technology Pvt. Ltd.  
**Platform Version:** 1.0.0 (Production-Ready Architecture)  
**Target Markets:** Germany (DE) & European Union (EU)  

---

## 🌟 Executive Overview

The **AI Job Agent Platform** is an enterprise-grade job aggregation, candidate profiling, resume parsing, and semantic matching ecosystem designed specifically for the German and European recruitment markets.

Built under strict **Privacy-by-Design** principles adhering to the European **GDPR (DSGVO)** and the **EU Artificial Intelligence Act (Regulation EU 2024/1689)**.

---

## 🏗️ Architecture & Technology Stack

```
nilam/
├── frontend/               # Next.js 14+ App Router, React, TypeScript, Tailwind CSS
├── backend/                # Node.js 20+ TypeScript Express Web API (Clean Architecture)
│   ├── src/types/          # Domain models, Enums, DTOs
│   ├── src/controllers/    # Auth, Candidate, Jobs, Matches, Admin, GDPR
│   ├── src/middleware/     # JWT Auth & Role Enforcement
│   ├── src/services/       # Business logic & AI Microservice client
│   ├── src/routes/         # REST endpoint routes
│   └── src/db/             # Store & database connections
├── ai-service/             # Python 3.12, FastAPI, SentenceTransformers (MiniLM)
├── crawler-service/        # Multi-source Ingestion Engine (Arbeitsagentur, Feeds)
├── docker/                 # init-db.sql with pgvector schema
├── docs/                   # Architecture, ERD, API specs, GDPR compliance
├── tests/                  # Automated integration & unit test suite
├── docker-compose.yml      # Multi-service local & cloud orchestrator
└── .env.example            # Environment configuration template
```

### Core Technologies
- **Frontend:** Next.js 14+ App Router, TypeScript, Tailwind CSS, Lucide Icons, responsive European SaaS UI.
- **Backend API:** Node.js 20+ Web API (TypeScript / Express), JWT Bearer authentication, Scrypt password hashing, RBAC, REST endpoints matching European labor market requirements.
- **AI & NLP Microservice:** Python 3.12, FastAPI, `paraphrase-multilingual-MiniLM-L12-v2` 384-dimensional dense embeddings, multilingual PDF/DOCX parser, German CEFR language level extraction (A1-C2).
- **Relational & Vector Store:** PostgreSQL 16+ with `pgvector` HNSW cosine indexing.
- **Cache & Queues:** Redis 7.
- **Crawlers & Ingestion:** Python with Bundesagentur für Arbeit open API connector, deduplication SHA-256 fingerprinting.

---

## ⚖️ Transparent Scoring Model

Matches are computed using a candidate-side hybrid recommendation model:
- **Skills Match:** 40% (direct taxonomy alignment & gap identification)
- **Experience Match:** 25% (tenure and seniority band compatibility)
- **Location Compatibility:** 15% (city match, hybrid/remote flexibility in DE/EU)
- **Language Compatibility:** 10% (German CEFR levels and English proficiency)
- **Salary Compatibility:** 10% (candidate target vs employer compensation band)

*Zero discriminatory profiling: Scoring strictly excludes age, gender, ethnicity, religion, or disability.*

---

## 🚀 Getting Started

### ⚡ Option A: All-in-One Docker Container (Single Container — No Separate Services)
Run the entire platform (Frontend, Backend, AI Microservice, Crawler, PostgreSQL with pgvector, and Redis) inside **one single container**:

**Using Docker CLI:**
```bash
# Build the unified image
docker build -t nilam-jobagent:latest .

# Run the single container
docker run -d \
  --name nilam_all_in_one \
  -p 3000:3000 \
  -p 5000:5000 \
  -p 8000:8000 \
  -p 80:80 \
  -v nilam_pgdata:/var/lib/postgresql \
  -v nilam_redisdata:/var/lib/redis \
  nilam-jobagent:latest
```

**Or using PowerShell / Bash scripts:**
```powershell
# On Windows:
.\docker-run.ps1

# On Linux / macOS:
chmod +x docker-run.sh && ./docker-run.sh
```

**Or using Docker Compose (Single Container):**
```bash
docker compose -f docker-compose.single.yml up -d --build
```

---

### 📦 Option B: Multi-Service Docker Compose (Distributed)
If you prefer running each service in its own isolated container:
```bash
cp .env.example .env
docker compose up -d --build
```

---

### 🌐 Accessing the System
Once running, all interfaces and APIs are immediately accessible:
- **Candidate & Public Web App:** `http://localhost:3000` (or `http://localhost`)
- **Candidate Hub:** `http://localhost:3000/candidate/dashboard`
- **Admin Control Center:** `http://localhost:3000/admin/dashboard`
- **Backend API & Health:** `http://localhost:5000/health`
- **Backend API Endpoints:** `http://localhost:5000/api/v1`
- **AI Microservice Health:** `http://localhost:8000/health`
- **PostgreSQL Database:** `localhost:5432` (db: `jobagent_db`, user: `jobagent_user`)
- **Redis Cache:** `localhost:6379`

---

### 🧪 Run Platform Tests
```bash
python tests/test_platform.py
```
*Expected: 5 tests passing.*

---

## 🔒 GDPR & EU AI Act Compliance

- **Article 17 (Right to Erasure):** Cascade deletion of personal data and physical S3 files.
- **Article 20 (Data Portability):** Complete one-click machine-readable JSON data export.
- **Article 7 (Consent Ledger):** Timestamped consent audit logs with IP and user agent tracking.
- **EU Hosting:** AWS Frankfurt (`eu-central-1`) compliance binding.

---

## 📄 Documentation

- [Architecture Blueprint](file:///Users/sandeepkumar/Documents/nilam/docs/ARCHITECTURE.md)
- [Database ERD & pgvector](file:///Users/sandeepkumar/Documents/nilam/docs/DATABASE_ERD.md)
- [REST API Contracts](file:///Users/sandeepkumar/Documents/nilam/docs/API_CONTRACTS.md)
- [GDPR & EU AI Act Analysis](file:///Users/sandeepkumar/Documents/nilam/docs/GDPR_COMPLIANCE.md)
- [Implementation Roadmap](file:///Users/sandeepkumar/Documents/nilam/docs/ROADMAP.md)
- [Deployment Guide](file:///Users/sandeepkumar/Documents/nilam/docs/DEPLOYMENT_GUIDE.md)

---
Developed for **Nighwan Technology Pvt. Ltd.**

