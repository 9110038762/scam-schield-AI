import type { AnalysisResult, Indicator, RiskLevel, PredictionType } from '../types';

/**
 * Mock inference service simulating a trained NLP + ML pipeline.
 * In a real production setup, this would make an HTTP request to:
 * POST /predict
 * { "text": "message" }
 */
export function analyzeMessage(text: string): Promise<AnalysisResult> {
  return new Promise((resolve) => {
    // Simulate API network latency (400ms)
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      const detectedIndicators: Indicator[] = [];
      let riskScore = 0;

      // 1. Check for OTP / Pin / Password Requests
      if (/\b(otp|pin|password|passcode|credential|otpcode)\b/.test(lowerText) || lowerText.includes("one time password")) {
        detectedIndicators.push({
          name: "OTP Request",
          description: "Requests a sensitive authentication code or credential."
        });
        riskScore += 35;
      }

      // 2. Check for Account Threats / Suspensions / KYC
      if (
        /\b(block|suspend|close|freeze|deactivate|expire|kyc|verify|verification|disable)\b/.test(lowerText) ||
        lowerText.includes("account blocked") ||
        lowerText.includes("secure your account")
      ) {
        detectedIndicators.push({
          name: "Account Threat",
          description: "Threatens account suspension or block to induce panic."
        });
        riskScore += 30;
      }

      // 3. Check for Urgency Words
      if (/\b(urgent|immediately|now|today|quick|hurry|within)\b/.test(lowerText) || lowerText.includes("immediate action")) {
        detectedIndicators.push({
          name: "Urgent Language",
          description: "Creates pressure for immediate action to bypass thinking."
        });
        riskScore += 20;
      }

      // 4. Check for Reward / Lottery / Win claims
      if (/\b(congratulations|congrats|won|win|winner|reward|prize|lottery|draw|claim|gift|cashback)\b/.test(lowerText) || lowerText.includes("free reward")) {
        detectedIndicators.push({
          name: "Reward Offer",
          description: "Promises financial gains or rewards to entice the victim."
        });
        riskScore += 30;
      }

      // 5. Check for Suspicious Links
      if (lowerText.includes("http") || lowerText.includes("https") || lowerText.includes("www.") || lowerText.includes("click here") || lowerText.includes("link:")) {
        detectedIndicators.push({
          name: "Suspicious URL",
          description: "Contains a link that directs to a potentially fake web portal."
        });
        riskScore += 25;
      }

      // 6. Check for Payment Requests / Wire / Money Transfers
      if (/\b(payment|transfer|wire|rs|money|cash|rupees|upi|gpay|paytm|wallet)\b/.test(lowerText) || lowerText.includes("send money")) {
        detectedIndicators.push({
          name: "Payment Request",
          description: "Asks for direct monetary transfers or financial transactions."
        });
        riskScore += 20;
      }

      // Cap risk score at 100
      riskScore = Math.min(riskScore, 100);

      // Determine prediction and risk level
      let prediction: PredictionType = 'SAFE';
      let riskLevel: RiskLevel = 'LOW';
      let confidence = 0;

      if (riskScore >= 75) {
        prediction = 'SCAM';
        riskLevel = 'CRITICAL';
        confidence = Math.floor(88 + Math.random() * 10); // 88% - 97%
      } else if (riskScore >= 45) {
        prediction = 'SCAM';
        riskLevel = 'HIGH';
        confidence = Math.floor(80 + Math.random() * 12); // 80% - 91%
      } else if (riskScore >= 20) {
        prediction = 'SCAM';
        riskLevel = 'MEDIUM';
        confidence = Math.floor(65 + Math.random() * 15); // 65% - 79%
      } else {
        prediction = 'SAFE';
        riskLevel = 'LOW';
        confidence = Math.floor(85 + Math.random() * 13); // 85% - 97%
        // Adjust risk score to reflect low confidence of scam
        riskScore = Math.max(5, riskScore);
      }

      // Generate recommendation based on classification
      let recommendation = "";
      if (prediction === 'SCAM') {
        recommendation = "⚠ Recommended Action: Do NOT share OTPs, passwords, PINs, or banking credentials. Verify the sender through an official channel before taking any action. Avoid clicking on links in this message.";
      } else {
        recommendation = "✓ Recommended Action: This message appears to be safe. However, always exercise caution if the message sender is unfamiliar or asks for unexpected follow-ups.";
      }

      resolve({
        prediction,
        confidence,
        riskScore,
        riskLevel,
        indicators: detectedIndicators,
        recommendation
      });
    }, 400);
  });
}
