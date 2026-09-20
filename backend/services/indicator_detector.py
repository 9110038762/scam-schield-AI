"""
ScamShield AI - Suspicious Indicator Detection Service
Detects fine-grained fraud markers with weights for the Risk Engine.
"""

import re
from typing import List, Dict, Tuple

INDICATOR_RULES = [
    {
        "name": "OTP Request",
        "description": "Requests one-time password, PIN, or verification passcode.",
        "weight": 20,
        "pattern": r"(?i)\b(otp|one time password|pin|passcode|secret code|verification code|share otp|send otp)\b"
    },
    {
        "name": "UPI / QR Payment Request",
        "description": "Requests direct digital payment, UPI collect, or QR scanning.",
        "weight": 18,
        "pattern": r"(?i)\b(upi|gpay|phonepe|paytm|bhim|qr code|scan qr|collect request|send money)\b"
    },
    {
        "name": "KYC Verification Urgency",
        "description": "Prompts immediate KYC completion to avoid penalties.",
        "weight": 16,
        "pattern": r"(?i)\b(kyc|update kyc|kyc expired|complete kyc|submit kyc|kyc verification)\b"
    },
    {
        "name": "Aadhaar / PAN Request",
        "description": "Asks for sensitive national identification credentials.",
        "weight": 15,
        "pattern": r"(?i)\b(aadhaar|pan card|pan number|identity verification|link pan|link aadhaar)\b"
    },
    {
        "name": "Bank Impersonation",
        "description": "Claims to represent a reputable banking or financial institution.",
        "weight": 16,
        "pattern": r"(?i)\b(sbi|hdfc|icici|axis bank|pnb|reserve bank|rbi|bank manager|credit card department|customer support)\b"
    },
    {
        "name": "Police / Legal Impersonation",
        "description": "Claims to be law enforcement, police inspector, or crime branch official.",
        "weight": 20,
        "pattern": r"(?i)\b(police|cbi|crime branch|cyber crime|customs|inspector|court order|arrest warrant|thana)\b"
    },
    {
        "name": "Government Official Impersonation",
        "description": "Pretends to represent an authorized government agency.",
        "weight": 18,
        "pattern": r"(?i)\b(income tax|trai|ministry|enforcement directorate|ed department|government notice)\b"
    },
    {
        "name": "Urgent Language",
        "description": "Induces urgency or fear to pressure immediate victim compliance.",
        "weight": 12,
        "pattern": r"(?i)\b(urgent|immediately|within 24 hours|today only|last chance|act now|hurry|jaldi|abhi)\b"
    },
    {
        "name": "Account Blocking Threat",
        "description": "Threatens freezing, deactivating, or closing victim's account.",
        "weight": 18,
        "pattern": r"(?i)\b(blocked|suspended|deactivated|frozen|close your account|service disconnected|sim blocked)\b"
    },
    {
        "name": "Threat Language",
        "description": "Uses intimidation, legal punishment, or heavy fines.",
        "weight": 16,
        "pattern": r"(?i)\b(legal action|jail|penalized|penalty|fine of rs|case registered|fir lodged|severe punishment)\b"
    },
    {
        "name": "Money / Fee Demand",
        "description": "Demands upfront payment, clearance charge, or processing fee.",
        "weight": 15,
        "pattern": r"(?i)\b(transfer rs|pay rs|processing fee|clearance charge|security deposit|registration charge)\b"
    },
    {
        "name": "Suspicious URL / Link",
        "description": "Contains an external link directing to an unverified web domain.",
        "weight": 14,
        "pattern": r"(?i)(https?://[^\s]+|www\.[^\s]+|bit\.ly/[^\s]+|tinyurl\.com/[^\s]+|click here|link:)"
    },
    {
        "name": "Lottery / Prize Bait",
        "description": "Claims victim has won an unearned sum of money or reward.",
        "weight": 16,
        "pattern": r"(?i)\b(congratulations|you won|winner|lucky draw|cash prize|jackpot|reward of rs|free gift)\b"
    },
    {
        "name": "Fake Job Offer",
        "description": "Promises high daily income with minimal work or registration fee.",
        "weight": 15,
        "pattern": r"(?i)\b(work from home|part time job|daily earning|earn 5000 daily|job vacancy|hiring immediately)\b"
    },
    {
        "name": "Instant Loan Offer",
        "description": "Offers pre-approved loans with no documentation or upfront fees.",
        "weight": 14,
        "pattern": r"(?i)\b(loan approved|instant loan|zero percent loan|pre-approved personal loan|disbursement)\b"
    },
    {
        "name": "Refund / Cashback Bait",
        "description": "Lures victim with pending refunds or accidental overpayments.",
        "weight": 14,
        "pattern": r"(?i)\b(refund approved|cashback pending|claim refund|tax rebate|money returned)\b"
    },
    {
        "name": "Courier / Customs Hold",
        "description": "Claims an international parcel is held for illegal items or customs duty.",
        "weight": 18,
        "pattern": r"(?i)\b(parcel on hold|customs duty|fedex consignment|illegal drugs in parcel|courier detained)\b"
    },
    {
        "name": "Digital Arrest Extortion",
        "description": "Claims victim is placed under digital house arrest on video call.",
        "weight": 25,
        "pattern": r"(?i)\b(digital arrest|keep camera on|do not disconnect call|virtual hearing|skype interrogation)\b"
    },
    {
        "name": "Blackmail / Coercion",
        "description": "Threatens to release personal or compromising materials.",
        "weight": 22,
        "pattern": r"(?i)\b(blackmail|private video|leak photos|send to contacts|compromising video|reputation)\b"
    }
]

def detect_indicators(text: str) -> Tuple[List[Dict[str, str]], int]:
    """
    Returns (detected_indicators_list, total_indicator_score)
    Total indicator score is capped at 100.
    """
    detected = []
    total_score = 0

    for rule in INDICATOR_RULES:
        if re.search(rule["pattern"], text):
            detected.append({
                "name": rule["name"],
                "description": rule["description"]
            })
            total_score += rule["weight"]

    # Cap indicator score at 100
    total_score = min(total_score, 100)
    return detected, total_score
