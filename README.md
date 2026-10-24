# AdhikarAI Platform

An integrated Indian Citizen Welfare & Statutory Rights Intelligence System designed to empower citizens through AI-assisted scheme eligibility matching, pre-application document verification, legal rights inquiry (RAG), and proactive cyber fraud/phishing defense.

---

## Architecture Overview

```
adhikar-practice/
├── adhikar-frontend/                # React 18 + Vite Citizen Portal (Nisarga Design System)
│   ├── src/
│   │   ├── api/                     # Centralized API clients (auth, profile, schemes, AI microservices)
│   │   ├── components/              # Layout, scheme cards, document modals, background effects
│   │   ├── context/                 # AuthContext (JWT) & ProfileContext (demographics)
│   │   ├── pages/                   # Complete pages (Schemes, Rights, Document Doctor, Scam Shield, Dashboard)
│   │   ├── nisarga-styles.css       # Enhanced UI styling tokens and layouts
│   │   ├── page-styles.css          # Page-specific styling
│   │   └── index.css                # Base stylesheet
│   ├── .env.example                 # Frontend configuration template (VITE_API_BASE_URL)
│   └── package.json                 # React + Vite dependencies & scripts
│
├── backend/                         # Node.js + Express API Gateway (Port 3000)
│   ├── config/                      # SQLite database initialization & connection (better-sqlite3)
│   ├── middleware/                  # JWT Bearer token authentication guards
│   ├── routes/                      # API endpoints (auth, profile, schemes, chat, documents, scam)
│   ├── services/                    # Native scheme eligibility engine & document checklist logic
│   ├── scripts/                     # Database seeding utilities (seedSchemes.js)
│   ├── .env.example                 # Backend environment variables template (PORT, JWT_SECRET, AI URLs)
│   ├── server.js                    # Server entry point
│   └── package.json                 # Express & Node.js dependencies
│
├── ai-services/                     # 3 Independent Python FastAPI Microservices
│   ├── rag-chatbot/                 # Port 8001: Legal rights statutory RAG Q&A
│   ├── document-doctor/             # Port 8002: Document verification & error prevention
│   └── scam-shield/                 # Port 8003: Heuristic scam & phishing threat detector
│
├── datasets/                        # Ground-truth research datasets & data schemas
│   ├── schemes_raw.csv              # 20 schemes across central and state jurisdictions
│   ├── document_doctor_dataset.csv  # 30 official Indian document verification rules
│   ├── scam_message_dataset.csv     # 22 verified Indian scam & genuine messages
│   ├── know_your_rights.csv         # 4 verified statutory rights records (RTI, Legal Aid, 1930)
│   ├── rag_documents.csv            # 7 document source references for RAG
│   └── README.md                    # Detailed dataset audits & documentation
│
├── scripts/                         # Process orchestration & automation
│   ├── start-all.ps1                # Safe multi-service startup with port probing & health validation
│   └── stop-all.ps1                 # Safe shutdown strictly for script-managed processes
│
└── docs/
    └── BACKEND_INTEGRATION_GUIDE.md # API contract & schemas
```

---

## Prerequisites

- **Node.js**: Version 18.x or later (`node -v`)
- **npm**: Version 9.x or later (`npm -v`)
- **Python**: Version 3.10 or later (`python --version`)

---

## Configuration & Environment Variables

### 1. Frontend (`adhikar-frontend/.env`)
Copy `adhikar-frontend/.env.example` to `adhikar-frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 2. Backend Gateway (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_secure_random_jwt_secret_at_least_32_characters_long
RAG_SERVICE_URL=http://127.0.0.1:8001
DOC_DOCTOR_SERVICE_URL=http://127.0.0.1:8002
SCAM_SERVICE_URL=http://127.0.0.1:8003
```

---

## Running the Complete Platform

### Option A: Automated Multi-Service Startup (Recommended)
You can launch and health-check the backend gateway and all three AI microservices simultaneously using PowerShell:
```powershell
.\scripts\start-all.ps1
```
To stop services launched by the script safely:
```powershell
.\scripts\stop-all.ps1
```

### Option B: Manual Startup

#### 1. Backend Gateway (Port 3000)
```powershell
cd backend
npm install
node server.js
# Health check: http://localhost:3000/api/health
```

#### 2. Frontend Application (Port 5173)
```powershell
cd adhikar-frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

#### 3. Python AI Microservices

- **RAG Chatbot (Port 8001):**
  ```powershell
  cd ai-services\rag-chatbot
  pip install -r requirements.txt
  python -m uvicorn main:app --host 127.0.0.1 --port 8001
  ```

- **Document Doctor (Port 8002):**
  ```powershell
  cd ai-services\document-doctor
  pip install -r requirements.txt
  python -m uvicorn main:app --host 127.0.0.1 --port 8002
  ```

- **Scam Shield (Port 8003):**
  ```powershell
  cd ai-services\scam-shield
  pip install -r requirements.txt
  python -m uvicorn main:app --host 127.0.0.1 --port 8003
  ```

---

## Running Verification & Tests

### Frontend Build Check
```powershell
cd adhikar-frontend
npm run build
```

### Backend Automated Test Suite
```powershell
cd backend
node test_auth_and_profile.js
```
Integration tests against running services:
```powershell
cd backend
node test_eligibility_engine.js
node test_scheme_details_and_docs.js
```

