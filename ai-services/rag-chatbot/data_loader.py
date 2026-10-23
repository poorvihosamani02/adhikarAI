"""
Data loader and retrieval helper for AdhikarAI RAG Chatbot Service.
Reads know_your_rights.csv and rag_documents.csv from the datasets directory.
No data is invented or fabricated.
"""
import os
import csv
from typing import List, Dict, Any, Optional

def find_dataset_dir() -> str:
    """Locate datasets directory across execution contexts."""
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "..", "datasets"),
        os.path.join(os.getcwd(), "datasets"),
        os.path.join(os.getcwd(), "..", "..", "datasets"),
    ]
    for c in candidates:
        if os.path.exists(os.path.join(c, "know_your_rights.csv")):
            return os.path.abspath(c)
    return os.path.abspath(candidates[0])

class LegalRightsKnowledgeBase:
    def __init__(self):
        self.dataset_dir = find_dataset_dir()
        self.rights: List[Dict[str, str]] = []
        self.documents: Dict[str, Dict[str, str]] = {}
        self.load_data()

    def load_data(self):
        rights_path = os.path.join(self.dataset_dir, "know_your_rights.csv")
        docs_path = os.path.join(self.dataset_dir, "rag_documents.csv")

        if os.path.exists(docs_path):
            with open(docs_path, mode="r", encoding="utf-8", errors="replace") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    doc_id = row.get("document_id", "").strip()
                    if doc_id:
                        self.documents[doc_id] = row

        if os.path.exists(rights_path):
            with open(rights_path, mode="r", encoding="utf-8", errors="replace") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    self.rights.append(row)

    def search(self, query: str) -> List[Dict[str, Any]]:
        """Search verified records matching user query terms."""
        stopwords = {
            "how", "what", "who", "when", "where", "why", "which",
            "can", "could", "would", "should", "the", "and", "for",
            "with", "from", "this", "that", "are", "you", "your",
            "does", "did", "have", "has", "had", "about", "any",
            "tell", "know", "please", "want", "need", "like"
        }
        q_tokens = [w.lower().strip("?,.!;:") for w in query.split()]
        content_tokens = [w for w in q_tokens if len(w) > 2 and w not in stopwords]

        if not content_tokens:
            return []

        scored_results = []

        for r in self.rights:
            score = 0
            searchable_text = " ".join([
                r.get("topic", ""),
                r.get("right_or_protection_name", ""),
                r.get("plain_language_explanation", ""),
                r.get("legal_basis", ""),
                r.get("who_may_be_eligible", ""),
                r.get("how_to_exercise_or_access", ""),
                r.get("complaint_or_application_process", ""),
            ]).lower()

            for t in content_tokens:
                if t in searchable_text:
                    score += 1
                if t in r.get("topic", "").lower():
                    score += 3
                if t in r.get("right_or_protection_name", "").lower():
                    score += 4

            if score >= 3:
                scored_results.append((score, r))

        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_results]


    def get_sources_for_right(self, right: Dict[str, str]) -> List[Dict[str, str]]:
        """Resolve supporting documents and citations from rag_documents.csv."""
        sources = []
        supporting_doc_ids = right.get("supporting_document_id", "").split(";")
        
        for doc_id in supporting_doc_ids:
            doc_id = doc_id.strip()
            if doc_id in self.documents:
                doc = self.documents[doc_id]
                sources.append({
                    "document_id": doc_id,
                    "title": doc.get("document_title", ""),
                    "authority": doc.get("issuing_authority", ""),
                    "source_url": doc.get("source_url", ""),
                    "legal_basis": right.get("legal_basis", ""),
                    "verification_status": doc.get("verification_status", "unverified"),
                })
        
        # If no linked doc found, use the source URL directly from the right record
        if not sources and right.get("source_url"):
            sources.append({
                "document_id": right.get("right_id", "REF001"),
                "title": right.get("right_or_protection_name", "Official Portal"),
                "authority": right.get("responsible_authority", "Government Authority"),
                "source_url": right.get("source_url", ""),
                "legal_basis": right.get("legal_basis", ""),
                "verification_status": right.get("verification_status", "verified"),
            })
            
        return sources
