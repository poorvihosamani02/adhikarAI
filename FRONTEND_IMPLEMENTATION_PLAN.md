# AdhikarAI — Frontend Implementation & Architecture Plan

**Document Version:** 1.0.0  
**Stack:** React 18 + Vite + React Router v6 + Vanilla CSS (Design Tokens)  
**Gateway Target:** Node.js Express Backend (`http://localhost:3000`)  
**Status:** Architecture Blueprint for Review & Staged Execution

---

## 1. Recommended React Architecture & Directory Structure

To ensure modularity, separation of concerns, and maintainability, the React frontend should follow a domain-driven component hierarchy:

```
frontend/
├── .env                              # VITE_API_BASE_URL=http://localhost:3000
├── .env.example
├── index.html                        # Fonts: Google Fonts Outfit (headings) & Inter (body)
├── package.json                      # React, React-DOM, React-Router-DOM, Lucide-React
├── vite.config.js                    # Vite configuration with proxy rules if needed
└── src/
    ├── main.jsx                      # App root mount with React.StrictMode
    ├── App.jsx                       # Route registration, layout wrap, context providers
    ├── index.css                     # Global design tokens, typography, button/card styles
    │
    ├── api/                          # HTTP layer connecting directly to Node.js gateway
    │   ├── client.js                 # Base fetch wrapper, token injection, error handler
    │   ├── authApi.js                # login(), register()
    │   ├── profileApi.js             # getProfile(), saveProfile()
    │   ├── schemesApi.js             # getSchemes(), getSchemeById(), getSchemeDocs(), getMatchedSchemes()
    │   ├── chatApi.js                # sendQuestion(), getChatHealth()
    │   ├── documentApi.js            # getDocumentRules(), checkDocument(), getDocHealth()
    │   └── scamApi.js                # analyzeScam(), getScamHealth()
    │
    ├── context/                      # Application state providers
    │   ├── AuthContext.jsx           # user, token, login(), logout(), isAuthenticated
    │   └── ProfileContext.jsx        # profile, hasProfile, reloadProfile(), isProfileLoading
    │
    ├── components/                   # Reusable atomic & layout components
    │   ├── layout/
    │   │   ├── Navbar.jsx            # Responsive navigation bar with auth chips
    │   │   ├── Footer.jsx            # Emergency helplines, portal links, disclaimers
    │   │   └── PageContainer.jsx     # Max-width responsive container wrapper
    │   ├── ui/
    │   │   ├── Button.jsx            # Primary, secondary, outline, accent variants with loading state
    │   │   ├── Badge.jsx             # Saffron, Emerald, Threat, Slate, Info badges
    │   │   ├── Card.jsx              # Elevated, bordered, glassmorphic card wrappers
    │   │   ├── Alert.jsx             # Info, success, warning, danger notification banners
    │   │   ├── Spinner.jsx           # Animated loading spinner indicator
    │   │   └── Modal.jsx             # Accessible accessible modal dialogs
    │   ├── schemes/
    │   │   ├── SchemeCard.jsx        # Scheme presentation card with benefit & deadline
    │   │   ├── EligibilityBadge.jsx  # 100% Eligible vs Criteria Unmet indicator
    │   │   └── DocumentChecklist.jsx # Structured document requirement list
    │   ├── chat/
    │   │   ├── ChatMessage.jsx       # Citizen vs Bot bubble with source citations
    │   │   ├── SourceCard.jsx        # Expandable statutory reference card
    │   │   └── VoiceInput.jsx        # Browser Web Speech API microphone handler
    │   └── common/
    │       ├── HealthIndicator.jsx   # Microservice live ping pill
    │       └── ErrorBoundary.jsx     # React error boundary catching rendering exceptions
    │
    ├── pages/                        # Page-level route views
    │   ├── LandingPage.jsx           # Public home page with hero and 4 pillars
    │   ├── LoginPage.jsx             # Combined login and registration view
    │   ├── DashboardPage.jsx         # Citizen overview and personalized launchpad
    │   ├── FindSchemesPage.jsx       # Eligibility match engine results
    │   ├── AllSchemesPage.jsx        # Public 20-scheme searchable catalog
    │   ├── SchemeDetailPage.jsx      # In-depth scheme guidelines & document requirements
    │   ├── KnowYourRightsPage.jsx    # Statutory Q&A chatbot with source citations
    │   ├── DocumentDoctorPage.jsx    # Document pre-verification against 30 dataset rules
    │   ├── ScamShieldPage.jsx        # SMS / message threat detection
    │   ├── ProfilePage.jsx           # Citizen demographic and socioeconomic profile editor
    │   └── NotFoundPage.jsx          # 404 error page with navigation fallback
    │
    └── utils/                        # Pure utility functions
        ├── formatters.js             # Currency (INR), date, age formatters
        ├── speechRecognition.js      # Browser Web Speech API helper
        └── validation.js             # Client-side form validation rules
```

---

## 2. Comprehensive Frontend-to-Backend Integration Mapping

| Page & UI Component | User Action | Gateway Endpoint & Method | Request Parameters / Body | Expected Response Fields | Relevant AIML Service | Loading & Error Handling | Backend Verification Status |
|---|---|---|---|---|---|---|:---:|
| **Landing Page**<br>`HealthIndicator` | Page load | `GET /api/health` | None | `{ status: "success", message }` | Node.js Gateway | Shows green dot if online; grey if offline. Non-blocking. | **VERIFIED (Active)** |
| **Login Page**<br>Registration Form | Clicks "Create Account" | `POST /api/auth/register` | `{ name, email, password }` | `{ status: "success", user: { id, name, email } }` | SQLite `users` table | Spinner on button. Shows 400 for short passwords, 409 for duplicate emails. | **VERIFIED (16/16 Tests Passed)** |
| **Login Page**<br>Sign In Form | Clicks "Sign In" | `POST /api/auth/login` | `{ email, password }` | `{ status: "success", token, user }` | SQLite `users` table | Disables inputs. On 401, shows "Invalid email or password." | **VERIFIED (16/16 Tests Passed)** |
| **Profile Page**<br>Profile Form | Page mount | `GET /api/profile` | Header: `Authorization: Bearer <token>` | `{ status: "success", profile: { ... } }` | SQLite `profiles` table | Skeleton loader during fetch. If null, pre-fills empty form. | **VERIFIED (Active)** |
| **Profile Page**<br>Save Button | Clicks "Save Profile" | `POST /api/profile` or `PUT /api/profile` | Header: `Authorization: Bearer <token>`<br>Body: `{ age, gender, annual_income, category, state, ... }` | `{ status: "success", message, profile }` | SQLite `profiles` table | Validates age (1-120), income (>= 0). Shows success toast banner. | **VERIFIED (Active)** |
| **All Schemes Page**<br>Schemes Grid | Page mount | `GET /api/schemes` | None | `{ status: "success", count: 20, data: [...] }` | SQLite `schemes` table | Grid skeleton cards. Fast client-side search by text and category filter. | **VERIFIED (Active)** |
| **Scheme Detail Page**<br>Overview | Route `/schemes/:id` | `GET /api/schemes/:id` | Path param `:id` | `{ status: "success", data: { scheme_id, scheme_name, structured_documents, application_info, verification_info } }` | SQLite `schemes` table | Spinner while fetching. If 404, shows "Scheme not found" banner. | **VERIFIED (Active)** |
| **Scheme Detail Page**<br>Doc Checklist | Checklist tab | `GET /api/schemes/:id/documents` | Path param `:id` | `{ status: "success", scheme_id, documents: [...], unavailable_message, verification_warning }` | `backend/services/documentService.js` | Itemized document cards with category tags and official portal guidance. | **VERIFIED (Active)** |
| **Find Schemes Page**<br>Scoreboard | Page mount | `GET /api/schemes/matched` | Header: `Authorization: Bearer <token>` | `{ status: "success", has_profile, citizen, summary, matched_count, schemes: [...] }` | `backend/services/eligibilityService.js` | If `has_profile: false`, prompts to complete profile. Shows matched criteria. | **VERIFIED (Active)** |
| **Legal Rights Chat**<br>Health Pill | Page mount | `GET /api/chat/health` | None | `{ status: "success", rag_service: { status: "healthy", loaded_rights, loaded_documents } }` | Port 8001 RAG Chatbot | Green badge if port 8001 healthy; warning if offline. | **VERIFIED (Active)** |
| **Legal Rights Chat**<br>Send Button | Submits question | `POST /api/chat` | Body: `{ question, language }` (2-1000 chars) | `{ status: "success", is_mock, answer, language, sources: [...], suggested_questions: [...] }` | Port 8001 RAG Chatbot (`data_loader.py`) | Typing indicator. 10s timeout guard (returns 504). Rejects > 1000 chars. | **VERIFIED (44/44 Tests Passed)** |
| **Scam Shield Page**<br>Analyze Button | Submits text/URL | `POST /api/scam/analyze` | Body: `{ message_text, url }` (2-5000 chars) | `{ status: "success", is_mock, risk_level, scam_type, confidence_score, warning_signs, recommended_actions, disclaimer }` | Port 8003 Scam Shield (`analyzer.py`) | Analyzing radar animation. Rejects > 5000 chars. Returns risk badge. | **VERIFIED (10/10 Tests Passed)** |
| **Document Doctor**<br>Rules Catalog | Page mount | `GET /api/documents/rules` | None | `{ status: "success", count: 30, rules: [...] }` | Port 8002 Document Doctor (`rules_engine.py`) | Populates document selector dropdown with official certificate names. | **VERIFIED (30 Rules Loaded)** |
| **Document Doctor**<br>Check Button | Clicks "Check" | `POST /api/documents/check` | Body: `{ document_type, document_name, file_name, file_size_kb, user_notes }` | `{ status: "success", is_mock, rule_id, extracted_fields, validation_checks, common_errors_to_check, warnings, corrective_action }` | Port 8002 Document Doctor | File size inspected client-side (max 5 MB). Returns validity checklist. | **VERIFIED (Active)** |

---

## 3. Architecture & Integration Gaps Analysis

Before beginning frontend development, note these verified engineering realities:

### Gap 1: Demo Mode vs Live API Mode
- *Finding:* The prior frontend prototype defaulted to `isDemoMode = true` in `client.js`, serving hardcoded JSON fallbacks and masking real backend states.
- *Resolution:* In the new frontend, remove mock fallbacks. All requests must go directly to the verified Node.js backend (`VITE_API_BASE_URL=http://localhost:3000`). If a service is offline, display authentic error states.

### Gap 2: Document File Upload Protocol
- *Finding:* `POST /api/documents/check` accepts **JSON metadata** (`file_name`, `file_size_kb`, `document_type`, `document_name`, `user_notes`), not binary `multipart/form-data`.
- *Resolution:* When a citizen drops a PDF or image into the frontend upload box, the frontend should:
  1. Inspect `file.name` and verify extension (`.pdf`, `.jpg`, `.jpeg`, `.png`).
  2. Inspect `file.size` (convert bytes to KB, verify `<= 5120 KB`).
  3. Send this metadata as JSON to `/api/documents/check`.
  4. Avoid sending raw multipart binary until the AIML team provides a dedicated OCR ingestion endpoint.

### Gap 3: Multilingual Voice Input vs Multilingual AI Responses
- *Finding:* The RAG Chatbot currently returns English text even if `"language": "Hindi"` or `"language": "Kannada"` is sent.
- *Resolution:* 
  1. **Voice Input:** Implement using browser-native `SpeechRecognition` / `webkitSpeechRecognition`. Transcribe spoken audio into the text input client-side.
  2. **Language Selector:** Display clearly with an informational tag: *"Response text generated in English with statutory citations. Indic language translation will be enabled in Phase 2."*

### Gap 4: Scheme Category & Keyword Filtering
- *Finding:* `GET /api/schemes` returns all 20 schemes without query param pagination or category filtering on the backend.
- *Resolution:* Because the catalog is compact (20 schemes, ~22 KB JSON payload), fetch the full list once and execute instant, responsive client-side searching, sorting, and category filtering in React.

---

## 4. Staged Implementation Roadmap

```
+-------------------------------------------------------------------------------+
| PHASE 1: CORE FOUNDATION & DESIGN SYSTEM                                      |
| - Initialize Vite React application with clean folder structure               |
| - Implement DESIGN.md design tokens in index.css (Ashoka Blue, Saffron, Slate)|
| - Build shared Navbar, Footer, PageContainer, Card, Button, Badge components   |
| - Configure shared api/client.js with error handling & token persistence      |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| PHASE 2: AUTHENTICATION & CITIZEN PROFILE FLOW                                |
| - Build AuthContext & ProfileContext                                          |
| - Build LoginPage (Sign In / Register tabs) connecting to /api/auth/*         |
| - Build ProfilePage with demographic fields and live validation               |
| - Test token lifecycle (2h TTL, logout, protected route redirects)           |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| PHASE 3: SCHEME DISCOVERY & ELIGIBILITY ENGINE                                |
| - Build AllSchemesPage with real-time text search and category filter pills   |
| - Build SchemeDetailPage with enriched parameters and structured documents   |
| - Build FindSchemesPage connecting to /api/schemes/matched                    |
| - Implement match scoreboard, eligibility pills, and criteria accordions      |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| PHASE 4: SPECIALIZED AI CITIZEN ASSISTANTS                                    |
| - Build KnowYourRightsPage (chat stream, source citations, voice input)       |
| - Build DocumentDoctorPage (dynamic rule selector, metadata pre-check)        |
| - Build ScamShieldPage (SMS paste, sample buttons, risk gauge, actions)       |
| - Add live microservice health indicator badges to all three tool headers     |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| PHASE 5: POLISH, ACCESSIBILITY & END-TO-END VERIFICATION                      |
| - Build LandingPage with hero, live metrics, and quick feature cards          |
| - Add DashboardPage personal launchpad                                        |
| - Run complete test matrix across desktop, tablet, and mobile breakpoints     |
+-------------------------------------------------------------------------------+
```

---

## 5. Verification & Testing Checklist

### 5.1 Completed Verification (Backend Readiness Confirmed)
- [x] Node.js Express syntax and server listen verification (`node server.js` on port 3000).
- [x] JWT authentication issuance, verification, and expiry handling (16/16 tests passed).
- [x] Profile CRUD operations with input validation boundaries (16/16 tests passed).
- [x] Government scheme catalog retrieval (20 schemes verified).
- [x] Server-side eligibility matching engine (evaluated against real demographic fields).
- [x] Know Your Rights RAG gateway and Python service on port 8001 (44/44 tests passed).
- [x] Chatbot input boundaries (rejects empty, whitespace, and questions > 1000 characters).
- [x] Scam Shield gateway and Python service on port 8003 (10/10 tests passed).
- [x] Scam message boundaries (rejects empty, whitespace, and messages > 5000 characters).
- [x] Document Doctor rules endpoint (30 official rules verified on port 8002).
- [x] SQLite database protection (`adhikar.db` untouched, isolated test DB utilized).

### 5.2 Frontend Testing Checklist (To Execute During Build)
- [ ] **Navigation & Routing:**
  - [ ] Unauthenticated visitor can browse `/`, `/schemes`, `/schemes/:id`, `/know-your-rights`, `/scam-shield`, and `/document-doctor`.
  - [ ] Visiting `/find-schemes` or `/profile` while unauthenticated redirects cleanly to `/login?redirect=...`.
  - [ ] Clicking brand logo returns to `/` (unauthenticated) or `/dashboard` (authenticated).
- [ ] **Authentication & Session:**
  - [ ] Registering with existing email displays `409 Conflict` message without crash.
  - [ ] Logging in stores JWT in `localStorage`; page refresh maintains logged-in state.
  - [ ] Logging out purges token, resets citizen profile state, and redirects to `/`.
- [ ] **Scheme Catalog & Matching:**
  - [ ] Search input instantly filters scheme titles and provider names without lag.
  - [ ] Clicking "Check Required Documents" on a scheme opens structured checklist.
  - [ ] Citizen with incomplete profile visiting `/find-schemes` is prompted to complete profile.
  - [ ] Eligible citizen sees green match percentage and itemized criteria reasons.
- [ ] **AI Microservice Interactions:**
  - [ ] Chatbot streams user question, shows loading state, and renders statutory citations.
  - [ ] Chatbot rejects queries > 1000 characters with inline warning before submission.
  - [ ] Voice input records speech and populates chat input on supported browsers.
  - [ ] Scam Shield displays Red high-risk badge for electricity disconnection SMS.
  - [ ] Document Doctor correctly passes file name and size in KB to `/api/documents/check`.
- [ ] **Responsive & Accessibility:**
  - [ ] Mobile hamburger menu opens and navigates smoothly on viewport width 375px.
  - [ ] Color contrast for all text meets WCAG AA standards (minimum 4.5:1 ratio).
  - [ ] Forms are fully navigable via `Tab`, `Enter`, and screen readers.
