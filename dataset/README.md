# ScamShield AI — Unified Scam & Fraud Dataset Corpus

## 1. Overview
The ScamShield AI Dataset is an amalgamated, deduplicated, and normalized benchmark corpus curated specifically for research into telecommunications fraud, Indian cybercrime calls, phishing, OTP harvesting, and Hinglish financial deception.

To maintain strict academic integrity, this dataset does not claim that all data originates from one single uniform source. Instead, it systematically combines four open-access research repositories, implements rigorous preprocessing, eliminates exact duplicate lines to prevent train/test leakage, maps categories into a 17-class taxonomy, and partitions into stratified 80/10/10 splits.

---

## 2. Dataset Sources & Metadata

| Dataset Name | Source Repository | License | Raw Records | Language | Original Labels | Data Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UCI SMS Spam Collection** | [UCI ML Archive (228)](https://archive.ics.uci.edu/dataset/228/sms+spam+collection) | CC BY 4.0 | 5,574 | English | `ham`, `spam` | Real SMS Messages |
| **Scam/Spam India Dataset** | [Hugging Face (`anmolshrivastav/scam-hum-india`)](https://huggingface.co/datasets/anmolshrivastav/scam-hum-india) | Apache 2.0 | 2,272 | English, Hinglish | `ham`, `spam` | Real Indian SMS + Synthetic Augmentations |
| **Hinglish & English Financial Scam Dataset** | [Hugging Face (`bolewara/hinglish-scam-text-dataset`)](https://huggingface.co/datasets/bolewara/hinglish-scam-text-dataset) | CC BY 4.0 | 3,787 | English, Hindi, Hinglish | `0` (benign), `1` (scam) | Curated Financial Fraud SMS/Chat |
| **Indian Cyber Scam PhoneCall Hinglish Dataset** | [Hugging Face (`ysangam/Indian_Cyber_Scam_PhoneCall_Hinglish_Dataset`)](https://huggingface.co/datasets/ysangam/Indian_Cyber_Scam_PhoneCall_Hinglish_Dataset) | Apache 2.0 | 10,000 | Hinglish, Hindi | `0` (safe), `1` (scam) | Call Dialogue Transcripts |

**Total Raw Records Ingested:** 21,633

---

## 3. Data Cleaning, Leakage Prevention & Normalization

### A. Deduplication (Data Leakage Prevention)
Many public spam corpora and synthetic datasets repeat template variants. Simply concatenating raw files introduces severe data leakage where test items exist in the training set.
- **Exact Duplicates Identified and Removed:** 13,383 rows
- **Final Cleaned Unique Corpus Size:** 8,233 records

### B. Label Normalization
All divergent source annotations were mapped to a standard binary label schema:
- `spam` / `scam` / `1` $\rightarrow$ `SCAM` (2,203 samples, 26.76%)
- `ham` / `benign` / `0` $\rightarrow$ `SAFE` (6,030 samples, 73.24%)

### C. Text Normalization & PII Sanitization
- Unicode normalization via `unicodedata.normalize('NFKC')`
- HTML tag stripping and entity normalization (`&amp;` $\rightarrow$ `&`)
- Preservation of domain-critical financial tokens: `₹`, `INR`, `OTP`, `UPI`, `KYC`, `Aadhaar`, `PAN`, `PIN`
- Masking of real-world sensitive entities (10-digit mobile numbers $\rightarrow$ `[PHONE_NUMBER]`, email addresses $\rightarrow$ `[EMAIL_ADDRESS]`, 12-digit Aadhaar $\rightarrow$ `[AADHAAR_NUMBER]`, raw OTP numbers $\rightarrow$ `[OTP_CODE]`)
- Whitespace normalization

### D. Category Taxonomy (17 Classes)
Scam messages are categorized into:
`SAFE`, `BANK_FRAUD`, `OTP_FRAUD`, `UPI_FRAUD`, `KYC_FRAUD`, `JOB_SCAM`, `LOTTERY_SCAM`, `LOAN_SCAM`, `PHISHING`, `IMPERSONATION`, `THREAT`, `REFUND_SCAM`, `ELECTRICITY_SCAM`, `COURIER_SCAM`, `DIGITAL_ARREST`, `BLACKMAIL`, `OTHER_SCAM`.

### E. Language Classification
Classified into:
- **English:** 7,340 samples
- **Hinglish:** 884 samples
- **Other / Hindi:** 9 samples

---

## 4. Train / Validation / Test Splits

The unique 8,233 records are divided using stratified sampling by class (`SCAM` / `SAFE`) with a fixed seed (`42`):
- **Training Set (`dataset/splits/train.csv`):** 6,586 records (80%)
- **Validation Set (`dataset/splits/validation.csv`):** 823 records (10%)
- **Test Set (`dataset/splits/test.csv`):** 824 records (10%)

---

## 5. Known Limitations & Academic Disclaimers
1. **Synthetic / Augmented Artifacts:** Portions of the Indian Scam and PhoneCall datasets were synthesized or templated by their original curators. They model conversational dynamics but are not verbatim wiretaps.
2. **Class Imbalance:** In the natural unique corpus, benign messages outnumber scams roughly 3:1 (73.2% Safe vs 26.8% Scam). Stratified sampling and balanced class weighting were used during training.
3. **Dialect Diversity:** Hinglish spelling is phonetically variable (e.g., `hai` vs `h`, `karo` vs `kro`, `nahi` vs `nhi`). While subword tokenization and character n-grams alleviate this, unstandardized orthography remains a challenge.

---

## 6. Citations & Attribution

1. **Almeida, T. A., & Gómez Hidalgo, J. M. (2011).** SMS Spam Collection. *UCI Machine Learning Repository*. DOI: 10.24432/C5CC84.
2. **Shrivastav, A. (2024).** Scam-Hum-India Dataset. *Hugging Face Datasets*.
3. **Bolewara, R. (2024).** Hinglish & English Financial Scam/Fraud Text Dataset. *Hugging Face Datasets*.
4. **Sangam, Y. (2024).** Indian Cyber Scam PhoneCall Hinglish Dataset. *Hugging Face Datasets*.
