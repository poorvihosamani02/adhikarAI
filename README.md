# AdhikarAI Practice Platform

A modular, hackathon-ready preparation repository for **AdhikarAI** — an Indian Citizen Welfare & Rights Intelligence System.

---

## Architecture Overview

```
adhikar-practice/
├── datasets/                        # Original research datasets (Strictly Preserved)
│   ├── schemes_raw.csv              # 20 schemes across central and state jurisdictions
│   ├── document_doctor_dataset.csv  # 30 official Indian document verification rules
│   ├── scam_message_dataset.csv     # 22 verified Indian scam & genuine messages
│   ├── know_your_rights.csv         # 4 verified statutory rights records (RTI, Legal Aid, 1930)
│   ├── rag_documents.csv            # 7 document source references for RAG
│   └── README.md                    # Detailed dataset audits, column schemas & limits
│
├── frontend/                        # React 18 + Vite Citizen Portal
│   ├── src/
│   │   ├── api/                     # Dedicated API modules (auth, profile, schemes, docs, scam, chat)
│   │   ├── components/              # Navbar, Footer, SchemeCard, Checklist, StatCard, DemoBanner
│   │   ├── context/                 # AuthContext, ProfileContext, DemoModeContext
│   │   ├── data/                    # Derived JSON mirrors of datasets (Zero hallucination)
│   │   ├── pages/                   # 9 complete pages for all user workflows
│   │   ├── index.css                # Polished design system tokens (Vanilla CSS)
│   │   └── App.jsx                  # React Router root
│   └── README.md                    # Frontend run guide
│
├── ai-services/                     # 3 Independent Python FastAPI Microservices
│   ├── rag-chatbot/                 # Port 8001: Legal rights grounded Q&A
│   ├── document-doctor/             # Port 8002: Document verification & error prevention
│   └── scam-shield/                 # Port 8003: Heuristic scam & phishing detector
│
├── backend/                         # EMPTY DIRECTORY (Reserved for your Node.js backend)
│
└── docs/
    └── BACKEND_INTEGRATION_GUIDE.md # API contract & schemas for your Node.js backend
```

---

## Quick Start Guide

### 1. Frontend (React + Vite)
```powershell
cd c:\Users\DELL\Desktop\adhikar-practice\frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 2. RAG Chatbot Service (Port 8001)
```powershell
cd c:\Users\DELL\Desktop\adhikar-practice\ai-services\rag-chatbot
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
# Health: http://127.0.0.1:8001/api/health
```

### 3. Document Doctor Service (Port 8002)
```powershell
cd c:\Users\DELL\Desktop\adhikar-practice\ai-services\document-doctor
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8002 --reload
# Health: http://127.0.0.1:8002/api/health
```

### 4. Scam Shield Service (Port 8003)
```powershell
cd c:\Users\DELL\Desktop\adhikar-practice\ai-services\scam-shield
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8003 --reload
# Health: http://127.0.0.1:8003/api/health
```

---

## Handover & Development Status

- **Original Datasets:** 100% preserved in `datasets/`.
- **Backend Directory:** `backend/` is completely empty. No Node.js backend code was generated.
- **Frontend:** Fully functional with built-in Demo Mode adapters and prepared for future Node.js routes (`VITE_API_BASE_URL=http://localhost:3000`).
- **Python AI Services:** 3 independent FastAPI microservices on ports 8001, 8002, 8003 with Pydantic validation and health checks.
- **Backend Integration Contract:** Documented in [BACKEND_INTEGRATION_GUIDE.md](file:///c:/Users/DELL/Desktop/adhikar-practice/docs/BACKEND_INTEGRATION_GUIDE.md).
