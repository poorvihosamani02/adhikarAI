# AdhikarAI — Verified Backend API Integration Guide

**Document Version:** 1.0.0  
**Environment:** Local Development / Integration Readiness  
**Target Gateway:** Node.js Express Gateway (`http://localhost:3000`)  
**AI Services:** Python FastAPI Microservices (`http://127.0.0.1:8001`, `http://127.0.0.1:8002`, `http://127.0.0.1:8003`)  
**Database:** SQLite 3 (`backend/adhikar.db`) via `better-sqlite3`

---

## 1. Architectural Architecture & Topology

AdhikarAI operates on a coordinated microservice architecture where the **Node.js Express backend serves as the single API gateway** for the React frontend. The gateway handles client authentication, profile persistence, scheme evaluation, and safely proxies specialized tasks to isolated Python AI services.

```
+-----------------------------------------------------------------------------------+
|                                React Frontend (Vite)                              |
|                          Listening on http://localhost:5173                       |
+-----------------------------------------------------------------------------------+
                                          |
                                   HTTP / JSON (REST)
                                          |
+-----------------------------------------------------------------------------------+
|                        Node.js Express Gateway (Port 3000)                        |
|                                                                                   |
|  - CORS Whitelist: localhost:5173, localhost:4173                                 |
|  - JWT Authentication & Middleware (Bearer Token, 2h TTL)                         |
|  - SQLite Database Operations (better-sqlite3: users, profiles, schemes)          |
|  - Native Eligibility Matching Engine (backend/services/eligibilityService.js)    |
|  - Scheme Document Checklist Generator (backend/services/documentService.js)      |
+-----------------------------------------------------------------------------------+
           |                                |                               |
     HTTP Proxy (8001)                HTTP Proxy (8002)               HTTP Proxy (8003)
     Timeout: 10s                     Timeout: 10s                    Timeout: 10s
           |                                |                               |
+----------------------+         +----------------------+        +----------------------+
|  Python RAG Chatbot  |         |   Document Doctor    |        |     Scam Shield      |
|     (Port 8001)      |         |     (Port 8002)      |        |     (Port 8003)      |
|                      |         |                      |        |                      |
| FastAPI Microservice |         | FastAPI Microservice |        | FastAPI Microservice |
| Datasets:            |         | Dataset:             |        | Dataset:             |
| - know_your_rights   |         | - document_doctor_   |        | - scam_message_      |
| - rag_documents      |         |   dataset.csv        |        |   dataset.csv        |
+----------------------+         +----------------------+        +----------------------+
```

---

## 2. Global Gateway Standards & Protocols

### 2.1 CORS Whitelist
The gateway explicitly authorizes requests from:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`
- `http://localhost:4173` (Vite preview server)
- `http://127.0.0.1:4173`
- Optional custom origin passed via `process.env.FRONTEND_URL`

**Allowed Methods:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`  
**Allowed Headers:** `Content-Type`, `Authorization`, `Accept`  
**Credentials:** `credentials: true`

### 2.2 Standard Error Response Envelope
When any gateway or upstream error occurs, the API returns a structured JSON payload:
```json
{
  "status": "error",
  "message": "Human-readable explanation of the error."
}
```

### 2.3 Authentication & Authorization Model
- **Token Mechanism:** Stateless JSON Web Token (JWT) signed using HMAC-SHA256.
- **Header Convention:** `Authorization: Bearer <JWT_TOKEN>`
- **Token Payload:** `{ "userId": <integer_user_id>, "iat": ..., "exp": ... }`
- **Lifespan:** Exactly **2 hours** (`expiresIn: '2h'`).
- **401 Unauthorized:** Returned if the header is missing, malformed, invalid, or expired.
- **404 User Not Found:** Returned if the token is cryptographically valid but the user record was removed from the database.

---

## 3. Complete Endpoint Reference

### 3.1 Authentication APIs

#### A. User Registration
Registers a new citizen account and hashes the password with bcrypt (12 rounds).
- **Route:** `POST /api/auth/register`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "name": "Arun Kumar",
    "email": "arun.kumar@example.com",
    "password": "Password@123"
  }
  ```
- **Validation Rules:**
  - `name`: Required, non-empty string. Trimmed before persistence.
  - `email`: Required, valid string. Converted to lowercase and trimmed.
  - `password`: Required, minimum 8 characters.
- **Responses:**
  - `201 Created`:
    ```json
    {
      "status": "success",
      "message": "Account created successfully.",
      "user": {
        "id": 1,
        "name": "Arun Kumar",
        "email": "arun.kumar@example.com"
      }
    }
    ```
  - `400 Bad Request`: `{ "status": "error", "message": "Name, email, and password are required." }` or `{ "status": "error", "message": "Password must contain at least 8 characters." }`
  - `409 Conflict`: `{ "status": "error", "message": "An account with this email already exists." }`

#### B. User Login
Authenticates an existing citizen and returns a signed 2-hour JWT.
- **Route:** `POST /api/auth/login`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "email": "arun.kumar@example.com",
    "password": "Password@123"
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "status": "success",
      "message": "Login successful.",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "name": "Arun Kumar",
        "email": "arun.kumar@example.com"
      }
    }
    ```
  - `400 Bad Request`: `{ "status": "error", "message": "Email and password are required." }`
  - `401 Unauthorized`: `{ "status": "error", "message": "Invalid email or password." }`

---

### 3.2 Citizen Profile APIs

#### A. Retrieve Citizen Profile
Retrieves demographic and socioeconomic data for the authenticated citizen.
- **Route:** `GET /api/profile`
- **Auth:** Bearer Token Required
- **Responses:**
  - `200 OK` (Profile exists):
    ```json
    {
      "status": "success",
      "profile": {
        "id": 1,
        "userId": 1,
        "name": "Arun Kumar",
        "email": "arun.kumar@example.com",
        "age": 24,
        "gender": "Male",
        "annual_income": 120000,
        "annualIncome": 120000,
        "category": "OBC",
        "state": "Karnataka",
        "education_level": "Undergraduate",
        "educationLevel": "Undergraduate",
        "course": "B.Tech",
        "occupation": "Student",
        "is_minority": false,
        "isMinority": false,
        "is_bpl": true,
        "isBPL": true,
        "updated_at": "2026-10-23 15:30:00"
      }
    }
    ```
  - `200 OK` (No profile created yet):
    ```json
    {
      "status": "success",
      "profile": null,
      "message": "No profile created yet for this account."
    }
    ```
  - `401 Unauthorized`: Missing or invalid token.

#### B. Create or Update Citizen Profile (Upsert)
Creates or updates the profile fields using `ON CONFLICT(user_id) DO UPDATE`.
- **Route:** `POST /api/profile` or `PUT /api/profile`
- **Auth:** Bearer Token Required
- **Request Body (Accepts snake_case or camelCase):**
  ```json
  {
    "name": "Arun Kumar",
    "age": 24,
    "gender": "Male",
    "annual_income": 120000,
    "category": "OBC",
    "state": "Karnataka",
    "education_level": "Undergraduate",
    "course": "B.Tech",
    "occupation": "Student",
    "is_minority": false,
    "is_bpl": true
  }
  ```
- **Validation Rules:**
  - `age`: Optional, but if provided must be an integer between 1 and 120 (`400 Bad Request` if invalid).
  - `annual_income` / `annualIncome`: Optional, must be non-negative number (`400 Bad Request` if negative).
  - `is_bpl` / `isBPL`: Converted to SQLite boolean integer (0 or 1).
  - `is_minority` / `isMinority`: Converted to SQLite boolean integer (0 or 1).
  - `name`: If supplied, synchronously updates `users.name` as well.
- **Responses:**
  - `200 OK`:
    ```json
    {
      "status": "success",
      "message": "Citizen profile saved successfully.",
      "profile": { ... }
    }
    ```

---

### 3.3 Government Scheme & Eligibility APIs

#### A. List All Cataloged Schemes
Returns all 20 cataloged welfare schemes ordered alphabetically.
- **Route:** `GET /api/schemes`
- **Auth:** Public
- **Responses:**
  - `200 OK`:
    ```json
    {
      "status": "success",
      "count": 20,
      "data": [
        {
          "scheme_id": "SC001",
          "scheme_name": "Post-Matric Scholarship for SC Students",
          "provider_type": "Government",
          "provider_name": "Ministry of Social Justice and Empowerment",
          "jurisdiction": "Central",
          "category": "Education & Scholarships",
          "benefit_description": "Financial assistance for post-matriculation studies...",
          "benefit_amount": 13500.0,
          "benefit_frequency": "Annual",
          "eligibility_text": "SC students with family income <= 2.5 LPA...",
          "min_age": 15,
          "max_age": 35,
          "max_family_income": 250000.0,
          "eligible_state": null,
          "eligible_course": "Post-Matric",
          "required_documents": "Caste Certificate; Income Certificate; Marks Card; Fee Receipt; Aadhaar Card",
          "application_start": "2026-07-01",
          "application_deadline": "2026-11-30",
          "application_url": "https://scholarships.gov.in",
          "source_url": "https://socialjustice.gov.in",
          "guideline_url": "https://scholarships.gov.in/guidelines",
          "academic_year": "2026-2027",
          "last_verified": "2026-09-15",
          "verification_status": "needs_review",
          "notes": "State portal verification required."
        }
      ],
      "schemes": [ ... ]
    }
    ```

#### B. Get Scheme Details by ID
Returns enriched scheme information including parsed document metadata and portal links.
- **Route:** `GET /api/schemes/:id` (e.g. `/api/schemes/SC001`)
- **Auth:** Public
- **Responses:**
  - `200 OK`:
    ```json
    {
      "status": "success",
      "data": {
        "scheme_id": "SC001",
        "scheme_name": "Post-Matric Scholarship for SC Students",
        "has_required_documents": true,
        "structured_documents": [
          {
            "id": "DOC_SC001_1",
            "name": "Caste Certificate",
            "category": "Category / Caste Certificate",
            "guidance": "Must state official community/caste code matching government notified lists.",
            "source": "official_scheme_dataset",
            "is_mandatory": true
          }
        ],
        "application_info": {
          "application_url": "https://scholarships.gov.in",
          "source_url": "https://socialjustice.gov.in",
          "guideline_url": "https://scholarships.gov.in/guidelines",
          "application_start": "2026-07-01",
          "application_deadline": "2026-11-30"
        },
        "verification_info": {
          "status": "needs_review",
          "is_officially_verified": false,
          "last_verified": "2026-09-15",
          "warning": "This scheme has verification_status=\"needs_review\" and has not been officially verified against current ministry guidelines. Please verify details on the official portal."
        }
      }
    }
    ```
  - `404 Not Found`: `{ "status": "error", "message": "Scheme not found." }`

#### C. Get Structured Scheme Document Checklist
Extracts and categorizes required certificates from the official dataset record.
- **Route:** `GET /api/schemes/:id/documents`
- **Auth:** Public
- **Responses:**
  - `200 OK`:
    ```json
    {
      "status": "success",
      "scheme_id": "SC001",
      "scheme_name": "Post-Matric Scholarship for SC Students",
      "provider_name": "Ministry of Social Justice and Empowerment",
      "jurisdiction": "Central",
      "category": "Education & Scholarships",
      "verification_status": "needs_review",
      "is_officially_verified": false,
      "verification_warning": "This scheme has verification_status=\"needs_review\". Document requirements may vary based on latest ministry notifications.",
      "has_verified_docs": true,
      "has_required_documents": true,
      "documents_count": 5,
      "documents": [ ... ],
      "unavailable_message": null,
      "official_portal_url": "https://scholarships.gov.in"
    }
    ```

#### D. Find My Schemes (Eligibility Evaluation)
Evaluates the authenticated citizen profile against all 20 schemes using the server-side rules engine.
- **Route:** `GET /api/schemes/matched` (Aliases: `/api/schemes/my-schemes`, `POST /api/schemes/my-schemes`, `GET /api/eligibility/matched`)
- **Auth:** Bearer Token Required
- **Responses:**
  - `200 OK` (Profile exists):
    ```json
    {
      "status": "success",
      "has_profile": true,
      "citizen": {
        "id": 1,
        "name": "Arun Kumar",
        "email": "arun.kumar@example.com",
        "age": 24,
        "gender": "Male",
        "annual_income": 120000,
        "category": "SC",
        "state": "Karnataka",
        "education_level": "Undergraduate",
        "course": "B.Tech",
        "occupation": "Student",
        "is_minority": false,
        "is_bpl": true
      },
      "summary": {
        "total_schemes_evaluated": 20,
        "matched_count": 7,
        "ineligible_count": 13,
        "verified_schemes_count": 1,
        "needs_review_count": 19
      },
      "dataset_notice": "Dataset notice: 19 of 20 schemes in this dataset have verification_status=\"needs_review\"...",
      "matched_count": 7,
      "schemes": [
        {
          "scheme_id": "SC001",
          "scheme_name": "Post-Matric Scholarship for SC Students",
          "is_eligible": true,
          "match_percentage": 100,
          "matched_criteria": [
            "Pan-India Central Scheme: open to eligible citizens across all Indian States & UTs.",
            "Annual income ₹1,20,000 is within the maximum family income limit of ₹2,50,000.",
            "Age 24 is within the eligible age range (15 - 35 years).",
            "Social category \"SC\" matches scheme target category."
          ],
          "unmet_criteria": [],
          "unknown_conditions": [],
          "benefit_description": "Financial assistance for post-matriculation studies...",
          "benefit_amount": 13500.0,
          "application_url": "https://scholarships.gov.in"
        }
      ]
    }
    ```
  - `200 OK` (Citizen has no profile yet):
    ```json
    {
      "status": "success",
      "has_profile": false,
      "message": "Citizen profile not found. Please complete your profile to find eligible schemes.",
      "matched_count": 0,
      "total_schemes_evaluated": 0,
      "schemes": []
    }
    ```

---

### 3.4 Know Your Rights RAG Chatbot APIs

#### A. Chatbot Health Probe
Checks gateway-to-microservice connectivity on port 8001.
- **Route:** `GET /api/chat/health`
- **Auth:** Public
- **Responses:**
  - `200 OK`:
    ```json
    {
      "status": "success",
      "gateway": "Node.js Express",
      "rag_service": {
        "status": "healthy",
        "service": "rag-chatbot",
        "port": 8001,
        "loaded_rights": 4,
        "loaded_documents": 7
      }
    }
    ```
  - `503 Service Unavailable`: If port 8001 is offline.

#### B. Citizen Legal Rights Q&A
Answers legal inquiries grounded in `know_your_rights.csv` and `rag_documents.csv`.
- **Route:** `POST /api/chat`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "question": "How do I file an RTI application online for a central ministry?",
    "language": "English"
  }
  ```
- **Validation Rules:**
  - `question`: Required, non-empty string, trimmed length between 2 and 1000 characters.
  - `language`: Optional string, maximum length 50 characters (default: `"English"`).
- **Responses:**
  - `200 OK` (Verified dataset match):
    ```json
    {
      "status": "success",
      "is_mock": false,
      "answer": "To file a Central RTI online: 1. Visit https://rtionline.gov.in. 2. Submit initial fee of ₹10...",
      "language": "English",
      "sources": [
        {
          "document_id": "DOC001",
          "title": "RTI Online Guidelines",
          "authority": "Department of Personnel and Training (DoPT)",
          "source_url": "https://rtionline.gov.in/guidelines.php",
          "legal_basis": "Right to Information Act, 2005 (Section 6)",
          "verification_status": "official"
        }
      ],
      "suggested_questions": [
        "What is the time limit for an RTI reply?",
        "How do I file an RTI first appeal?"
      ]
    }
    ```
  - `200 OK` (Out-of-scope query / Zero Hallucinations):
    ```json
    {
      "status": "success",
      "is_mock": true,
      "answer": "I do not have verified legal data in my starter knowledge base for this question. To prevent misinformation, I only answer verified queries covering: 1. Filing Central RTIs... 2. NALSA free legal aid... 3. Cyber fraud reporting via 1930.",
      "language": "English",
      "sources": [],
      "suggested_questions": [
        "How do I file an RTI online?",
        "Who is eligible for free legal aid under NALSA?",
        "How do I report financial cyber fraud via 1930?"
      ]
    }
    ```
  - `400 Bad Request`: Validation failure (empty, oversized > 1000 chars, non-string).
  - `503 Service Unavailable`: Python microservice on port 8001 is down.
  - `504 Gateway Timeout`: Python microservice took > 10 seconds.

---

### 3.5 Scam Shield APIs

#### A. Scam Shield Health Probe
Checks gateway-to-microservice connectivity on port 8003.
- **Route:** `GET /api/scam/health`
- **Auth:** Public
- **Responses:**
  - `200 OK`:
    ```json
    {
      "status": "success",
      "gateway": "Node.js Express",
      "scam_service": {
        "status": "healthy",
        "service": "scam-shield",
        "port": 8003,
        "patterns_loaded": 22
      }
    }
    ```
  - `503 Service Unavailable`: If port 8003 is offline.

#### B. Analyze Suspicious Message or URL
Evaluates SMS, WhatsApp, email text, and suspicious URLs against 22 heuristics from `scam_message_dataset.csv`.
- **Route:** `POST /api/scam/analyze`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "message_text": "Dear user, your electricity power will be disconnected at 9:30 PM due to unpaid bill. Call 9876543210 immediately.",
    "url": "http://tinyurl.com/pay-bill"
  }
  ```
- **Validation Rules:**
  - `message_text`: Required, non-empty string, trimmed length between 2 and 5000 characters.
  - `url`: Optional string, maximum length 1000 characters.
- **Responses:**
  - `200 OK`:
    ```json
    {
      "status": "success",
      "is_mock": true,
      "risk_level": "high",
      "scam_type": "Power Bill Fraud",
      "confidence_score": 0.95,
      "matched_patterns": [
        "electricity disconnection threat",
        "immediate phone call prompt"
      ],
      "warning_signs": [
        "Urgent disconnection deadline threat",
        "Personal mobile number provided instead of official electricity board portal",
        "Unverified short URL"
      ],
      "recommended_actions": [
        "Do not call the mobile number in the message",
        "Verify your bill status directly on the official state DISCOM portal",
        "Report cyber financial fraud to 1930 or cybercrime.gov.in"
      ],
      "advisory_sources": [
        "National Cyber Crime Reporting Portal (cybercrime.gov.in)",
        "State Electricity Regulatory Commission Advisory"
      ],
      "disclaimer": "This analysis is generated using heuristic pattern matching and citizen advisories."
    }
    ```
  - `400 Bad Request`: Validation failure (empty message, oversized text > 5000 chars, oversized URL > 1000 chars).
  - `503 Service Unavailable`: Python microservice on port 8003 is down.
  - `504 Gateway Timeout`: Python microservice took > 10 seconds.

---

### 3.6 Document Doctor APIs

#### A. Document Doctor Health Probe
Checks gateway-to-microservice connectivity on port 8002.
- **Route:** `GET /api/documents/health`
- **Auth:** Public
- **Responses:**
  - `200 OK`:
    ```json
    {
      "status": "success",
      "gateway": "Node.js Express",
      "doc_service": {
        "status": "healthy",
        "service": "document-doctor",
        "port": 8002,
        "rules_loaded": 30
      }
    }
    ```

#### B. Get Document Verification Rules Catalog
Returns the 30 document verification rules loaded from `document_doctor_dataset.csv`.
- **Route:** `GET /api/documents/rules`
- **Auth:** Public
- **Responses:**
  - `200 OK`:
    ```json
    {
      "status": "success",
      "count": 30,
      "rules": [
        {
          "rule_id": "RULE_001",
          "document_name": "Aadhaar Card",
          "document_type": "Identity Proof",
          "issuing_authority": "UIDAI"
        },
        {
          "rule_id": "RULE_002",
          "document_name": "Income Certificate",
          "document_type": "Income Proof",
          "issuing_authority": "Revenue Department / Tahsildar"
        }
      ]
    }
    ```

#### C. Pre-Verification Document Check
Evaluates document upload metadata and user notes against dataset rules to prevent rejection before submission.
- **Route:** `POST /api/documents/check`
- **Auth:** Public
- **Request Body (JSON metadata):**
  ```json
  {
    "scheme_id": "SC001",
    "document_type": "Income Proof",
    "document_name": "Income Certificate",
    "file_name": "income_cert_2026.pdf",
    "file_size_kb": 240.5,
    "user_notes": "Issued by Tahsildar Bangalore North"
  }
  ```
- **Validation Rules:**
  - `document_name`: Required non-empty string.
  - `document_type`: Required non-empty string.
  - `file_name`: File extension must be `.pdf`, `.jpg`, `.jpeg`, or `.png`.
  - `file_size_kb`: Must be > 0 and <= 5120 KB (5 MB).
- **Responses:**
  - `200 OK`:
    ```json
    {
      "status": "success",
      "is_mock": true,
      "rule_id": "RULE_002",
      "document_name": "Income Certificate",
      "document_type": "Income Proof",
      "document_purpose": "Proof of annual household income for scholarship eligibility.",
      "issuing_authority": "Revenue Department / Nadakacheri / Tahsildar",
      "official_verification_method": "Nadakacheri / State Revenue Portal QR or Barcode Verification",
      "accepted_format": "PDF / Image",
      "expiry_or_validity_rule": "Valid for 1 financial year (or 5 years in Karnataka for specific G.O.)",
      "extracted_fields": {
        "applicant_name": "Extracted from Certificate",
        "annual_income": "Extracted Amount",
        "validity_period": "Current FY"
      },
      "missing_or_unreadable": [],
      "possible_mismatches": [],
      "validation_checks": [
        "Certificate must bear official digital signature or Tahsildar seal",
        "Income amount must match the value declared in your citizen profile",
        "Date of issue must fall within the eligible window"
      ],
      "common_errors_to_check": [
        "Submitting expired previous financial year certificate",
        "Name spelling mismatch between Aadhaar and Income certificate",
        "Blurry photo or unreadable Nadakacheri acknowledgment number"
      ],
      "warnings": [],
      "corrective_action": "Ensure the certificate is digitally signed and verify the acknowledgment number on Nadakacheri portal.",
      "source_url": "https://nadakacheri.karnataka.gov.in",
      "disclaimer": "This is a demonstration analysis based on official validation rules in our dataset."
    }
    ```

---

## 4. Upstream Python AIML Service Contract Status

| Service | Port | Protocol | Dataset Origin | Real Underlying Engine |
|---|:---:|:---:|---|---|
| **RAG Chatbot** | 8001 | HTTP REST | `know_your_rights.csv`, `rag_documents.csv` | Keyword matching + rule-based statutory retrieval. No vector store or LLM yet. |
| **Document Doctor** | 8002 | HTTP REST | `document_doctor_dataset.csv` (30 rules) | Rule-based metadata matcher. Does not perform computer vision / OCR yet. |
| **Scam Shield** | 8003 | HTTP REST | `scam_message_dataset.csv` (22 patterns) | Heuristic token matcher + regex detection. No PyTorch / deep learning model yet. |

---

## 5. Summary of Frontend Integration Responsibilities

1. **Store Token Securely:** On successful login, save `token` in `localStorage` or `sessionStorage` and include it in the `Authorization: Bearer <token>` header for `/api/profile` and `/api/schemes/matched`.
2. **Handle Empty Profile Gracefully:** When calling `/api/schemes/matched`, if `has_profile: false` is returned, prompt the user with a direct call-to-action to complete their profile at `/profile`.
3. **No File Binary Upload to Node Backend:** Document Doctor currently validates JSON metadata (`document_type`, `document_name`, `file_name`, `file_size_kb`) at `POST /api/documents/check`. Binary file objects should have their size and name inspected client-side and sent as JSON.
4. **Display Verified AI Limitations:** Always display the backend's `sources` in Know Your Rights and the `disclaimer` in Scam Shield and Document Doctor so citizens understand analysis boundaries.
