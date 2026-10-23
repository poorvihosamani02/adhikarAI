# AdhikarAI — Backend Integration Guide & API Contract

This guide is written specifically for your future **Node.js / Express** backend development. It specifies how your Node.js backend will sit between the React frontend and the three Python AI microservices.

```
+-------------------------------------------------------------+
|                      React Frontend                         |
|                    (Vite / Port 5173)                       |
+-------------------------------------------------------------+
                              |
                     REST (fetch / JSON)
                              v
+-------------------------------------------------------------+
|                     Your Node.js Backend                    |
|                      (Express / Port 3000)                  |
|   - Authentication & User Profile DB                        |
|   - Scheme catalog queries (PostgreSQL / MongoDB)           |
|   - Scheme eligibility engine                               |
|   - Reverse proxy & caller to Python AI services            |
+-------------------------------------------------------------+
          |                         |                        |
          | HTTP (Port 8001)        | HTTP (Port 8002)       | HTTP (Port 8003)
          v                         v                        v
+-------------------+     +--------------------+   +-------------------+
|    RAG Chatbot    |     |  Document Doctor   |   |    Scam Shield    |
|   FastAPI: 8001   |     |   FastAPI: 8002    |   |   FastAPI: 8003   |
+-------------------+     +--------------------+   +-------------------+
```

---

## 1. Architecture Rules

1. **Frontend Isolation**: The React frontend **never** calls the Python services directly. All frontend API calls point to `http://localhost:3000` (or `VITE_API_BASE_URL`).
2. **Empty Backend**: The `backend/` folder remains untouched and ready for you to run `npm init -y`, `npm install express cors dotenv pg` etc.
3. **Status Conventions**: All responses return a consistent envelope with:
   - `status`: `"success"` or `"error"`
   - `is_mock`: `true` or `false`
   - Detailed payload or `detail` / `message` on error.

---

## 2. Python AI Services Contract

### Service 1: RAG Chatbot (Port 8001)
- **Target URL**: `http://127.0.0.1:8001/api/chat`
- **Method**: `POST`
- **Node.js Route to expose**: `POST /api/chat`
- **Request from Node.js to Python**:
```json
{
  "question": "How do I file an RTI application online?",
  "language": "English"
}
```
- **Response from Python to Node.js**:
```json
{
  "status": "success",
  "is_mock": false,
  "answer": "**Right to seek information from central public authorities (online filing)**\n\nIndian citizens can ask central government bodies for information...",
  "language": "English",
  "sources": [
    {
      "document_id": "DOC001",
      "title": "RTI Online (Version 2.0) - Home page",
      "authority": "Department of Personnel and Training (DoPT), Government of India",
      "source_url": "https://rtionline.gov.in/",
      "legal_basis": "Right to Information Act, 2005 (Act 22 of 2005)",
      "verification_status": "verified"
    }
  ],
  "suggested_questions": [
    "How do I file an RTI application online?",
    "Who is eligible for free legal aid under NALSA?",
    "What should I do if I lost money to an online financial fraud?"
  ]
}
```

---

### Service 2: Document Doctor (Port 8002)
- **Target URL**: `http://127.0.0.1:8002/api/documents/check`
- **Method**: `POST`
- **Node.js Route to expose**: `POST /api/documents/check`
- **Request from Node.js to Python**:
```json
{
  "scheme_id": "GOV001",
  "document_type": "Identity proof",
  "document_name": "Aadhaar",
  "file_name": "sample_aadhaar.pdf",
  "file_size_kb": 240,
  "user_notes": "Checking for scholarship upload"
}
```
- **Response from Python to Node.js**:
```json
{
  "status": "success",
  "is_mock": true,
  "rule_id": "DD001",
  "document_name": "Aadhaar (e-Aadhaar PDF / Aadhaar letter / PVC card)",
  "document_type": "Identity proof",
  "document_purpose": "Identity and address proof; Aadhaar-based eKYC for scheme enrolment",
  "issuing_authority": "UIDAI (Unique Identification Authority of India)",
  "official_verification_method": "Aadhaar/QR verification via UIDAI resident portal or mAadhaar app",
  "accepted_format": "PDF (e-Aadhaar) or clear image of PVC/letter",
  "expiry_or_validity_rule": "Aadhaar number does not expire; address or demographic details may need updating",
  "extracted_fields": {
    "Name": "Detected & Readable (Demo Extraction)",
    "12-digit Aadhaar number": "Detected & Readable (Demo Extraction)",
    "date of birth or year of birth": "Detected & Readable (Demo Extraction)"
  },
  "missing_or_unreadable": [],
  "possible_mismatches": [
    "Check for: name spelling differs from other documents"
  ],
  "validation_checks": [
    "Exactly 12 numeric digits",
    "first digit not 0 or 1",
    "Verhoeff checksum passes"
  ],
  "common_errors_to_check": [
    "Typos or spaces in the number",
    "outdated address"
  ],
  "warnings": [
    "Carefully verify: Typos or spaces in the number"
  ],
  "corrective_action": "Update demographic details through myAadhaar portal or an Aadhaar enrolment centre",
  "source_url": "https://uidai.gov.in/",
  "disclaimer": "This is a demonstration analysis based on official validation rules in our dataset. This service does NOT guarantee authenticity or official acceptance by government authorities."
}
```

---

### Service 3: Scam Shield (Port 8003)
- **Target URL**: `http://127.0.0.1:8003/api/scam/analyze`
- **Method**: `POST`
- **Node.js Route to expose**: `POST /api/scam/analyze`
- **Request from Node.js to Python**:
```json
{
  "message_text": "Dear Customer, your electricity connection will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Please immediately call 9876543210.",
  "url": "http://power-bill-update.xyz"
}
```
- **Response from Python to Node.js**:
```json
{
  "status": "success",
  "is_mock": false,
  "risk_level": "high",
  "scam_type": "Power Bill Fraud",
  "confidence_score": 0.88,
  "matched_patterns": [
    "Urgency & Coercion Indicator",
    "Suspicious TLD / Link Shortener"
  ],
  "warning_signs": [
    "Artificial urgency or threat of disconnection/blocking",
    "Suspicious unverified domain extension in link: http://power-bill-update.xyz"
  ],
  "recommended_actions": [
    "Do NOT click any links or download attachments from this message.",
    "Never share your OTP, UPI PIN, banking password, or Aadhaar OTP with anyone.",
    "Immediately call the National Cybercrime Helpline at 1930."
  ],
  "advisory_sources": [
    "https://factcheck.pib.gov.in/",
    "https://cybercrime.gov.in/"
  ],
  "disclaimer": "This is an automated educational heuristic tool and does NOT guarantee that any message is 100% safe or fraudulent. Always verify through official channels."
}
```

---

## 3. Frontend-to-Backend Expected Endpoints (Your Node.js Routes)

When you write your Node.js backend, implement these routes:

| Method | Route | Description | Backend Action |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Citizen login | Verify credentials or generate mock JWT |
| `GET` | `/api/profile` | Fetch citizen profile | Query user profile from DB |
| `POST` | `/api/profile` | Save/update citizen profile | Upsert user profile in DB |
| `GET` | `/api/schemes` | Fetch all schemes (with query filters) | Query schemes table / JSON dataset |
| `GET` | `/api/schemes/:id` | Fetch single scheme details | Query scheme by ID |
| `GET` | `/api/schemes/:id/documents` | Fetch required document checklist | Return document requirements |
| `GET` | `/api/eligibility/my-schemes` | Profile-matched scheme list | Run eligibility rules on user profile |
| `POST` | `/api/documents/check` | Document Doctor inspection | Forward request to Python (Port 8002) |
| `POST` | `/api/scam/analyze` | Scam Shield message analysis | Forward request to Python (Port 8003) |
| `POST` | `/api/chat` | Legal-rights RAG chatbot | Forward request to Python (Port 8001) |

---

## 4. Node.js Proxy Snippet Example (For your future reference)

```javascript
// Example in your future Express server (e.g., server.js)
const express = require('express');
const axios = require('axios'); // or native fetch
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Forward to Python Scam Shield
app.post('/api/scam/analyze', async (req, res) => {
  try {
    const pythonResponse = await axios.post('http://127.0.0.1:8003/api/scam/analyze', req.body);
    return res.json(pythonResponse.data);
  } catch (err) {
    return res.status(502).json({
      status: 'error',
      message: 'Scam Shield AI service unavailable. Ensure Python service is running on port 8003.'
    });
  }
});
```
