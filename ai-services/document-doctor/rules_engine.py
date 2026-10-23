"""
Rules engine for AdhikarAI Document Doctor Service.
Reads document_doctor_dataset.csv containing 30 verified Indian document rules.
Maps document types, required fields, validation rules, common errors, and corrective remedies.
"""
import os
import csv
from typing import Dict, List, Any, Optional

def find_dataset_dir() -> str:
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "..", "datasets"),
        os.path.join(os.getcwd(), "datasets"),
        os.path.join(os.getcwd(), "..", "..", "datasets"),
    ]
    for c in candidates:
        if os.path.exists(os.path.join(c, "document_doctor_dataset.csv")):
            return os.path.abspath(c)
    return os.path.abspath(candidates[0])

class DocumentRulesEngine:
    def __init__(self):
        self.dataset_dir = find_dataset_dir()
        self.rules: List[Dict[str, str]] = []
        self.load_rules()

    def load_rules(self):
        csv_path = os.path.join(self.dataset_dir, "document_doctor_dataset.csv")
        if os.path.exists(csv_path):
            with open(csv_path, mode="r", encoding="utf-8", errors="replace") as f:
                reader = csv.DictReader(f)
                for r in reader:
                    self.rules.append(r)

    def find_rule(self, doc_name: str, doc_type: str = "") -> Optional[Dict[str, str]]:
        """Find matching rule by document name or type."""
        d_name_clean = doc_name.strip().lower()
        d_type_clean = doc_type.strip().lower()

        # 1. Exact or substring match on document_name
        for r in self.rules:
            r_name = r.get("document_name", "").lower()
            if d_name_clean and (d_name_clean in r_name or r_name in d_name_clean):
                return r

        # 2. Fallback match on document_type
        for r in self.rules:
            r_type = r.get("document_type", "").lower()
            if d_type_clean and (d_type_clean in r_type or r_type in d_type_clean):
                return r

        # 3. Default fallback to first rule (Aadhaar) if available
        return self.rules[0] if self.rules else None

    def analyze_document(
        self,
        doc_name: str,
        doc_type: str = "",
        scheme_id: str = "",
        file_name: str = "",
        file_size_kb: float = 0.0,
        user_notes: str = ""
    ) -> Dict[str, Any]:
        rule = self.find_rule(doc_name, doc_type)
        if not rule:
            return {
                "status": "error",
                "message": "No validation rule found for specified document."
            }

        req_fields = [f.strip() for f in rule.get("required_fields", "").split(";") if f.strip()]
        val_rules = [v.strip() for v in rule.get("validation_rules", "").split(";") if v.strip()]
        common_errs = [e.strip() for e in rule.get("common_errors", "").split(";") if e.strip()]
        
        # Build structured demo analysis based on rule
        extracted_info = {}
        missing_or_unreadable = []
        possible_mismatches = []
        warnings = []

        for field in req_fields:
            extracted_info[field] = "Detected & Readable (Demo Extraction)"

        # Introduce realistic checklist flags based on common errors for demonstration
        if common_errs:
            warnings.append(f"Carefully verify: {common_errs[0]}")
            if len(common_errs) > 1:
                possible_mismatches.append(f"Check for: {common_errs[1]}")

        # Check format if file provided
        accepted_fmt = rule.get("accepted_format", "PDF / Image")
        if file_name:
            ext = file_name.split(".")[-1].lower() if "." in file_name else ""
            if ext not in ["pdf", "jpg", "jpeg", "png"]:
                warnings.append(f"File extension '.{ext}' might not match portal criteria. Recommended: {accepted_fmt}")

        return {
            "rule_id": rule.get("rule_id", ""),
            "document_name": rule.get("document_name", doc_name),
            "document_type": rule.get("document_type", doc_type),
            "document_purpose": rule.get("document_purpose", ""),
            "issuing_authority": rule.get("issuing_authority", "Official Authority"),
            "official_verification_method": rule.get("official_verification_method", "Official Portal"),
            "accepted_format": accepted_fmt,
            "expiry_or_validity_rule": rule.get("expiry_or_validity_rule", "Not specified"),
            "extracted_fields": extracted_info,
            "missing_or_unreadable": missing_or_unreadable,
            "possible_mismatches": possible_mismatches,
            "validation_checks": val_rules,
            "common_errors_to_check": common_errs,
            "warnings": warnings,
            "corrective_action": rule.get("corrective_action", "Verify with issuing authority."),
            "source_url": rule.get("source_url", ""),
            "disclaimer": "This is a demonstration analysis based on official validation rules in our dataset. This service does NOT guarantee authenticity or official acceptance by government authorities."
        }
