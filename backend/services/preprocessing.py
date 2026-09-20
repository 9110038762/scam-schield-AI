"""
ScamShield AI - Preprocessing Service
Cleans input text, normalizes Unicode, masks sensitive PII,
and classifies language (English, Hindi, Hinglish, Other).
"""

import re
import unicodedata

HINGLISH_MARKERS = {
    "aap", "aapka", "aapki", "aapke", "hum", "mera", "meri", "mere", "tum",
    "karo", "karein", "karna", "hoga", "hogi", "hoge", "hai", "hain", "tha",
    "thi", "the", "nahi", "nhi", "raha", "rahi", "rahe", "gaya", "gayi", "beta",
    "bhai", "sir", "madam", "paise", "rupaye", "kripya", "jaldi", "abhi",
    "dhyan", "de", "do", "dena", "liye", "saath", "par", "se", "ko", "ka",
    "ki", "ke", "kuch", "sab", "yeh", "woh", "unka", "apna", "khata", "aadhaar",
    "band", "chalu", "police", "thana", "darwaza", "khol", "aaya", "aayi"
}

def clean_text(text: str) -> str:
    """Preprocesses text while preserving critical fraud indicators."""
    if not isinstance(text, str):
        return ""
    text = unicodedata.normalize("NFKC", text)
    # Remove HTML tags if present
    text = re.sub(r"<[^>]+>", " ", text)
    # Mask Indian 10-digit mobile numbers
    text = re.sub(r"(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}", "[PHONE_NUMBER]", text)
    # Mask emails
    text = re.sub(r"[\w\.-]+@[\w\.-]+\.\w+", "[EMAIL_ADDRESS]", text)
    # Mask 12-digit Aadhaar
    text = re.sub(r"\b\d{4}\s\d{4}\s\d{4}\b", "[AADHAAR_NUMBER]", text)
    # Mask raw numeric OTPs following trigger words
    text = re.sub(r"(?i)\b(otp|code|pin)\s*(?:is|:)?\s*(\d{4,6})\b", r"\1 [OTP_CODE]", text)
    # Normalize whitespaces
    text = re.sub(r"\s+", " ", text).strip()
    return text

def detect_language(text: str) -> str:
    """Classifies language into English, Hindi, Hinglish, or Other."""
    if not text:
        return "English"
    # Devanagari script detection
    if re.search(r"[\u0900-\u097F]", text):
        return "Hindi"

    words = set(re.findall(r"\b[a-zA-Z]+\b", text.lower()))
    overlap = words.intersection(HINGLISH_MARKERS)
    if len(overlap) >= 2 or (len(words) > 0 and len(overlap) / max(len(words), 1) > 0.15):
        return "Hinglish"

    if any(c.isalpha() for c in text):
        return "English"

    return "Other"
