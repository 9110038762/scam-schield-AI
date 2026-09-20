# ScamShield AI — Model Architecture & Technical Documentation

## 1. System Overview
ScamShield AI employs a hierarchical, multi-tiered inference pipeline designed to balance sub-millisecond throughput with deep contextual understanding for both text messages and multi-turn call transcripts.

```
Incoming Message / Call Transcript
                 │
                 ▼
      Preprocessing & Sanitization
  (PII Masking, NFKC Normalization)
                 │
                 ▼
       Inference Engine Tier
   ├── DistilBERT (Fine-Tuned Transformer) [Primary]
   ├── Linear SVM (Calibrated Probability)
   ├── Logistic Regression (Balanced TF-IDF) [Baseline]
   └── Multinomial Naive Bayes
                 │
                 ▼
       Binary Class & Probability
           (SCAM / SAFE, P_scam)
                 │
                 ▼
      17-Class Taxonomy Classifier
  (DIGITAL_ARREST, KYC_FRAUD, OTP_FRAUD...)
                 │
                 ▼
    Suspicious Indicator Detection
   (Weighted Pattern Scoring: 0-100)
                 │
                 ▼
        Scam Risk Score Engine
  Risk = 0.70 × (P_scam × 100) + 0.30 × Ind_Score
                 │
                 ▼
     Explainable AI (XAI) Output
(Risk Level, Confidence, Reasons, Advice)
```

---

## 2. Machine Learning Baseline Architectures

### 2.1 Feature Extraction: TF-IDF Vectorization
- **Feature Space:** Word n-grams: (1, 2)
- **Vocabulary Size:** Max 10,000 features
- **Sublinear Term Frequency Scaling:** $w = 1 + \log(\text{tf})$
- **Punctuation & Accents:** Stripped via Unicode standardization

### 2.2 Logistic Regression Baseline
- **Optimization Objective:** L2-regularized Cross-Entropy Loss
- **Solver:** L-BFGS
- **Class Weights:** Balanced inverse frequency ($w_c = \frac{N}{2 \cdot N_c}$)
- **Max Iterations:** 1,000
- **Probability Output:** Sigmoid activation:
  $$P(\text{SCAM} \mid \mathbf{x}) = \frac{1}{1 + e^{-(\mathbf{w}^T \mathbf{x} + b)}}$$

### 2.3 Multinomial Naive Bayes
- **Prior Distribution:** Empirical class frequencies
- **Smoothing Parameter ($\alpha$):** 0.1 (Lidstone smoothing)
- **Probability Estimation:**
  $$P(y \mid \mathbf{x}) \propto P(y) \prod_{i=1}^n P(x_i \mid y)^{x_i}$$

### 2.4 Calibrated Linear SVM
- **Base Classifier:** Support Vector Classifier with Hinge Loss
- **Calibration Method:** 3-fold Platt scaling (`CalibratedClassifierCV`) to yield well-calibrated posterior probabilities.

---

## 3. Improved Model: DistilBERT Transformer

### 3.1 Architecture Specifications
- **Base Model:** `distilbert-base-uncased`
- **Layers:** 6 Transformer encoder blocks
- **Hidden Dimension ($d_{\text{model}}$):** 768
- **Attention Heads:** 12
- **Parameters:** ~66 Million
- **Sequence Length:** Truncated and padded to 128 tokens
- **Output Head:** Linear classification layer ($768 \rightarrow 2$) with Cross-Entropy Loss

### 3.2 Fine-Tuning Hyperparameters
- **Optimizer:** AdamW ($\beta_1=0.9, \beta_2=0.999$, weight decay = 0.01)
- **Learning Rate:** $3 \times 10^{-5}$ with Linear Warmup schedule (10% warmup steps)
- **Batch Size:** 32
- **Epochs:** 2 (412 total optimization steps)
- **Hardware Acceleration:** Apple Silicon Metal Performance Shaders (MPS GPU)
- **Evaluation Timing:** Evaluated after each epoch on held-out validation and test sets.

---

## 4. Scam Risk Scoring Engine

The Scam Risk Score is calculated as an explainable index from 0 to 100 rather than an arbitrary raw heuristic:

$$\text{Risk Score} = 0.70 \times \left(P_{\text{SCAM}} \times 100\right) + 0.30 \times \text{IndicatorScore}$$

Where:
- $P_{\text{SCAM}} \in [0.0, 1.0]$ is the calibrated model probability.
- $\text{IndicatorScore} \in [0, 100]$ is the cumulative sum of matched fraud markers capped at 100.

### Risk Level Categorization
- **0 – 24 (LOW):** Benign communication; no coercive signals.
- **25 – 49 (MEDIUM):** Low-confidence indicators; manual verification recommended.
- **50 – 74 (HIGH):** Substantial evidence of financial deception or phishing.
- **75 – 100 (CRITICAL):** Severe active coercion (e.g., Digital Arrest, OTP theft, account threat).
