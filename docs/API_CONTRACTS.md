# REST API Specification & Contracts
**Protocol:** HTTPS / REST / JSON  
**Authentication:** Bearer JWT (Authorization: Bearer `<token>`) & Cookie-based Refresh  
**Standard Response Envelope:**  
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "errors": null,
  "timestamp": "2026-11-18T14:50:00Z"
}
```

---

## 1. Authentication & Identity (`/api/v1/auth`)

### 1.1 Register
- **Endpoint:** `POST /api/v1/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "candidate@example.de",
    "password": "StrongPassword123!",
    "firstName": "Lukas",
    "lastName": "Müller",
    "consentGiven": true,
    "policyVersion": "2026.1"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "candidate@example.de",
      "message": "Registration successful. Please verify your email."
    }
  }
  ```

### 1.2 Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "candidate@example.de",
    "password": "StrongPassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
      "expiresIn": 900,
      "user": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "email": "candidate@example.de",
        "firstName": "Lukas",
        "lastName": "Müller",
        "role": "Candidate"
      }
    }
  }
  ```
  *(HTTP-only cookie `refreshToken` set with 7-day expiry)*

### 1.3 Refresh Token
- **Endpoint:** `POST /api/v1/auth/refresh`
- **Access:** Public (via Cookie)
- **Response (200 OK):** New access token and rotated refresh cookie.

### 1.4 Logout
- **Endpoint:** `POST /api/v1/auth/logout`
- **Access:** Authenticated (Candidate / Admin)

---

## 2. Candidate Profile & CV Management (`/api/v1/candidate`)

### 2.1 Get Candidate Profile
- **Endpoint:** `GET /api/v1/candidate/profile`
- **Access:** Candidate
- **Response (200 OK):** Returns profile, experiences, educations, verified skills, and resume metadata.

### 2.2 Update Profile
- **Endpoint:** `PUT /api/v1/candidate/profile`
- **Access:** Candidate
- **Request Body:**
  ```json
  {
    "headline": "Senior Full-Stack Engineer (React / .NET)",
    "summary": "Full-stack engineer with 7 years experience building distributed cloud applications in Munich.",
    "yearsOfExperience": 7.0,
    "currentLocation": "Munich, Germany",
    "preferredLocations": ["Munich", "Berlin", "Remote"],
    "preferredEmploymentTypes": ["FullTime"],
    "remotePreference": "Hybrid",
    "expectedSalaryMin": 75000,
    "expectedSalaryMax": 90000,
    "noticePeriodDays": 30,
    "languages": [
      { "lang": "German", "level": "C1" },
      { "lang": "English", "level": "Fluent" }
    ],
    "skills": ["C#", ".NET", "Next.js", "PostgreSQL", "Docker", "TypeScript"]
  }
  ```

### 2.3 Upload & Parse Resume
- **Endpoint:** `POST /api/v1/candidate/resumes/upload`
- **Access:** Candidate
- **Content-Type:** `multipart/form-data` (file: `.pdf` or `.docx`, max 10MB)
- **Response (202 Accepted):**
  ```json
  {
    "success": true,
    "data": {
      "resumeId": "550e8400-e29b-41d4-a716-446655440000",
      "fileName": "Lukas_Mueller_CV.pdf",
      "status": "Processing",
      "message": "Resume uploaded successfully. Extraction and vectorization started."
    }
  }
  ```

### 2.4 Get Parsed Resume Data & Correction
- **Endpoint:** `GET /api/v1/candidate/resumes/{resumeId}`
- **Endpoint:** `PUT /api/v1/candidate/resumes/{resumeId}/confirm` (Applies parsed skills/experiences to candidate profile)

---

## 3. Job Search & Discovery (`/api/v1/jobs`)

### 3.1 Search Jobs
- **Endpoint:** `GET /api/v1/jobs`
- **Access:** Public / Candidate
- **Query Parameters:**
  - `q`: Search terms (e.g. "Software Engineer")
  - `location`: City or region (e.g. "Berlin", "Munich", "Frankfurt", "Hamburg")
  - `country`: Default "Germany"
  - `workplaceType`: `OnSite` | `Hybrid` | `Remote`
  - `employmentType`: `FullTime` | `PartTime` | `Contract`
  - `minSalary`: Minimum annual EUR
  - `experienceLevel`: `Junior` | `MidLevel` | `Senior` | `Lead`
  - `language`: `German` | `English`
  - `postedWithinDays`: `1` | `7` | `14` | `30`
  - `page`: default `1`
  - `pageSize`: default `20` (max 100)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "7b3b4f62-38b8-47a3-83d1-417d7b05599f",
          "title": "Senior Cloud Software Engineer (m/w/d)",
          "companyName": "Siemens AG",
          "companyLogoUrl": "https://...",
          "locationCity": "Munich",
          "locationCountry": "Germany",
          "workplaceType": "Hybrid",
          "employmentType": "FullTime",
          "salaryMin": 80000,
          "salaryMax": 95000,
          "salaryCurrency": "EUR",
          "requiredLanguages": [{ "lang": "German", "level": "B2" }, { "lang": "English", "level": "Fluent" }],
          "postedAt": "2026-11-17T09:00:00Z",
          "applicationUrl": "https://siemens.com/careers/..."
        }
      ],
      "totalCount": 1420,
      "page": 1,
      "pageSize": 20,
      "totalPages": 71
    }
  }
  ```

### 3.2 Get Job Details
- **Endpoint:** `GET /api/v1/jobs/{jobId}`
- **Access:** Public / Candidate

---

## 4. AI Recommendations & Matching (`/api/v1/matches`)

### 4.1 Get Personalized AI Matches
- **Endpoint:** `GET /api/v1/matches`
- **Access:** Candidate
- **Query Parameters:**
  - `minScore`: Minimum match threshold (default: 60.0)
  - `limit`: default 20
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "matches": [
        {
          "jobId": "7b3b4f62-38b8-47a3-83d1-417d7b05599f",
          "jobTitle": "Senior Cloud Software Engineer (m/w/d)",
          "companyName": "Siemens AG",
          "locationCity": "Munich",
          "workplaceType": "Hybrid",
          "overallMatchScore": 88.5,
          "scores": {
            "skillsScore": 92.0,
            "experienceScore": 90.0,
            "locationScore": 100.0,
            "languageScore": 85.0,
            "salaryScore": 75.0
          },
          "matchingSkills": ["C#", ".NET", "PostgreSQL", "Docker", "TypeScript"],
          "missingSkills": ["Kubernetes", "Terraform"],
          "explanation": {
            "summary": "Excellent 88.5% match for your profile as a Senior Engineer based in Munich.",
            "skillsNote": "You possess 5 out of 7 key technical skills required.",
            "experienceNote": "Your 7 years of experience aligns with the Senior band (5+ years).",
            "locationNote": "Job is Hybrid in Munich, which directly matches your preferred location.",
            "languageNote": "Your German C1 meets the required B2 level."
          }
        }
      ]
    }
  }
  ```

---

## 5. Candidate Activity: Saved Jobs & Tracker (`/api/v1/activity`)

- `POST /api/v1/activity/saved-jobs/{jobId}`: Save job bookmark.
- `DELETE /api/v1/activity/saved-jobs/{jobId}`: Remove bookmark.
- `GET /api/v1/activity/saved-jobs`: List all saved jobs.
- `POST /api/v1/activity/applications`: Track application (`status`: Applied, Interviewing, etc.).
- `PUT /api/v1/activity/applications/{applicationId}`: Update application stage and interview notes.
- `GET /api/v1/activity/applications`: List candidate applications pipeline.

---

## 6. Admin Control Center (`/api/v1/admin`)

- **Role:** SuperAdmin, Admin, DataOperator
- `GET /api/v1/admin/dashboard/kpis`: Total users, active candidates, jobs ingested today, active sources, failure rate, match count.
- `GET /api/v1/admin/sources`: List all registered crawler/API sources with health status, last sync, error logs.
- `POST /api/v1/admin/sources`: Register new job source.
- `POST /api/v1/admin/sources/{sourceId}/trigger`: Manually trigger ingestion run.
- `GET /api/v1/admin/users`: User management, status toggling, role assignment.
- `GET /api/v1/admin/jobs`: Content moderation, manual job updates or deactivation.
- `GET /api/v1/admin/matching/weights`: Get active matching weights.
- `PUT /api/v1/admin/matching/weights`: Update matching weights (e.g. skills: 40%, experience: 25%, etc.).
- `GET /api/v1/admin/audit-logs`: Security and administrative audit trail.

---

## 7. GDPR & Privacy Endpoints (`/api/v1/gdpr`)

- `GET /api/v1/gdpr/export`: Download all user PII, profile, uploaded CVs, consents, and matches in structured JSON (Article 20 - Data Portability).
- `POST /api/v1/gdpr/consent`: Record update to consent choices.
- `DELETE /api/v1/gdpr/delete-account`: Permanent account erasure (Article 17 - Right to Erasure / Right to be Forgotten). Cascade deletes candidate profile, CV files from S3, embeddings, and matches; retains an anonymized audit log.
