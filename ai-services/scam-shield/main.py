"""
AdhikarAI — Scam Shield Service (FastAPI)
Runs independently on Port 8003.
Analyzes suspicious citizen messages against scam_message_dataset.csv and advisory heuristics.
Transparently labeled as heuristic analysis rather than deep ML model.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from analyzer import ScamAnalyzer

app = FastAPI(
    title="AdhikarAI Scam Shield Service",
    description="Heuristic scam detection and citizen advisory service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = ScamAnalyzer()

class ScamAnalysisRequest(BaseModel):
    message_text: str = Field(..., min_length=2, max_length=5000, description="Suspicious SMS, WhatsApp, or email text")
    url: Optional[str] = Field(None, max_length=1000, description="Optional link contained in message")

class ScamAnalysisResponse(BaseModel):
    status: str
    is_mock: bool
    risk_level: str
    scam_type: str
    confidence_score: float
    matched_patterns: List[str]
    warning_signs: List[str]
    recommended_actions: List[str]
    advisory_sources: List[str]
    disclaimer: str

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "scam-shield",
        "port": 8003,
        "patterns_loaded": len(analyzer.examples)
    }

@app.post("/api/scam/analyze", response_model=ScamAnalysisResponse)
def analyze_scam(req: ScamAnalysisRequest):
    msg = req.message_text.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Message text is required.")

    result = analyzer.analyze(message=msg, url=req.url)

    return ScamAnalysisResponse(
        status="success",
        is_mock=False,
        risk_level=result["risk_level"],
        scam_type=result["scam_type"],
        confidence_score=result["confidence_score"],
        matched_patterns=result["matched_patterns"],
        warning_signs=result["warning_signs"],
        recommended_actions=result["recommended_actions"],
        advisory_sources=result["advisory_sources"],
        disclaimer=result["disclaimer"]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
