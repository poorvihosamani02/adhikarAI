"""
AdhikarAI Scam Shield — Pattern Matcher and Heuristic Analyzer.
Uses scam_message_dataset.csv (22 verified records) and expert heuristics.
Does not claim to be a trained deep neural network; implements transparent, explainable heuristic detection.
"""
import os
import csv
import re
from typing import Dict, List, Any, Optional

def find_dataset_dir() -> str:
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "..", "datasets"),
        os.path.join(os.getcwd(), "datasets"),
        os.path.join(os.getcwd(), "..", "..", "datasets"),
    ]
    for c in candidates:
        if os.path.exists(os.path.join(c, "scam_message_dataset.csv")):
            return os.path.abspath(c)
    return os.path.abspath(candidates[0])

class ScamAnalyzer:
    def __init__(self):
        self.dataset_dir = find_dataset_dir()
        self.examples: List[Dict[str, str]] = []
        self.load_dataset()

    def load_dataset(self):
        csv_path = os.path.join(self.dataset_dir, "scam_message_dataset.csv")
        if os.path.exists(csv_path):
            with open(csv_path, mode="r", encoding="utf-8", errors="replace") as f:
                reader = csv.DictReader(f)
                for r in reader:
                    self.examples.append(r)

    def analyze(self, message: str, url: Optional[str] = None) -> Dict[str, Any]:
        text_lower = message.lower()
        url_lower = (url or "").lower()

        # Heuristic rules & red flags
        matched_patterns = []
        warning_signs = []
        recommended_actions = []
        risk_level = "low"
        scam_type = "Unclassified / General Inquiry"
        confidence = 0.50

        # Check for URL embedded in message if not explicitly provided
        extracted_urls = re.findall(r"https?://[^\s]+", message)
        target_url = url_lower or (extracted_urls[0].lower() if extracted_urls else "")

        # 1. Government domain check
        is_official_gov = ".gov.in" in target_url or ".nic.in" in target_url

        # 2. Check similarity against known dataset examples
        best_match = None
        best_score = 0
        words = set(re.findall(r"\w+", text_lower))

        for ex in self.examples:
            ex_words = set(re.findall(r"\w+", ex.get("message_text", "").lower()))
            common = words.intersection(ex_words)
            if len(common) > best_score:
                best_score = len(common)
                best_match = ex

        # 3. Known high-risk patterns
        urgency_terms = ["disconnected tonight", "deactivated in 2 hours", "blocked", "immediate action", "urgent notice", "today only"]
        has_urgency = any(t in text_lower for t in urgency_terms)

        fee_demands = ["registration fee", "processing fee", "send processing", "advance fee", "claim your prize", "lottery"]
        has_fee = any(f in text_lower for f in fee_demands)

        credential_theft = ["update kyc", "pan verification", "yono", "netbanking password", "enter otp"]
        has_cred = any(c in text_lower for c in credential_theft)

        unrealistic_jobs = ["work from home", "earn rs", "like youtube videos", "daily income", "part-time work"]
        has_job_fraud = any(j in text_lower for j in unrealistic_jobs)

        # Evaluate risk level
        if has_urgency:
            warning_signs.append("Artificial urgency or threat of disconnection/blocking")
            matched_patterns.append("Urgency & Coercion Indicator")

        if has_fee:
            warning_signs.append("Demand for upfront registration or processing fee")
            matched_patterns.append("Advance-Fee Fraud Pattern")

        if has_cred:
            warning_signs.append("Request for sensitive credentials, OTP, or KYC verification")
            matched_patterns.append("Phishing / Credential Harvesting Pattern")

        if has_job_fraud:
            warning_signs.append("Unrealistically high payout for low-effort tasks")
            matched_patterns.append("Task / Investment Fraud Pattern")

        if target_url:
            if is_official_gov:
                matched_patterns.append("Official Government Portal Domain (.gov.in / .nic.in)")
            elif any(ext in target_url for ext in [".xyz", ".top", ".club", ".link", "bit.ly", "tinyurl"]):
                warning_signs.append(f"Suspicious unverified domain extension in link: {target_url}")
                matched_patterns.append("Suspicious TLD / Link Shortener")
            else:
                warning_signs.append(f"Non-governmental external link provided: {target_url}")

        # Dataset match influence
        if best_match and best_score >= 4:
            matched_scam_type = best_match.get("scam_type", "")
            matched_label = best_match.get("label", "")
            signs_from_dataset = best_match.get("warning_signs", "")
            
            if matched_label == "scam":
                risk_level = "high"
                scam_type = matched_scam_type
                confidence = min(0.95, 0.70 + (best_score * 0.03))
                if signs_from_dataset:
                    warning_signs.append(f"Corresponds to verified pattern: {signs_from_dataset}")
            elif matched_label == "suspicious":
                risk_level = "medium"
                scam_type = matched_scam_type
                confidence = 0.75
            elif matched_label == "genuine" and not (has_urgency or has_fee or has_cred):
                risk_level = "safe"
                scam_type = "Legitimate Transactional / Official Notice"
                confidence = 0.90
        elif len(warning_signs) >= 2:
            risk_level = "high"
            scam_type = "Likely Phishing or Impersonation Scam"
            confidence = 0.85
        elif len(warning_signs) == 1:
            risk_level = "medium"
            scam_type = "Unverified Suspicious Message"
            confidence = 0.65
        else:
            risk_level = "low" if not is_official_gov else "safe"
            scam_type = "Standard Message (No common scam indicators detected)"
            confidence = 0.70

        # Construct actionable recommendations
        if risk_level in ["high", "medium"]:
            recommended_actions = [
                "Do NOT click any links or download attachments from this message.",
                "Never share your OTP, UPI PIN, banking password, or Aadhaar OTP with anyone.",
                "Do NOT transfer advance fees or registration charges via personal mobile numbers / UPI IDs.",
                "If you lost money or suspect fraud, immediately call the National Cybercrime Helpline at 1930.",
                "Report this message on the National Cyber Crime Reporting Portal: https://cybercrime.gov.in/"
            ]
        else:
            recommended_actions = [
                "Always verify updates directly on official department portals (.gov.in or .nic.in).",
                "Ensure your bank notifications originate from official shortcodes.",
                "Never share passwords or OTPs even for legitimate confirmations."
            ]

        evidence_sources = [
            "https://factcheck.pib.gov.in/",
            "https://cybercrime.gov.in/",
            "https://cms.rbi.org.in/"
        ]

        return {
            "risk_level": risk_level,
            "scam_type": scam_type,
            "confidence_score": round(confidence, 2),
            "matched_patterns": matched_patterns,
            "warning_signs": list(dict.fromkeys(warning_signs)), # Deduplicate
            "recommended_actions": recommended_actions,
            "advisory_sources": evidence_sources,
            "disclaimer": "This is an automated educational heuristic tool and does NOT guarantee that any message is 100% safe or fraudulent. Always verify through official channels."
        }
