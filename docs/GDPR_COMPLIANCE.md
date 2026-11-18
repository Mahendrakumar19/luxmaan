# GDPR & EU AI Act Compliance Framework
**Owner:** Nighwan Technology Pvt. Ltd.  
**Jurisdiction:** European Union (specifically Germany - BDSG & DSGVO)  
**Document Status:** Production Operational Blueprint

---

## 1. Regulatory Context

The platform processes personal data of European Union job seekers and operates in European labour markets. It adheres strictly to:
1. **General Data Protection Regulation (GDPR / DSGVO)** (Regulation (EU) 2016/679).
2. **German Federal Data Protection Act (BDSG)**.
3. **EU Artificial Intelligence Act (EU AI Act)** (Regulation (EU) 2024/1689).

---

## 2. Core GDPR Implementation Principles

### 2.1 Lawful Basis of Processing (Article 6 GDPR)
- **Contract Performance (Art. 6(1)(b)):** Processing candidate profile, resume, and experience data to provide job discovery and matching requested by the user.
- **Explicit Consent (Art. 6(1)(a)):** Required for resume AI parsing, vectorization, and job digest notifications. Tracked in `UserConsents` ledger.
- **Legitimate Interest (Art. 6(1)(f)):** Fraud prevention, rate limiting, and technical platform security logs.

### 2.2 Data Subject Rights Implementation
| GDPR Article | User Right | System Implementation |
| :--- | :--- | :--- |
| **Article 15** | Right of Access | Candidate Dashboard allows viewing all collected data, CV files, and system-generated profiles in real time. |
| **Article 16** | Right to Rectification | Candidate can edit all profile fields, amend parsed CV data, or replace resume documents at any time. |
| **Article 17** | Right to Erasure ("Right to be Forgotten") | Dedicated endpoint `DELETE /api/v1/gdpr/delete-account` triggers immediate cascade deletion of: `User`, `CandidateProfile`, physical PDF/DOCX files from S3, `CandidateEmbeddings`, `JobMatches`, and `UserTokens`. |
| **Article 20** | Right to Data Portability | Endpoint `GET /api/v1/gdpr/export` provides a complete, machine-readable JSON bundle containing user data, parsed experiences, skills, and activities. |
| **Article 21** | Right to Object | Users can opt out of automated matching, email digests, or marketing at any time via Settings. |

### 2.3 Data Minimization & Retention
- Resumes are retained only while the candidate account is active.
- Crawled job postings do not store personal contact information of recruiters unless publicly provided in business job ads.
- Log data (IP addresses, user agents) is truncated/anonymized after 30 days.

---

## 3. EU AI Act Assessment & Compliance

Under the **EU Artificial Intelligence Act (Regulation (EU) 2024/1689)**:
- **Annex III Classification (Employment & Worker Management):**
  - AI systems used in recruitment or selection of natural persons, notably for placing targeted job advertisements, analyzing and filtering job applications, and evaluating candidates **on behalf of employers** can fall into the **High-Risk AI System** category.
- **Platform Specific Positioning:**
  - This platform operates as a **Candidate-Side Job Discovery & Recommendation Agent** (similar to a personalized search engine).
  - It does **not** make hiring or rejection decisions on behalf of employers.
  - It does **not** filter out candidates or rank candidates for employers.
  - To maintain ethical standards and future-proof against high-risk requirements, the platform adopts High-Risk safeguards:
    1. **Zero Discriminatory Inputs:** The scoring model strictly excludes age, gender, ethnicity, religion, marital status, or disability from vector embeddings and matching algorithms.
    2. **Explainable AI (Transparency):** Every recommendation exposes explicit reasoning (e.g. "Matched because 5/7 skills align and location is Munich").
    3. **Human Agency:** Candidates maintain complete autonomy to apply or dismiss any job; no automated applications occur without explicit candidate trigger.
    4. **Auditability:** Scoring weights are logged, versioned, and auditable by administrators.

---

## 4. Technical Safeguards & Architecture

1. **EU Data Residency:** All data stores (PostgreSQL, Redis, S3 document storage) are provisioned in AWS Frankfurt (`eu-central-1`).
2. **Encryption:**
   - In Transit: TLS 1.3 encryption mandatory on all public endpoints.
   - At Rest: AES-256 server-side encryption for all stored resumes and database volumes.
3. **Separation of Secrets:** API keys and credentials are never stored in plain text; environment secrets managed via AWS Secrets Manager / Vault.

