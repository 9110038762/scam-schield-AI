"""
ScamShield AI - Risk Engine and Explainable AI Reasoning
Computes the Scam Risk Score (0-100) and compiles transparent explanations.

Scoring Formula:
  Risk Score = 0.70 * (model_probability * 100) + 0.30 * indicator_score
  Normalized and bounded to [0, 100].

Risk Levels:
  - 0 - 24:   LOW (Safe / Normal)
  - 25 - 49:  MEDIUM (Caution Advised)
  - 50 - 74:  HIGH (Probable Threat)
  - 75 - 100: CRITICAL (Severe Threat)
"""

from typing import List, Dict, Any, Tuple

def compute_risk_score(model_scam_probability: float, indicator_score: int, prediction: str) -> Tuple[int, str]:
    """
    Computes transparent risk score between 0 and 100.
    model_scam_probability: float in [0.0, 1.0]
    indicator_score: int in [0, 100]
    """
    prob_scaled = model_scam_probability * 100.0
    combined = (0.70 * prob_scaled) + (0.30 * float(indicator_score))

    # If predicted SAFE, keep risk in low bounds unless indicators are detected
    if prediction == "SAFE":
        risk_score = min(int(round(combined)), 35)
        risk_score = max(risk_score, int(round(prob_scaled * 0.5)))
    else:
        # If predicted SCAM, ensure it reflects elevated threat
        risk_score = max(int(round(combined)), 50)
        risk_score = min(risk_score, 100)

    # Resolve risk level
    if risk_score >= 75:
        risk_level = "CRITICAL"
    elif risk_score >= 50:
        risk_level = "HIGH"
    elif risk_score >= 25:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return risk_score, risk_level

def generate_explanation(prediction: str, indicators: List[Dict[str, str]], category: str) -> List[str]:
    """Compiles clear, transparent reasoning for the prediction."""
    if prediction == "SAFE":
        if not indicators:
            return [
                "No suspicious scam indicators or coercive patterns were detected in this message.",
                "The language and structure appear typical of benign communication."
            ]
        else:
            return [
                "The message contains minor conversational keywords, but the overall contextual structure is classified as safe.",
                "Exercise general caution if the sender is unfamiliar."
            ]

    reasons = []
    indicator_names = [ind["name"] if isinstance(ind, dict) else str(ind) for ind in indicators]

    if "Digital Arrest Extortion" in indicator_names:
        reasons.append("Attempts digital arrest coercion by demanding persistent video monitoring and claiming false legal authority.")
    if "Blackmail / Coercion" in indicator_names:
        reasons.append("Uses extortion threats involving personal data, videos, or reputation damage.")
    if "OTP Request" in indicator_names:
        reasons.append("Explicitly requests authentication credentials (OTP / PIN) which legitimate organizations never ask for.")
    if "UPI / QR Payment Request" in indicator_names:
        reasons.append("Prompts direct digital payments or QR code transfers under suspicious pretenses.")
    if "KYC Verification Urgency" in indicator_names or "Account Blocking Threat" in indicator_names:
        reasons.append("Creates artificial urgency by threatening imminent account suspension or banking closure.")
    if "Police / Legal Impersonation" in indicator_names or "Bank Impersonation" in indicator_names:
        reasons.append("Impersonates an institutional authority figure (police, bank, or government) to compel compliance.")
    if "Suspicious URL / Link" in indicator_names:
        reasons.append("Includes external links directing to unverified websites or counterfeit portals.")
    if "Lottery / Prize Bait" in indicator_names or "Fake Job Offer" in indicator_names:
        reasons.append("Entices the recipient with unsolicited financial rewards, fake jobs, or unearned winnings.")
    if "Courier / Customs Hold" in indicator_names:
        reasons.append("Claims a detained parcel or customs violation requiring clearance fee transfers.")

    if not reasons:
        reasons.append(f"The text exhibits high statistical similarity to confirmed fraud cases in the {category.replace('_', ' ').title()} category.")
        reasons.append("The NLP model identified suspicious phrasing commonly associated with social engineering.")

    return reasons

def generate_recommendation(prediction: str, risk_level: str) -> str:
    """Actionable safety recommendation for the user."""
    if prediction == "SAFE":
        return "✓ Safe Communication: No immediate threats identified. Always verify unexpected payment requests through official channels."

    if risk_level == "CRITICAL":
        return "🚨 CRITICAL THREAT: Do NOT share OTPs, PINs, or credentials. Do NOT send money. Disconnect immediately. If someone claims to be police or CBI placing you under 'digital arrest', hang up and report directly to cybercrime.gov.in (National Cyber Crime Helpline: 1930)."
    elif risk_level == "HIGH":
        return "⚠ HIGH RISK: Do NOT click links or initiate payments. Verify the contact through the official bank or service website directly, not numbers provided in the message."
    else:
        return "⚠ SUSPICIOUS ACTIVITY: Exercise caution. Confirm the sender's identity through trusted alternative channels before taking action."
