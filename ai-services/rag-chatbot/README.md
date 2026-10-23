# AdhikarAI — RAG Chatbot Service

This is an independent Python FastAPI microservice providing legal-rights question answering backed by verified legal metadata (`know_your_rights.csv` and `rag_documents.csv`).

## Port & Endpoints
- **Port:** `8001`
- **Health Check:** `GET http://localhost:8001/api/health`
- **Chat Endpoint:** `POST http://localhost:8001/api/chat`

## Request Format
```json
{
  "question": "How do I file an RTI application online?",
  "language": "English"
}
```

## Response Format
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

## How to Run in Windows PowerShell

Open a new PowerShell terminal:

```powershell
# Navigate to the service folder
cd c:\Users\DELL\Desktop\adhikar-practice\ai-services\rag-chatbot

# Create and activate virtual environment (optional but recommended)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the service on port 8001
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

Test the health check in your browser or with PowerShell:
```powershell
curl http://127.0.0.1:8001/api/health
```
