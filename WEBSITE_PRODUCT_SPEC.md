# AdhikarAI — Complete Website Workflow & Product Specification

**Document Version:** 1.0.0  
**Target Platform:** Responsive Multipage Web Application (React + Vite)  
**Intended Backend:** Node.js Express Gateway (`http://localhost:3000`) & Python AIML Services  
**Target Audience:** Indian citizens seeking welfare schemes, legal awareness, document verification, and cyber-scam protection; legal aid volunteers; and CSC (Common Service Centre) operators.

---

## 1. Global Navigation & Layout Architecture

The application enforces a persistent, unified master layout across all pages to ensure approachable, trustworthy citizen navigation.

### 1.1 Global Header (Navbar)
- **Brand Placement:** Left-aligned **AdhikarAI** logo with emblem (Ashoka Blue `#1e3a8a` & Saffron accent `#f97316`). Clicking the brand logo navigates to `/` (Landing Page for unauthenticated visitors) or `/dashboard` (for authenticated citizens).
- **Desktop Navigation Links:**
  - **Find Schemes:** Navigates to `/find-schemes` (if logged in and profile exists) or prompts to complete profile.
  - **All Schemes:** Navigates to `/schemes` (public catalog).
  - **Legal Rights AI:** Navigates to `/know-your-rights`.
  - **Document Doctor:** Navigates to `/document-doctor`.
  - **Scam Shield:** Navigates to `/scam-shield`.
- **Right Action Area (Authentication State Aware):**
  - *When Unauthenticated:*
    - **"Sign In" Button:** Outlined button navigating to `/login`.
    - **"Register" Button:** Solid primary accent button navigating to `/login?tab=register`.
  - *When Authenticated:*
    - **Profile Chip:** Displays user's first name, category badge, and avatar icon; clicking navigates to `/profile`.
    - **Logout Button:** Discards JWT from storage, resets application state, displays a toast notification ("Logged out successfully"), and redirects to `/`.
- **Mobile Responsive Drawer:** Collapsible hamburger menu on viewports `< 768px` containing all navigation links, profile status, and quick language indicator.

### 1.2 Global Footer
- **Section 1 (Citizen Empowerment):** Overview of AdhikarAI's mission—transparent access to welfare entitlements under statutory guidelines.
- **Section 2 (Quick Portals & Emergency Helplines):** Direct links to official portals:
  - National Cyber Crime Portal (Helpline `1930` / `cybercrime.gov.in`)
  - National Legal Services Authority (`nalsa.gov.in`)
  - Central RTI Online (`rtionline.gov.in`)
  - National Scholarship Portal (`scholarships.gov.in`)
- **Section 3 (Compliance & Open Data):** Clear disclaimer stating that AdhikarAI is an independent citizen assistance technology and encourages verification with official government gazettes and ministry portals.

---

## 2. Page-by-Page Specifications

---

### Page 1: Landing / Home Page (`/`)

#### A. Purpose & Target User
Introduces the AdhikarAI platform to new citizens, explains the four core pillars (Schemes, Legal Rights, Document Doctor, Scam Shield), establishes trust, and guides citizens into registration or direct discovery.

#### B. Layout & Major Sections
1. **Hero Section:** High-impact banner with headline: *"Empowering Every Citizen to Claim Their Rights & Entitlements."* Subtitle highlighting AI-assisted scheme matching, legal Q&A, document readiness, and fraud defense.
2. **Key Metric Tickers:** Live counts: 20 Cataloged Schemes, 30 Official Document Rules, 22 Scam Detection Typologies, 100% Free Public Access.
3. **Four Pillars Feature Grid:** Interactive cards for each core module.
4. **How It Works (3 Steps):**
   - Step 1: Tell Us About Yourself (Create a confidential citizen profile).
   - Step 2: Discover Matched Schemes (Rules engine evaluates eligibility without manual guesswork).
   - Step 3: Verify & Apply (Inspect documents and follow direct official application portals).
5. **Trust & Privacy Assurance Banner:** Clarifies that no Aadhaar numbers or banking passwords are ever requested.

#### C. Exact Interactive Elements & Actions
- **Button: "Find My Schemes" (Hero Primary):**
  - *Action:* If authenticated and profile exists, navigates to `/find-schemes`. If authenticated without profile, navigates to `/profile?redirect=find-schemes`. If unauthenticated, navigates to `/login?redirect=find-schemes`.
- **Button: "Browse All 20 Schemes" (Hero Secondary):**
  - *Action:* Navigates directly to `/schemes`. Unauthenticated users can freely browse the full catalog.
- **Card 1: "Know Your Rights AI" -> Button "Ask a Legal Question":**
  - *Action:* Navigates to `/know-your-rights`.
- **Card 2: "Document Doctor" -> Button "Check My Document":**
  - *Action:* Navigates to `/document-doctor`.
- **Card 3: "Scam Shield" -> Button "Verify Suspicious Message":**
  - *Action:* Navigates to `/scam-shield`.

#### D. Backend Integration & Data Sources
- **Backend Endpoints:** None required for static rendering. Optional probe: `GET /api/health` to display live system status indicator.

---

### Page 2: Authentication & Registration Page (`/login`)

#### A. Purpose & Target User
Allows citizens to register with their name, email, and password, or log in to access persistent profile-based scheme recommendations.

#### B. Layout & Major Sections
- Centered, accessible card with dual-tab switcher: **"Sign In"** vs **"Create New Account"**.
- Left side (Desktop): Benefits list (Save profile, get real-time eligibility updates, track document checklists).
- Form container with inline field-level validation and clear error banners.

#### C. Exact Interactive Elements & Actions
- **Tab Switcher:** Toggles between Login and Registration views. Query param `?tab=register` activates registration mode automatically.
- **Registration Form:**
  - *Input:* **Full Name** (text, required).
  - *Input:* **Email Address** (email, required, normalized).
  - *Input:* **Password** (password, required, min 8 characters, toggleable visibility icon).
  - *Button:* **"Create Account"**:
    - *Click Action:* Validates inputs client-side. If valid, sends `POST /api/auth/register`.
    - *Loading State:* Button disabled, shows spinner, text: "Creating Account...".
    - *Success State:* Displays green success banner: "Account created successfully! Please sign in." Automatically switches to Login tab with email prefilled.
    - *Error State:* Displays red alert with API message (e.g., "An account with this email already exists" on 409, or password length warning on 400).
- **Login Form:**
  - *Input:* **Email Address** (email, required).
  - *Input:* **Password** (password, required).
  - *Button:* **"Sign In"**:
    - *Click Action:* Sends `POST /api/auth/login`.
    - *Loading State:* Button disabled, spinner, text: "Authenticating...".
    - *Success State:* Stores `token` in `localStorage` as `adhikar_token` and user object as `adhikar_user`. Updates `AuthContext`. If `?redirect=` param exists, navigates there; otherwise navigates to `/dashboard`.
    - *Error State:* Displays red alert: "Invalid email or password."

#### D. Backend Integration
- **Endpoints:** `POST /api/auth/register`, `POST /api/auth/login`.

---

### Page 3: Citizen Dashboard (`/dashboard`)

#### A. Purpose & Target User
The personalized home base for authenticated citizens. Summarizes profile completeness, matched scheme counts, quick access to AI tools, and recent activity.

#### B. Layout & Major Sections
1. **Welcome Hero Banner:** Personalized greeting: *"Namaste, [Citizen Name]"*. Shows citizen's State, Category, and Profile completeness percentage.
2. **Action Highlights (2 Prominent Buttons):**
   - *"Find My Eligible Schemes"* (Large prominent card with sparkle badge).
   - *"Browse All Government Schemes"* (Secondary search card).
3. **Stat Cards Row (4 Cards):**
   - *Total Cataloged Schemes:* 20 schemes.
   - *Schemes Matched for You:* Calculated from `GET /api/schemes/matched` (or "Complete Profile" if null).
   - *Document Rules Available:* 30 official verification rules.
   - *Scam Patterns Monitored:* 22 cyber-fraud typologies.
4. **Quick Launch AI Tool Cards:**
   - *Document Doctor:* "Inspect scholarship or pension certificates before applying."
   - *Legal Rights AI:* "Ask statutory questions on RTI, NALSA legal aid, and cybercrime."
   - *Scam Shield:* "Paste suspicious electricity disconnection or lottery SMS messages."
5. **Official Verification Notice Banner:** Informs citizen that 19 of 20 cataloged schemes carry `verification_status="needs_review"` and links to official ministry guidelines.

#### C. Exact Interactive Elements & Actions
- **Button: "Find My Schemes":** Navigates to `/find-schemes`.
- **Button: "Complete My Profile":** (Visible if `has_profile: false`) Navigates to `/profile`.
- **Button: "Explore Schemes":** Navigates to `/schemes`.
- **Tool Card Buttons:** Navigate to respective tool pages (`/document-doctor`, `/know-your-rights`, `/scam-shield`).

#### D. Backend Integration
- **Endpoints:**
  - `GET /api/profile` (Authorization required).
  - `GET /api/schemes/matched` (Authorization required; pulls match summary count).

---

### Page 4: Find My Schemes (`/find-schemes`)

#### A. Purpose & Target User
The flagship welfare discovery tool. Evaluates the citizen's actual demographic data against all 20 cataloged schemes using the backend matching engine, displaying matched vs ineligible schemes with transparent explanations.

#### B. Layout & Major Sections
1. **Citizen Evaluation Summary Header:**
   - Displays citizen summary pills: Age, State, Category, Annual Income, BPL status, Education.
   - Edit Profile button to update values in real time.
2. **Match Scoreboard Banner:**
   - Big number: *X Schemes Matched* (out of 20 evaluated).
   - Secondary counts: *Y Ineligible*, *Z Verified Officially*.
3. **Filter & Sort Controls:**
   - Filter by Match Status: "All Evaluated", "Eligible Only (100% Match)", "Ineligible / Unmet Criteria".
   - Filter by Category: All, Education & Scholarships, Agriculture, Social Welfare.
   - Sort by: "Match Percentage (High to Low)", "Benefit Amount (High to Low)".
4. **Scheme Match Cards Grid:**
   - Scheme Title, Provider Ministry, Category Badge, Jurisdiction (Central / Karnataka).
   - **Eligibility Status Pill:** Green `100% ELIGIBLE` or Red `CRITERIA UNMET`.
   - **Benefit Callout:** Prominent amount (e.g. `₹13,500 / Annual`) or non-monetary assistance.
   - **Why You Match (Accordion):** Green checkmarks for each satisfied rule (e.g. *"Annual income ₹1,20,000 <= limit of ₹2,50,000"*).
   - **Unmet Criteria (Accordion):** Red warning icons for failed criteria (e.g. *"Scheme requires Karnataka state residency"*).
   - **Card Action Buttons:**
     - Button: *"View Scheme Details"* (Navigates to `/schemes/:id`).
     - Button: *"Check Required Documents"* (Navigates to `/schemes/:id/documents` or opens checklist drawer).
     - Button: *"Apply on Official Portal"* (External link icon, opens official ministry URL in new tab).

#### C. Empty & Special States
- **State: Profile Not Found (`has_profile: false`):**
  - Shows an illustration and message: *"You have not completed your citizen eligibility profile yet. Please provide your age, state, and category to run the matching engine."*
  - Prominent Action Button: *"Complete Profile Now"* (navigates to `/profile`).
- **State: 0 Schemes Matched:**
  - Shows: *"No schemes currently match all your exact profile criteria. You can browse all 20 schemes or adjust your profile if your circumstances have changed."*
  - Button: *"Browse All Schemes"* (navigates to `/schemes`).

#### D. Backend Integration
- **Endpoint:** `GET /api/schemes/matched` (Authorization: `Bearer <token>`).

---

### Page 5: Browse All Government Schemes (`/schemes`)

#### A. Purpose & Target User
Public directory allowing any citizen, student, or volunteer to explore, search, filter, and review all 20 government schemes in the catalog.

#### B. Layout & Major Sections
1. **Search & Filter Bar:**
   - Full-text search input (filters by scheme name, provider, benefit keywords, or category).
   - Dropdown filter: **Jurisdiction** (All, Central, Karnataka).
   - Dropdown filter: **Category** (All, Education & Scholarships, Social Welfare, Agriculture, etc.).
   - Dropdown filter: **Target Beneficiary** (SC, ST, OBC, Minority, General, BPL).
2. **Active Filter Tags:** Clearable chips for currently selected filters.
3. **Scheme Results Grid (3 Columns on Desktop, 1 on Mobile):**
   - Each card contains:
     - Scheme Name & Provider Ministry.
     - Jurisdiction Badge (Central / Karnataka).
     - Category Badge.
     - Official Verification Status Badge: Verified (Green) vs Needs Review (Orange warning).
     - Benefit summary snippet.
     - Income & Age limit tags.
     - Card Actions: *"View Details"*, *"Document Checklist"*, *"Official Portal"*.
4. **Catalog Disclosures Box:** Explains dataset origin (`schemes_raw.csv`), academic year (2026-2027), and emphasizes verifying deadline dates on official portals.

#### C. Backend Integration
- **Endpoint:** `GET /api/schemes`.
- **Client-Side Filtering:** Fast instant filtering across the 20 schemes by title, provider, and category.

---

### Page 6: Individual Scheme Details & Document Checklist (`/schemes/:id`)

#### A. Purpose & Target User
In-depth single scheme overview providing statutory background, complete eligibility criteria, application windows, and an itemized document checklist.

#### B. Layout & Major Sections
1. **Breadcrumbs:** `Home > Schemes > [Scheme Name]`.
2. **Header Hero:** Scheme title, provider agency, category, and prominent **"Apply on Official Portal"** button.
3. **Verification Status Banner:**
   - If `verification_status="needs_review"`: Amber alert box explaining: *"This scheme record is cataloged from open data and is awaiting official ministry gazette re-verification. Always verify latest deadlines on the official portal."*
4. **Key Parameter Grid:**
   - Benefit Amount & Frequency (e.g. ₹13,500 / Annual).
   - Target Age Range (e.g. 15 to 35 Years).
   - Maximum Family Income (e.g. ₹2,50,000 / Year).
   - Eligible State / Jurisdiction (e.g. All India or Karnataka).
   - Target Course / Education Level.
5. **Detailed Eligibility Text Section:** Full descriptive narrative from the scheme guidelines.
6. **Application Timelines & Links:**
   - Application Start & Deadline dates.
   - Application Portal URL button (opens in new tab).
   - Official Ministry Guideline PDF URL.
7. **Official Required Documents Section:**
   - Displays structured document cards parsed via `parseRequiredDocuments`.
   - Each document shows:
     - Document Name (e.g. "Caste Certificate").
     - Inferred Category (e.g. "Category / Caste Certificate").
     - Guidance Note (e.g. *"Must state official community/caste code matching government notified lists."*).
     - Action: *"Check with Document Doctor"* button (navigates to `/document-doctor?schemeId=SC001&docName=Caste+Certificate`).
8. **Navigation Controls:** *"Back to All Schemes"* button, *"Print / Save Checklist"* button.

#### C. Backend Integration
- **Endpoints:**
  - `GET /api/schemes/:id` (returns enriched scheme details).
  - `GET /api/schemes/:id/documents` (returns structured document checklist).

---

### Page 7: Know Your Rights Legal Chatbot (`/know-your-rights`)

#### A. Purpose & Target User
A specialized legal advisory interface for citizens to ask questions regarding constitutional rights, RTI procedures, NALSA free legal aid entitlements, and cybercrime reporting.

#### B. Layout & Major Sections
1. **Service Connectivity Header:**
   - Live status indicator: Connected to RAG Microservice on Port 8001 (or Warning if offline).
   - **Language Selector Dropdown:** Options: `English`, `Hindi (हिन्दी)`, `Kannada (ಕನ್ನಡ)`. *(Note: Backend echoes selected language; full response translation is pending AIML integration).*
2. **Conversation History Window:**
   - Interactive chat stream with distinct Citizen (right, Ashoka Blue) and AdhikarAI Bot (left, Slate Card) message bubbles.
   - **Assistant Message Format:**
     - Safe markdown parsing (bold statutory acts, numbered procedural steps).
     - **Verified Sources Box:** Displays verified document title, issuing authority, legal basis (e.g. *Legal Services Authorities Act, 1987 (Section 12)*), and official source URL link.
     - **Disclaimer Pill:** If query was out of dataset scope, shows: *"Starter Knowledge Base Match Unavailable (Zero Hallucination Guarantee)"*.
3. **Suggested Questions Carousel / Pills:**
   - Quick-tap prompts:
     - *"How do I file an RTI application online?"*
     - *"Who qualifies for free legal aid under NALSA?"*
     - *"How do I report online financial fraud to 1930?"*
     - *"What is the time limit for an RTI reply?"*
4. **Input Control Bar:**
   - Textarea / input field with placeholder: *"Ask about RTI procedures, NALSA legal aid, or cyber fraud reporting..."*.
   - **Character Counter:** Shows `X / 1000` characters. Turns amber at 900, red at 1000.
   - **Voice Input Button (Microphone Icon):** Uses browser `webkitSpeechRecognition` / `SpeechRecognition` API where supported. Listening indicator (pulsing red dot) transcribes spoken words into the input field.
   - **Send Button (Paper Plane Icon):** Submits question to gateway.
5. **Knowledge Base Coverage Disclosure:** Bottom accordion listing the exact legal acts currently loaded in `know_your_rights.csv` and `rag_documents.csv`.

#### C. Exact Interactive Elements & Actions
- **Clicking a Suggested Question:** Immediately populates and submits the query.
- **Voice Button Click:** Requests microphone permission. If granted, streams speech to text. If unsupported in browser, displays toast: *"Voice input is not supported in this browser. Please type your query."*
- **Send Button Click:**
  - Validates `trimmedQuestion.length >= 2` and `<= 1000`.
  - Appends user message to state.
  - Displays animated "AdhikarAI is consulting verified statutory datasets..." loading indicator.
  - Sends `POST /api/chat` with `{ "question": ..., "language": ... }`.
  - On 200 OK: Appends bot response, updates sources, and refreshes suggested follow-up questions.
  - On 503/504 Error: Appends friendly error bubble with "Retry" button.

#### D. Backend Integration
- **Endpoints:** `GET /api/chat/health`, `POST /api/chat`.

---

### Page 8: Document Doctor (`/document-doctor`)

#### A. Purpose & Target User
Assists citizens in verifying required documents before applying for schemes, detecting common omissions (expired financial year certificates, missing Tahsildar seals, blurred acknowledgment numbers) based on 30 dataset rules.

#### B. Layout & Major Sections
1. **Header & Microservice Status:**
   - Connection status pill: Connected to Document Doctor AI (Port 8002).
   - Subtitle: *"Pre-verify your certificates against official government acceptance rules."*
2. **Two-Step Pre-Verification Form:**
   - **Step 1: Document Selection:**
     - Dropdown: **Target Scheme** (Optional, pre-fills from URL query `?schemeId=`).
     - Dropdown: **Document Type & Name** (Dynamically populated from `GET /api/documents/rules`, e.g. "Aadhaar Card", "Income Certificate", "Ration Card", "Caste Certificate").
     - Shows selected rule's Issuing Authority and Document Purpose.
   - **Step 2: Upload Simulation & Metadata:**
     - Drag-and-drop file zone supporting `.pdf`, `.jpg`, `.jpeg`, `.png` up to 5 MB.
     - Displays selected file name, size in KB/MB, and file icon.
     - Input: **Citizen Notes / Observations** (Optional text, e.g. "Issued last year by Tahsildar Bangalore North").
   - **Action Button: "Run Pre-Verification Check":**
     - Submits JSON metadata to `POST /api/documents/check`.
3. **Analysis Results Display Panel:**
   - **Rule Match Header:** Rule ID (e.g. `RULE_002`), Document Name, Issuing Authority.
   - **Accepted Format & Expiry Rules:** Explicit validity duration (e.g. *"Valid for 1 financial year"*).
   - **Validation Checklist Card:** Green checkmarks for criteria the certificate must satisfy.
   - **Common Pitfalls & Errors Card:** Amber alert icons warning against known rejection reasons (e.g. *"Submitting previous financial year certificate"*).
   - **Extracted Fields Demonstration Card:** Visual mockup showing detected metadata.
   - **Official Verification Link:** Direct link to state portal (e.g. Nadakacheri portal for Karnataka certificates) to verify barcode/acknowledgment.
   - **Disclaimer Banner:** Explicitly states analysis is heuristic pre-verification based on `document_doctor_dataset.csv`.

#### C. Backend Integration
- **Endpoints:**
  - `GET /api/documents/health`
  - `GET /api/documents/rules` (Loads 30 official rules)
  - `POST /api/documents/check` (Evaluates upload metadata)

---

### Page 9: Scam Shield (`/scam-shield`)

#### A. Purpose & Target User
Protects citizens from cyber-fraud by analyzing suspicious SMS messages, WhatsApp notices, electricity disconnection threats, fake scholarship links, and fraudulent lottery claims against 22 known fraud patterns.

#### B. Layout & Major Sections
1. **Header & Emergency Helpline Banner:**
   - Prominent red alert strip: *"Victim of financial fraud? Call the National Cyber Crime Helpline at 1930 immediately or visit cybercrime.gov.in."*
2. **Input Workspace:**
   - Textarea: **Suspicious Message Text** (Required, placeholder: *"Paste SMS, WhatsApp message, or email here..."*). Character counter (`X / 5000`).
   - Input: **Suspicious URL / Link** (Optional, placeholder: *"http://... or bit.ly link mentioned in message"*).
   - **Sample Message Buttons (Quick Test):**
     - Button: *"Sample 1: Electricity Disconnection Threat"*
     - Button: *"Sample 2: Fake PM Scholarship APK"*
     - Button: *"Sample 3: Legitimate Government Notification (.gov.in)"*
   - Button: **"Analyze Message with Scam Shield"**: Solid primary button with shield icon.
3. **Analysis Output Card (Rendered upon response):**
   - **Risk Gauge / Badge:**
     - High Risk (Red): `HIGH RISK FRAUD DETECTED`
     - Suspicious (Amber): `SUSPICIOUS / UNVERIFIED`
     - Safe (Green): `OFFICIAL / LOW RISK`
   - **Scam Typology Title:** (e.g. "Power Bill Fraud / Immediate Disconnection Scam").
   - **Confidence Score:** Percentage bar (e.g. `95% Confidence`).
   - **Warning Signs Identified (List):** Itemized breakdown of red flags (e.g. *"Urgent deadline threat"*, *"Personal 10-digit mobile number instead of official DISCOM"*).
   - **Recommended Citizen Actions:** Clear step-by-step protective instructions.
   - **Advisory Sources:** Links to official advisories.
   - **Educational Heuristic Disclaimer:** Mandatory transparency statement.

#### C. Backend Integration
- **Endpoints:** `GET /api/scam/health`, `POST /api/scam/analyze`.

---

### Page 10: Citizen Profile & Preferences (`/profile`)

#### A. Purpose & Target User
Allows authenticated citizens to view, update, and manage their demographic and socioeconomic criteria, which powers the eligibility engine in Find My Schemes.

#### B. Layout & Major Sections
1. **Account Overview Card:** Displays Name, Email Address, Account Created Date.
2. **Demographic & Eligibility Form:**
   - *Row 1:* **Age** (Number, 1–120) & **Gender** (Dropdown: Male, Female, Other).
   - *Row 2:* **State of Residence** (Dropdown of Indian States & UTs, with Karnataka clearly selectable).
   - *Row 3:* **Social Category** (Dropdown: General, SC, ST, OBC, Minority).
   - *Row 4:* **Annual Family Income (₹)** (Number input with comma formatting preview).
   - *Row 5:* **Education Level** (Dropdown: Secondary, Higher Secondary, Undergraduate, Postgraduate, Diploma) & **Current Course** (Text).
   - *Row 6:* **Occupation** (Dropdown: Student, Farmer, Construction Worker, Artisan, Unemployed, Other).
   - *Row 7 (Special Flags):*
     - Checkbox / Toggle: **"Belongs to Religious / Linguistic Minority Community"**.
     - Checkbox / Toggle: **"Belongs to Below Poverty Line (BPL) Household"**.
3. **Form Actions:**
   - Button: **"Save Profile"** (Submits `POST /api/profile`).
   - Button: **"Save & Find My Schemes"** (Saves profile and navigates directly to `/find-schemes`).
4. **Privacy & Security Guarantee Box:** Explains that profile data is stored exclusively in the local database to evaluate scheme eligibility rules and is never shared with third parties.

#### C. Backend Integration
- **Endpoints:**
  - `GET /api/profile` (Loads existing profile on mount).
  - `POST /api/profile` or `PUT /api/profile` (Upserts citizen profile).

---

## 3. Complete User Journeys & End-to-End Scenarios

### Journey A: The Scholarship Seeker (Student)
1. Student lands on `/`, clicks **"Browse All 20 Schemes"**.
2. Filters by Category: *"Education & Scholarships"*. Selects *"Post-Matric Scholarship for SC Students (SC001)"*.
3. Reviews scheme details at `/schemes/SC001`. Sees the checklist requiring an *Income Certificate* and *Caste Certificate*.
4. Clicks **"Check with Document Doctor"**. Page routes to `/document-doctor?schemeId=SC001&docName=Income+Certificate`.
5. Uploads certificate PDF, reviews validity rules, discovers Karnataka certificates must be verified on Nadakacheri portal.
6. Clicks **"Create Account"**, registers, inputs profile (SC, Karnataka, ₹1,20,000 income).
7. Navigates to `/find-schemes`, confirms 100% eligibility match, and clicks the official portal link to apply.

### Journey B: The Scam Target (Senior Citizen / Citizen)
1. Citizen receives an SMS: *"Your electricity will be disconnected tonight at 9:30 PM. Call 9876543210."*
2. Citizen navigates to `/scam-shield`.
3. Pastes the message into the textarea, clicks **"Analyze Message with Scam Shield"**.
4. Gateway calls `POST /api/scam/analyze`.
5. Results screen renders Red `HIGH RISK` badge (95% confidence score, "Power Bill Fraud").
6. Citizen reads warning signs, follows recommended actions (do not call the number, verify on state DISCOM portal), and avoids losing funds.

### Journey C: The Rights Inquirer (Citizen / Activist)
1. Citizen wants to know how to appeal an unanswered RTI request.
2. Navigates to `/know-your-rights`.
3. Selects language or uses microphone button to ask: *"What is the procedure for an RTI first appeal?"*.
4. Gateway validates input and proxies to port 8001.
5. Bot returns detailed statutory instructions under Section 19(1) of the RTI Act, 2005, complete with DoPT citation links and DoPT document IDs. Zero hallucinations.
