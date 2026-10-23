"""
AdhikarAI — RAG Chatbot Service (FastAPI)
Runs independently on Port 8001.
Retrieves legal rights and citizen guidance from verified datasets (know_your_rights.csv & rag_documents.csv).
Does not hallucinate fake citations or statutory sections.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from data_loader import LegalRightsKnowledgeBase

app = FastAPI(
    title="AdhikarAI RAG Chatbot Service",
    description="Citizen Legal Rights Q&A Service backed by verified legal metadata",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

kb = LegalRightsKnowledgeBase()

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=1000, description="Citizen's legal or scheme query")
    language: Optional[str] = Field("English", max_length=50, description="Preferred response language")

class SourceCitation(BaseModel):
    document_id: str
    title: str
    authority: str
    source_url: str
    legal_basis: Optional[str] = None
    verification_status: Optional[str] = None

class ChatResponse(BaseModel):
    status: str
    is_mock: bool
    answer: str
    language: str
    sources: List[SourceCitation]
    suggested_questions: List[str]

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "rag-chatbot",
        "port": 8001,
        "loaded_rights": len(kb.rights),
        "loaded_documents": len(kb.documents)
    }

@app.post("/api/chat", response_model=ChatResponse)
def handle_chat(req: ChatRequest):
    q = req.question.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    matched = kb.search(q)

    if matched:
        top = matched[0]
        sources = [SourceCitation(**s) for s in kb.get_sources_for_right(top)]
        
        answer_parts = [
            f"**{top.get('right_or_protection_name', '')}**\n",
            f"{top.get('plain_language_explanation', '')}\n",
            f"**Who is eligible:** {top.get('who_may_be_eligible', '')}",
            f"**How to apply or exercise:** {top.get('how_to_exercise_or_access', '')}",
            f"**Authority / Portal:** {top.get('responsible_authority', '')} ({top.get('official_contact_or_portal', '')})"
        ]
        if top.get("conditions_and_exceptions"):
            answer_parts.append(f"**Conditions & Limitations:** {top.get('conditions_and_exceptions')}")
        
        answer_text = "\n\n".join(answer_parts)
    else:
        # Fallback response grounded in known topics without inventing facts
        sources = []
        answer_text = (
            "I could not find a verified match for your specific question in the current starter knowledge base. "
            "Our current verified records cover:\n"
            "1. **RTI Online Application & First Appeals** (Right to Information Act, 2005)\n"
            "2. **Free Legal Aid & Services** (Legal Services Authorities Act, 1987 via NALSA / SLSAs)\n"
            "3. **Reporting Online Financial Fraud** (National Cybercrime Portal & National Helpline 1930)\n\n"
            "Please try asking about one of these topics, or visit the official national portals directly."
        )

    suggested = [
        "How do I file an RTI application online?",
        "Who is eligible for free legal aid under NALSA?",
        "What should I do if I lost money to an online financial fraud?",
        "How do I file an RTI first appeal?"
    ]

    return ChatResponse(
        status="success",
        is_mock=False if matched else True,
        answer=answer_text,
        language=req.language or "English",
        sources=sources,
        suggested_questions=suggested
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
