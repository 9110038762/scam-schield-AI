# ScamShield AI — Dataset Engineering & Documentation

## 1. Executive Summary
The ScamShield AI unified dataset compiles 21,633 raw communications across international baseline spam, Indian telecom fraud, Hinglish financial scams, and cybercrime call dialogue transcripts. Through systematic Unicode standardization, entity masking, and exact duplicate elimination, the corpus yields **8,233 unique records** without data leakage across training (6,586), validation (823), and test (824) partitions.

---

## 2. Ingestion Sources & Attribution

### 2.1 UCI SMS Spam Collection
- **Source:** University of California, Irvine (UCI) Machine Learning Repository
- **Authors:** Tiago A. Almeida and José María Gómez Hidalgo (2011)
- **License:** CC BY 4.0
- **Size:** 5,574 SMS messages (Ham: 4,827, Spam: 747)
- **Role:** Foundational baseline for international English mobile spam patterns.

### 2.2 Scam/Spam India Dataset
- **Source:** Hugging Face (`anmolshrivastav/scam-hum-india`)
- **Curator:** Anmol Shrivastav (2024)
- **License:** Apache 2.0
- **Size:** 2,272 records (Ham: 1,377, Spam: 895)
- **Role:** Regional Indian telecom spam, Aadhaar/KYC phishing, UPI fraud, and INR currency terms.
- **Note:** Contains a mixture of organic telecommunication spam and augmented/synthetic variations.

### 2.3 Hinglish & English Financial Scam/Fraud Text Dataset
- **Source:** Hugging Face (`bolewara/hinglish-scam-text-dataset`)
- **Curator:** Bolewara (2024)
- **License:** CC BY 4.0
- **Size:** 3,787 examples (Benign: 0, Scam: 1)
- **Role:** Focus on electricity fraud, loan scams, cashback deception, and code-mixed Hinglish phrases.

### 2.4 Indian Cyber Scam PhoneCall Hinglish Dataset
- **Source:** Hugging Face (`ysangam/Indian_Cyber_Scam_PhoneCall_Hinglish_Dataset`)
- **Curator:** Yash Sangam (2024)
- **License:** Apache 2.0
- **Size:** 10,000 records (Safe: 5,000, Scam: 5,000)
- **Role:** Models call-transcript and conversational dialogue styles, targeting modern threats like digital arrest extortion, police impersonation, and courier/customs fraud.

---

## 3. Data Cleaning & Leakage Prevention Pipeline

```
Raw Repositories (21,633 lines)
         │
         ▼
Standardize Unicode NFKC & Clean HTML
         │
         ▼
Mask PII (Phone numbers, Aadhaar IDs, Emails, Raw OTP codes)
         │
         ▼
Preserve Core Keywords (₹, INR, OTP, UPI, KYC, PAN, Bank)
         │
         ▼
Exact Duplicate Elimination (13,383 duplicate rows dropped)
         │
         ▼
Cleaned Unique Corpus (8,233 records)
         │
         ▼
Stratified Partitioning (Random Seed = 42)
  ├── Training (80%): 6,586 records
  ├── Validation (10%): 823 records
  └── Test (10%): 824 records
```

---

## 4. Empirical Statistical Breakdown

### 4.1 Class Distribution
- **SCAM:** 2,203 samples (26.76%)
- **SAFE:** 6,030 samples (73.24%)
- **Total Unique:** 8,233 samples

### 4.2 Language Distribution
- **English:** 7,340 samples (89.15%)
- **Hinglish:** 884 samples (10.74%)
- **Other / Hindi:** 9 samples (0.11%)

### 4.3 Category Distribution (17-Class Taxonomy)
1. `SAFE`: 6,030
2. `OTHER_SCAM`: 992
3. `DIGITAL_ARREST`: 402
4. `PHISHING`: 242
5. `BLACKMAIL`: 126
6. `LOTTERY_SCAM`: 124
7. `KYC_FRAUD`: 80
8. `OTP_FRAUD`: 61
9. `REFUND_SCAM`: 57
10. `BANK_FRAUD`: 38
11. `UPI_FRAUD`: 31
12. `IMPERSONATION`: 21
13. `COURIER_SCAM`: 18
14. `JOB_SCAM`: 5
15. `ELECTRICITY_SCAM`: 5
16. `THREAT`: 1
17. `LOAN_SCAM`: Supported in inference rule engine

### 4.4 Category Provenance Tracking
To ensure complete transparency, every record tracks how its category was derived:
- `default_safe`: 6,030 (Classified SAFE)
- `fallback_other`: 992 (SCAM lacking unambiguous categorical markers)
- `mapped`: 633 (Directly mapped from source dataset annotations)
- `inferred`: 578 (Determined via validated keyword/regex evidence)
