"""
ScamShield AI - Scam Category Classifier
Classifies confirmed SCAM messages into the 17-class taxonomy.
Uses transparent heuristic patterns grounded in Indian cybercrime classifications.
"""

import re
from typing import Dict, Any

CATEGORY_DESCRIPTIONS = {
    "SAFE": "Normal, legitimate communication.",
    "BANK_FRAUD": "Fake bank representative or fraudulent banking activity.",
    "OTP_FRAUD": "Attempts to harvest OTP, PIN, password, or authentication credentials.",
    "UPI_FRAUD": "Fraud involving UPI collect requests, payment QR codes, or unauthorized transfers.",
    "KYC_FRAUD": "Fake KYC, Aadhaar, or PAN verification and account-suspension threats.",
    "JOB_SCAM": "Deceptive employment opportunities requiring upfront fees or registration.",
    "LOTTERY_SCAM": "Fake lottery, reward, cashback, or lucky draw winnings.",
    "LOAN_SCAM": "Fake pre-approved loans requiring processing fees or dubious verification.",
    "PHISHING": "Deceptive links directing victims to counterfeit credential-harvesting websites.",
    "IMPERSONATION": "Pretending to be police, bank officials, government departments, or couriers.",
    "THREAT": "Intimidation through threats of arrest, service disconnection, or legal prosecution.",
    "REFUND_SCAM": "Fake refund, cashback, or overpayment recovery schemes.",
    "ELECTRICITY_SCAM": "Threats of immediate power disconnection for alleged unpaid bills.",
    "COURIER_SCAM": "Fake parcel or customs hold notices demanding duty or clearance fees.",
    "DIGITAL_ARREST": "Extortion involving fake law enforcement, virtual courts, and forced isolation.",
    "BLACKMAIL": "Coercion through threats of releasing personal media or compromising footage.",
    "OTHER_SCAM": "Uncategorized fraud attempt with identifiable suspicious patterns."
}

def classify_category(text: str, prediction: str, indicators: list) -> Dict[str, str]:
    if prediction == "SAFE":
        return {
            "category": "SAFE",
            "description": CATEGORY_DESCRIPTIONS["SAFE"],
            "confidence_level": "High"
        }

    lower = text.lower()
    indicator_names = {ind["name"] if isinstance(ind, dict) else str(ind) for ind in indicators}

    # Priority 1: High-threat specialized cybercrimes
    if "Digital Arrest Extortion" in indicator_names or any(k in lower for k in ["digital arrest", "skype hearing", "camera on", "virtual arrest", "cbi inquiry"]):
        return {"category": "DIGITAL_ARREST", "description": CATEGORY_DESCRIPTIONS["DIGITAL_ARREST"], "confidence_level": "High"}

    if "Blackmail / Coercion" in indicator_names or any(k in lower for k in ["blackmail", "private video", "personal video", "leak your video", "compromised photos"]):
        return {"category": "BLACKMAIL", "description": CATEGORY_DESCRIPTIONS["BLACKMAIL"], "confidence_level": "High"}

    if any(k in lower for k in ["electricity bill", "power disconnected", "bijli", "electricity officer", "light will be cut"]):
        return {"category": "ELECTRICITY_SCAM", "description": CATEGORY_DESCRIPTIONS["ELECTRICITY_SCAM"], "confidence_level": "High"}

    if "Courier / Customs Hold" in indicator_names or any(k in lower for k in ["parcel", "fedex", "customs clearance", "courier hold", "consignment"]):
        return {"category": "COURIER_SCAM", "description": CATEGORY_DESCRIPTIONS["COURIER_SCAM"], "confidence_level": "High"}

    # Priority 2: Direct Financial Harvesting
    if "OTP Request" in indicator_names:
        return {"category": "OTP_FRAUD", "description": CATEGORY_DESCRIPTIONS["OTP_FRAUD"], "confidence_level": "High"}

    if "UPI / QR Payment Request" in indicator_names or any(k in lower for k in ["upi", "gpay", "phonepe", "paytm", "qr code"]):
        return {"category": "UPI_FRAUD", "description": CATEGORY_DESCRIPTIONS["UPI_FRAUD"], "confidence_level": "High"}

    if "KYC Verification Urgency" in indicator_names or "Aadhaar / PAN Request" in indicator_names or any(k in lower for k in ["kyc", "aadhaar", "pan card"]):
        return {"category": "KYC_FRAUD", "description": CATEGORY_DESCRIPTIONS["KYC_FRAUD"], "confidence_level": "High"}

    if "Fake Job Offer" in indicator_names or any(k in lower for k in ["work from home", "daily salary", "part time job", "earn daily"]):
        return {"category": "JOB_SCAM", "description": CATEGORY_DESCRIPTIONS["JOB_SCAM"], "confidence_level": "High"}

    if "Lottery / Prize Bait" in indicator_names or any(k in lower for k in ["lottery", "congratulations", "winner", "cash prize", "lucky draw"]):
        return {"category": "LOTTERY_SCAM", "description": CATEGORY_DESCRIPTIONS["LOTTERY_SCAM"], "confidence_level": "High"}

    if "Instant Loan Offer" in indicator_names or any(k in lower for k in ["instant loan", "loan approved", "zero interest"]):
        return {"category": "LOAN_SCAM", "description": CATEGORY_DESCRIPTIONS["LOAN_SCAM"], "confidence_level": "High"}

    if "Refund / Cashback Bait" in indicator_names or any(k in lower for k in ["refund", "cashback", "tax rebate"]):
        return {"category": "REFUND_SCAM", "description": CATEGORY_DESCRIPTIONS["REFUND_SCAM"], "confidence_level": "High"}

    if "Police / Legal Impersonation" in indicator_names:
        return {"category": "IMPERSONATION", "description": CATEGORY_DESCRIPTIONS["IMPERSONATION"], "confidence_level": "High"}

    if "Bank Impersonation" in indicator_names or any(k in lower for k in ["bank", "credit card", "debit card", "sbi", "hdfc", "icici"]):
        return {"category": "BANK_FRAUD", "description": CATEGORY_DESCRIPTIONS["BANK_FRAUD"], "confidence_level": "High"}

    if "Threat Language" in indicator_names:
        return {"category": "THREAT", "description": CATEGORY_DESCRIPTIONS["THREAT"], "confidence_level": "Medium"}

    if "Suspicious URL / Link" in indicator_names:
        return {"category": "PHISHING", "description": CATEGORY_DESCRIPTIONS["PHISHING"], "confidence_level": "Medium"}

    return {
        "category": "OTHER_SCAM",
        "description": CATEGORY_DESCRIPTIONS["OTHER_SCAM"],
        "confidence_level": "Medium"
    }
