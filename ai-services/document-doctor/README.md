# AdhikarAI — Document Doctor Service

This is an independent Python FastAPI microservice providing document pre-validation, required fields checking, and error prevention for citizen scheme applications. It is grounded in `document_doctor_dataset.csv` (30 official rules).

## Port & Endpoints
- **Port:** `8002`
- **Health Check:** `GET http://localhost:8002/api/health`
- **Rules Index:** `GET http://localhost:8002/api/rules`
- **Document Check:** `POST http://localhost:8002/api/documents/check`

## Request Format
```json
{
  "scheme_id": "GOV001",
  "document_type": "Identity proof",
  "document_name": "Aadhaar",
  "file_name": "my_aadhaar.pdf",
  "file_size_kb": 240,
  "user_notes": "Checking for scholarship upload"
}
```

## Response Format
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
    "date of birth or year of birth": "Detected & Readable (Demo Extraction)",
    "gender": "Detected & Readable (Demo Extraction)",
    "address": "Detected & Readable (Demo Extraction)",
    "photograph": "Detected & Readable (Demo Extraction)",
    "QR code": "Detected & Readable (Demo Extraction)"
  },
  "missing_or_unreadable": [],
  "possible_mismatches": [
    "Check for: name spelling differs from other documents"
  ],
  "validation_checks": [
    "Exactly 12 numeric digits",
    "first digit not 0 or 1",
    "Verhoeff checksum passes",
    "name matches application",
    "photograph is clearly visible"
  ],
  "common_errors_to_check": [
    "Typos or spaces in the number",
    "name spelling differs from other documents",
    "outdated address",
    "cropped or blacked-out QR code"
  ],
  "warnings": [
    "Carefully verify: Typos or spaces in the number"
  ],
  "corrective_action": "Update demographic details through myAadhaar portal or an Aadhaar enrolment centre; re-download e-Aadhaar PDF with valid digital signature",
  "source_url": "https://uidai.gov.in/",
  "disclaimer": "This is a demonstration analysis based on official validation rules in our dataset. This service does NOT guarantee authenticity or official acceptance by government authorities."
}
```

## How to Run in Windows PowerShell

Open a new PowerShell terminal:

```powershell
# Navigate to the service folder
cd c:\Users\DELL\Desktop\adhikar-practice\ai-services\document-doctor

# Create and activate virtual environment (optional)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the service on port 8002
uvicorn main:app --host 127.0.0.1 --port 8002 --reload
```

Test the health check in your browser or with PowerShell:
```powershell
curl http://127.0.0.1:8002/api/health
```
