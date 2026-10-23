# AdhikarAI — Scam Shield Service

This is an independent Python FastAPI microservice providing heuristic fraud detection, pattern matching against verified Indian scam typologies, and citizen protective guidance. It is grounded in `scam_message_dataset.csv` (22 verified records).

## Port & Endpoints
- **Port:** `8003`
- **Health Check:** `GET http://localhost:8003/api/health`
- **Analyze Endpoint:** `POST http://localhost:8003/api/scam/analyze`

## Request Format
```json
{
  "message_text": "Dear Customer, your electricity connection will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Please immediately call 9876543210.",
  "url": "http://power-bill-update.xyz"
}
```

## Response Format
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
    "Suspicious unverified domain extension in link: http://power-bill-update.xyz",
    "Corresponds to verified pattern: Urgent disconnection threat, personal mobile number provided for payment/contact, pressure tactics"
  ],
  "recommended_actions": [
    "Do NOT click any links or download attachments from this message.",
    "Never share your OTP, UPI PIN, banking password, or Aadhaar OTP with anyone.",
    "Do NOT transfer advance fees or registration charges via personal mobile numbers / UPI IDs.",
    "If you lost money or suspect fraud, immediately call the National Cybercrime Helpline at 1930.",
    "Report this message on the National Cyber Crime Reporting Portal: https://cybercrime.gov.in/"
  ],
  "advisory_sources": [
    "https://factcheck.pib.gov.in/",
    "https://cybercrime.gov.in/",
    "https://cms.rbi.org.in/"
  ],
  "disclaimer": "This is an automated educational heuristic tool and does NOT guarantee that any message is 100% safe or fraudulent. Always verify through official channels."
}
```

## How to Run in Windows PowerShell

Open a new PowerShell terminal:

```powershell
# Navigate to the service folder
cd c:\Users\DELL\Desktop\adhikar-practice\ai-services\scam-shield

# Create and activate virtual environment (optional)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the service on port 8003
uvicorn main:app --host 127.0.0.1 --port 8003 --reload
```

Test the health check in your browser or with PowerShell:
```powershell
curl http://127.0.0.1:8003/api/health
```
