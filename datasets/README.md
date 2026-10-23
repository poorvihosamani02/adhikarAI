# AdhikarAI — Datasets Documentation

This directory contains the original research and reference datasets for the **AdhikarAI** citizen services platform.

> **CRITICAL PRESERVATION NOTICE**: All original CSV files in this directory are preserved in their original form. No original dataset files have been modified, renamed, or deleted.

---

## Dataset Overview & Inventory

| Filename | Record Count | Column Count | File Size | Feature Supported | Verification Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `schemes_raw.csv` | 20 records | 25 columns | ~22.7 KB | Scheme Catalogue, Scheme Details, Document Checklist, Profile Eligibility | Needs Review / Partial |
| `document_doctor_dataset.csv` | 30 records | 18 columns | ~31.6 KB | Document Doctor (Field extraction rules, checklists, error detection, corrective actions) | Needs Manual Verification |
| `scam_message_dataset.csv` | 22 records | 9 columns | ~7.8 KB | Scam Shield (Suspicious message patterns, fraud classification, warning signs) | Reviewed (PIB & Advisories) |
| `know_your_rights.csv` | 4 records | 18 columns | ~6.5 KB | Know Your Rights & RAG Chatbot Knowledge Base | Verified (Portal FAQs) & Partial |
| `rag_documents.csv` | 7 records | 22 columns | ~5.8 KB | RAG Chatbot Document Source Index | Starter Metadata / Unextracted |

---

## 1. Schemes Dataset (`schemes_raw.csv`)

### Purpose
Supports the **All Schemes** catalogue, **Scheme Details** view, **Document Checklist**, and preliminary **Find My Schemes** profile eligibility matching.

### Schema & Columns (25 fields)
- `scheme_id`: Unique identifier (e.g., `GOV001` to `GOV020`).
- `scheme_name`: Official title of the scheme (e.g., PM-USP CSSS, PM Kisan, Gruha Lakshmi).
- `provider_type`: Scheme provider classification (`government`).
- `provider_name`: Ministry or department issuing the scheme (e.g., Ministry of Education, MoA&FW).
- `jurisdiction`: Administrative jurisdiction (`central` or `Karnataka`).
- `category`: Domain (`scholarship`, `farmer income support`, `health insurance`, `pension`, `women welfare`, `electricity subsidy`, `unemployment allowance`).
- `benefit_description`: Plain-language explanation of financial or service benefits.
- `benefit_amount`: Monetary benefit value (numeric or partial).
- `benefit_frequency`: Frequency of disbursement (`annual`, `monthly`, `one-time`, etc.).
- `eligibility_text`: Narrative eligibility requirements.
- `min_age`: Minimum eligible age in years.
- `max_age`: Maximum eligible age in years.
- `max_family_income`: Annual household income ceiling in INR.
- `eligible_state`: Specific state restriction (e.g., `Karnataka`, `North Eastern States`).
- `eligible_course`: Eligible educational level or course stream.
- `required_documents`: Semicolon-delimited list of mandatory documents.
- `application_start`: Cycle opening date.
- `application_deadline`: Submission deadline date.
- `application_url`: Official application portal URL.
- `source_url`: Official ministry portal or myScheme URL.
- `guideline_url`: URL to downloadable PDF guidelines.
- `academic_year`: Targeted academic cycle.
- `last_verified`: Date when metadata was last verified.
- `verification_status`: Status (`verified`, `needs_review`).
- `notes`: Research notes, source citations, and caveats.

### Known Limitations & Missing Fields
1. **Empty Dates**: `application_start` (100% missing) and `application_deadline` (100% missing) because government application cycles change seasonally and were not hardcoded.
2. **Missing Documents on Certain Schemes**: 12 of 20 records (60%) lack explicit `required_documents` strings in this initial pass.
3. **Sparse Age Restrictions**: `min_age` (90% missing) and `max_age` (95% missing) are blank for schemes that have educational or occupational criteria rather than age boundaries.
4. **Income Ceiling Gaps**: `max_family_income` is present for 9 schemes (e.g. scholarships, BPL programs) but null for universal or categorical schemes (e.g. Gruha Jyothi, Ayushman Bharat SECC criteria).
5. **No Invented Data Policy**: The frontend and AI adapters honestly display `"Not specified in official record"` or `"Unavailable / not verified"` rather than fabricating deadlines or requirements.

---

## 2. Document Doctor Dataset (`document_doctor_dataset.csv`)

### Purpose
Supports the **Document Doctor** service and checklist validation by defining document types, essential fields to inspect, validation rules, frequent citizen mistakes, and official corrective remedies.

### Schema & Columns (18 fields)
- `rule_id`: Unique rule code (`DD001` to `DD030`).
- `document_type`: Broad category (`Identity proof`, `Income proof`, `Bank proof`, `Domicile proof`, `Caste certificate`, `Education proof`, `Supporting document`).
- `document_name`: Specific document title (e.g., `Aadhaar`, `PAN card`, `Income Certificate`, `Bank Passbook`, `Ration Card`, `10th / SSLC Marksheet`).
- `document_purpose`: Administrative reason the document is collected.
- `related_scheme_or_use_case`: Schemes that routinely require this document.
- `required_fields`: Semicolon-separated list of critical data fields that must be present and legible.
- `validation_rules`: Formats, checksums, validity checks, and visual criteria.
- `common_errors`: Frequent mistakes leading to application rejection.
- `expiry_or_validity_rule`: Document lifespan and re-issuance requirements.
- `accepted_format`: Approved submission format (PDF, clear image, size limits).
- `applicable_state`: Jurisdiction (`India-wide`, `Karnataka`, etc.).
- `issuing_authority`: Government agency responsible for issuance (UIDAI, ITD, Tehsildar, etc.).
- `official_verification_method`: Official government verification portal or app.
- `corrective_action`: Actionable steps for the citizen to rectify defects.
- `source_url`: Official portal link.
- `source_type`: Category of source (`official_portal_homepage`, etc.).
- `verification_status`: Current validation status (`needs_manual_verification`).
- `notes`: Practical caveats (e.g., Aadhaar is proof of identity, not citizenship).

### Known Limitations
- Does not contain raw OCR training images; it functions as a comprehensive knowledge and rulebase for document validation logic and verification guidance.

---

## 3. Scam Message Dataset (`scam_message_dataset.csv`)

### Purpose
Supports the **Scam Shield** service by providing labeled SMS, WhatsApp, Email, and Web messages across common Indian fraud typologies alongside verified legitimate notifications.

### Schema & Columns (9 fields)
- `example_id`: Identifier (`EX001` to `EX022`).
- `message_text`: Exact message copy received by citizens.
- `channel`: Transmission medium (`SMS`, `WhatsApp`, `Email`, `Telegram`, `Web`).
- `label`: Classification label (`scam`, `suspicious`, `genuine`).
- `scam_type`: Fraud typology (`Power Bill Fraud`, `Fake Scholarship`, `KYC Phishing`, `Lottery Scam`, `Tax Refund Phishing`, `Part-time Job Fraud`, `Job Scam`, `Banking Phishing`, `Fake Challan Scam`, `Impersonation / Family Emergency`, `Unverified Logistics`, `None`).
- `warning_signs`: Red flags detected in the message.
- `evidence_url`: Official advisory reference (e.g., `factcheck.pib.gov.in`, official circulars).
- `source_type`: Reference source type (`Official advisory`, `Observed pattern`).
- `review_status`: Editorial status (`reviewed`).

### Known Limitations
- The dataset contains 22 vetted examples (10 scam, 5 suspicious, 7 genuine). It is ideal for heuristic pattern matching, red flag keyword detection, domain verification against `.gov.in` / `.nic.in`, and demo analysis. It is not large enough for training deep neural networks from scratch.

---

## 4. Legal Rights & RAG Datasets (`know_your_rights.csv` & `rag_documents.csv`)

### Purpose
Supports the **Know Your Rights** module and the **RAG Chatbot** knowledge base.

### Schema for `know_your_rights.csv` (18 fields)
- `right_id`: Unique identifier (`RIGHT001` to `RIGHT004`).
- `topic`: Legal domain (`RTI`, `legal_aid`, `cybercrime`).
- `right_or_protection_name`: Name of the right (e.g., *Right to seek information from central public authorities*, *Free legal services under LSA Act 1987*, *Reporting online financial fraud via 1930*).
- `plain_language_explanation`: Citizen-accessible explanation.
- `legal_basis`: Statutory act or rule citation (e.g., *RTI Act 2005*, *Legal Services Authorities Act 1987 Sec 12/13*).
- `who_may_be_eligible`: Target beneficiaries and economic criteria.
- `conditions_and_exceptions`: Inclusions, exemptions, and jurisdictional limits.
- `how_to_exercise_or_access`: Step-by-step citizen instructions.
- `complaint_or_application_process`: Grievance and nodal escalation workflow.
- `responsible_authority`: Designated authority (CPIO, DoPT, NALSA, I4C).
- `official_contact_or_portal`: Authoritative portal link (`rtionline.gov.in`, `nalsa.gov.in`, `cybercrime.gov.in`).
- `jurisdiction`: Central or state scope.
- `language`: Content language (`English`).
- `source_url`: Verifiable reference URL.
- `supporting_document_id`: Foreign key reference to `rag_documents.csv`.
- `last_verified_date`: Date verified.
- `verification_status`: Status (`verified`).
- `notes`: Scope limitations and statutory cautions.

### Schema for `rag_documents.csv` (22 fields)
- Contains document-level metadata for 7 official documents (`DOC001` to `DOC007`).
- Note on status: In accordance with `README_Dataset2.txt`, the original PDF and HTML documents were not downloaded in the original run (`original_documents/` and `extracted_text/` directories are empty; `extraction_status` is `not_started`).
- The RAG demo service uses the structured, verified text from `know_your_rights.csv` and document metadata from `rag_documents.csv` for grounded question answering without hallucinating fake legal citations.

---

## Derived Files & Data Transformation Documentation

To preserve the raw datasets intact while enabling fast, type-safe frontend access and Python service consumption, derived JSON representations are prepared in:
- `frontend/src/data/schemes.json` — Derived strictly from `schemes_raw.csv` with normalized fields, fallback handlers for null values, and numeric conversions.
- `frontend/src/data/documents.json` — Derived strictly from `document_doctor_dataset.csv`.
- `frontend/src/data/scams.json` — Derived strictly from `scam_message_dataset.csv`.
- `frontend/src/data/rights.json` — Derived strictly from `know_your_rights.csv` and `rag_documents.csv`.

No facts, URLs, or criteria were invented or hallucinated during derivation. All derived files mirror the exact contents of the primary source CSV files.
