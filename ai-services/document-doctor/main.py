"""
AdhikarAI — Document Doctor Service (FastAPI)
Runs independently on Port 8002.
Validates uploaded citizen documents against 30 official rules from document_doctor_dataset.csv.
Clearly labeled as demo analysis with transparent disclaimers.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from rules_engine import DocumentRulesEngine

app = FastAPI(
    title="AdhikarAI Document Doctor Service",
    description="Document validation and error prevention service for scheme applications",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = DocumentRulesEngine()

class DocumentCheckRequest(BaseModel):
    scheme_id: Optional[str] = Field(None, description="Optional associated scheme ID (e.g. GOV001)")
    document_type: str = Field(..., min_length=2, description="Broad document category (e.g. Identity proof, Income proof)")
    document_name: str = Field(..., min_length=2, description="Specific document name (e.g. Aadhaar, Income Certificate)")
    file_name: Optional[str] = Field("sample_document.pdf", description="Uploaded filename for format checking")
    file_size_kb: Optional[float] = Field(150.0, description="File size in kilobytes")
    user_notes: Optional[str] = Field(None, description="Citizen notes or application specifics")

class DocumentCheckResponse(BaseModel):
    status: str
    is_mock: bool
    rule_id: str
    document_name: str
    document_type: str
    document_purpose: str
    issuing_authority: str
    official_verification_method: str
    accepted_format: str
    expiry_or_validity_rule: str
    extracted_fields: Dict[str, str]
    missing_or_unreadable: List[str]
    possible_mismatches: List[str]
    validation_checks: List[str]
    common_errors_to_check: List[str]
    warnings: List[str]
    corrective_action: str
    source_url: str
    disclaimer: str

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "document-doctor",
        "port": 8002,
        "rules_loaded": len(engine.rules)
    }

@app.get("/api/rules")
def get_available_rules():
    """List available document types and names for user selection."""
    return [
        {
            "rule_id": r.get("rule_id"),
            "document_name": r.get("document_name"),
            "document_type": r.get("document_type"),
            "issuing_authority": r.get("issuing_authority")
        }
        for r in engine.rules
    ]

@app.post("/api/documents/check", response_model=DocumentCheckResponse)
def check_document(req: DocumentCheckRequest):
    if not req.document_name.strip():
        raise HTTPException(status_code=400, detail="Document name is required.")

    result = engine.analyze_document(
        doc_name=req.document_name,
        doc_type=req.document_type,
        scheme_id=req.scheme_id or "",
        file_name=req.file_name or "",
        file_size_kb=req.file_size_kb or 0.0,
        user_notes=req.user_notes or ""
    )

    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result.get("message"))

    return DocumentCheckResponse(
        status="success",
        is_mock=True,
        rule_id=result.get("rule_id", "N/A"),
        document_name=result.get("document_name", req.document_name),
        document_type=result.get("document_type", req.document_type),
        document_purpose=result.get("document_purpose", ""),
        issuing_authority=result.get("issuing_authority", "Official Authority"),
        official_verification_method=result.get("official_verification_method", "Official Portal"),
        accepted_format=result.get("accepted_format", "PDF / Image"),
        expiry_or_validity_rule=result.get("expiry_or_validity_rule", "Not specified"),
        extracted_fields=result.get("extracted_fields", {}),
        missing_or_unreadable=result.get("missing_or_unreadable", []),
        possible_mismatches=result.get("possible_mismatches", []),
        validation_checks=result.get("validation_checks", []),
        common_errors_to_check=result.get("common_errors_to_check", []),
        warnings=result.get("warnings", []),
        corrective_action=result.get("corrective_action", ""),
        source_url=result.get("source_url", ""),
        disclaimer=result.get("disclaimer", "")
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
