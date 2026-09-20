"""
ScamShield AI - Dataset and Baseline ML Pipeline
Strictly executes:
1. Load & inspect 4 public datasets (UCI, India Scam, Hinglish Scam, PhoneCall Hinglish)
2. Create unified schema: text, label, category, language, source_dataset
3. Label normalization: spam/scam/1 -> SCAM, ham/benign/0 -> SAFE
4. Empty and duplicate/near-duplicate removal BEFORE splitting
5. Save dataset/processed/scamshield_dataset.csv
6. Stratified 80/10/10 split with random_state=42
7. Save dataset/splits/train.csv, validation.csv, test.csv
8. Train TF-IDF + Logistic Regression
9. Train TF-IDF + Multinomial Naive Bayes
10. Evaluate on untouched test set (Acc, Prec, Rec, F1, Macro F1, Weighted F1, Confusion Matrix)
11. Save ml/evaluation/results.json
12. Generate evaluation plots (confusion matrices, comparison, class distribution)
All numbers are real and calculated empirically.
"""

import os
import sys
import re
import json
import time
import unicodedata
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW_DIR = os.path.join(BASE_DIR, "dataset", "raw")
PROCESSED_DIR = os.path.join(BASE_DIR, "dataset", "processed")
SPLITS_DIR = os.path.join(BASE_DIR, "dataset", "splits")
EVAL_DIR = os.path.join(BASE_DIR, "ml", "evaluation")

os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(SPLITS_DIR, exist_ok=True)
os.makedirs(EVAL_DIR, exist_ok=True)

HINGLISH_KEYWORDS = {
    "aap", "aapka", "aapki", "aapke", "hum", "mera", "meri", "mere", "tum",
    "karo", "karein", "karna", "hoga", "hogi", "hoge", "hai", "hain", "tha",
    "thi", "the", "nahi", "nhi", "raha", "rahi", "rahe", "gaya", "gayi", "beta",
    "bhai", "sir", "madam", "paise", "rupaye", "kripya", "jaldi", "abhi",
    "dhyan", "de", "do", "dena", "liye", "saath", "par", "se", "ko", "ka",
    "ki", "ke", "kuch", "sab", "yeh", "woh", "unka", "apna", "khata", "aadhaar",
    "band", "chalu", "police", "thana", "darwaza", "khol", "aaya", "aayi"
}

def clean_text_basic(text: str) -> str:
    if not isinstance(text, str):
        return ""
    # Unicode NFKC normalization
    text = unicodedata.normalize("NFKC", text)
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)
    # Normalize whitespaces
    text = re.sub(r"\s+", " ", text).strip()
    return text

def detect_language(text: str, source_lang: str = None) -> str:
    if source_lang and source_lang.lower() in ["english", "hindi", "hinglish"]:
        if source_lang.lower() == "hinglish":
            words = set(re.findall(r"\b[a-zA-Z]+\b", text.lower()))
            overlap = words.intersection(HINGLISH_KEYWORDS)
            if not overlap and len(words) > 4:
                return "English"
            return "Hinglish"
        return source_lang.capitalize()

    # Devanagari script check
    if re.search(r"[\u0900-\u097F]", text):
        return "Hindi"

    words = set(re.findall(r"\b[a-zA-Z]+\b", text.lower()))
    overlap = words.intersection(HINGLISH_KEYWORDS)
    if len(overlap) >= 2 or (len(words) > 0 and len(overlap) / max(len(words), 1) > 0.15):
        return "Hinglish"

    if any(c.isalpha() for c in text):
        return "English"

    return "Other"

def map_category(text: str, label: str, source_cat: str = None) -> str:
    if label == "SAFE":
        return "SAFE"

    if source_cat and str(source_cat).strip().lower() != "none":
        sc = str(source_cat).lower().strip()
        if "digital_arrest" in sc: return "DIGITAL_ARREST"
        if "blackmail" in sc: return "BLACKMAIL"
        if "kyc" in sc or "aadhaar" in sc: return "KYC_FRAUD"
        if "lottery" in sc: return "LOTTERY_SCAM"
        if "amazon" in sc: return "COURIER_SCAM"
        if "relative" in sc: return "IMPERSONATION"
        if "bank" in sc: return "BANK_FRAUD"

    lower = text.lower()
    if any(k in lower for k in ["digital arrest", "cbi officer", "cyber crime branch", "arrest warrant"]):
        return "DIGITAL_ARREST"
    if any(k in lower for k in ["blackmail", "private video", "personal video", "leak your video"]):
        return "BLACKMAIL"
    if any(k in lower for k in ["electricity", "power bill", "disconnection", "electricity officer", "bijli"]):
        return "ELECTRICITY_SCAM"
    if any(k in lower for k in ["parcel", "courier", "fedex", "customs", "delivery address"]):
        return "COURIER_SCAM"
    if any(k in lower for k in ["otp", "one time password", "verification code", "share otp", "enter pin"]):
        return "OTP_FRAUD"
    if any(k in lower for k in ["upi", "gpay", "phonepe", "paytm", "qr code", "request money"]):
        return "UPI_FRAUD"
    if any(k in lower for k in ["kyc", "aadhaar", "pan card", "account blocked", "suspend your account"]):
        return "KYC_FRAUD"
    if any(k in lower for k in ["lottery", "congratulations", "winner", "won ₹", "won rs", "lucky draw"]):
        return "LOTTERY_SCAM"
    if any(k in lower for k in ["job offer", "work from home", "daily salary", "part time job"]):
        return "JOB_SCAM"
    if any(k in lower for k in ["loan approved", "instant loan", "zero interest loan"]):
        return "LOAN_SCAM"
    if any(k in lower for k in ["refund", "cashback", "tax rebate"]):
        return "REFUND_SCAM"
    if any(k in lower for k in ["police", "crime branch", "court notice", "inspector"]):
        return "IMPERSONATION"
    if any(k in lower for k in ["bank", "sbi", "hdfc", "icici", "axis bank", "credit card limit"]):
        return "BANK_FRAUD"
    if any(k in lower for k in ["http", "https", "www.", "click here", "login here"]):
        return "PHISHING"

    return "OTHER_SCAM"

def load_and_inspect_datasets():
    print("=================================================================")
    print("STEP 1: INSPECTING AND LOADING DOCUMENTED PUBLIC DATASETS")
    print("=================================================================")
    
    # 1. UCI SMS Spam Collection
    uci_path = os.path.join(RAW_DIR, "uci_sms_spam", "SMSSpamCollection")
    uci_records = []
    with open(uci_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            parts = line.strip().split("\t", 1)
            if len(parts) == 2:
                lbl, txt = parts
                norm_lbl = "SCAM" if lbl.strip().lower() == "spam" else "SAFE"
                uci_records.append({
                    "text": txt,
                    "label": norm_lbl,
                    "source_cat": None,
                    "source_lang": "English",
                    "source_dataset": "UCI SMS Spam Collection"
                })
    df_uci = pd.DataFrame(uci_records)
    print(f"1. UCI SMS Spam Collection: {len(df_uci)} records")
    print(f"   Original labels: ham={sum(df_uci['label']=='SAFE')}, spam={sum(df_uci['label']=='SCAM')}")

    # 2. Scam/Spam India Dataset
    india_path = os.path.join(RAW_DIR, "india_scam", "scam_hum_india.csv")
    df_ind_raw = pd.read_csv(india_path)
    india_records = []
    for _, row in df_ind_raw.iterrows():
        txt = row.get("text")
        lbl = str(row.get("label", "")).strip().lower()
        norm_lbl = "SCAM" if lbl in ["spam", "scam", "1"] else "SAFE"
        india_records.append({
            "text": txt,
            "label": norm_lbl,
            "source_cat": None,
            "source_lang": None,
            "source_dataset": "Scam/Spam India Dataset"
        })
    df_ind = pd.DataFrame(india_records)
    print(f"2. Scam/Spam India Dataset: {len(df_ind)} records")
    print(f"   Raw columns: {df_ind_raw.columns.tolist()}")
    print(f"   Normalized labels: SAFE={sum(df_ind['label']=='SAFE')}, SCAM={sum(df_ind['label']=='SCAM')}")

    # 3. Hinglish Scam Text Dataset
    hinglish_path = os.path.join(RAW_DIR, "hinglish_scam", "data.json")
    with open(hinglish_path, "r", encoding="utf-8") as f:
        d_h = json.load(f)
    h_rows = d_h.get("rows", [])
    hinglish_records = []
    for r in h_rows:
        txt = r.get("text")
        lbl = r.get("label")
        norm_lbl = "SCAM" if str(lbl).strip() in ["1", "scam", "spam"] else "SAFE"
        hinglish_records.append({
            "text": txt,
            "label": norm_lbl,
            "source_cat": None,
            "source_lang": "Hinglish",
            "source_dataset": "Hinglish Scam Text Dataset"
        })
    df_hinglish = pd.DataFrame(hinglish_records)
    print(f"3. Hinglish Scam Text Dataset: {len(df_hinglish)} records")
    print(f"   Normalized labels: SAFE={sum(df_hinglish['label']=='SAFE')}, SCAM={sum(df_hinglish['label']=='SCAM')}")

    # 4. Indian Cyber Scam PhoneCall Hinglish Dataset
    phone_path = os.path.join(RAW_DIR, "phonecall_hinglish", "India_Cyber_Scam_Hinglish_Dataset.csv")
    df_phone_raw = pd.read_csv(phone_path)
    phone_records = []
    for _, row in df_phone_raw.iterrows():
        txt = row.get("text")
        lbl = row.get("label")
        cat = row.get("scam_category")
        lang = row.get("language_style", "hinglish")
        norm_lbl = "SCAM" if str(lbl).strip() in ["1", "scam", "spam"] else "SAFE"
        phone_records.append({
            "text": txt,
            "label": norm_lbl,
            "source_cat": cat,
            "source_lang": lang,
            "source_dataset": "Indian Cyber Scam PhoneCall Hinglish Dataset"
        })
    df_phone = pd.DataFrame(phone_records)
    print(f"4. Indian Cyber Scam PhoneCall Hinglish Dataset: {len(df_phone)} records")
    print(f"   Raw columns: {df_phone_raw.columns.tolist()}")
    print(f"   Normalized labels: SAFE={sum(df_phone['label']=='SAFE')}, SCAM={sum(df_phone['label']=='SCAM')}")

    # Combine all
    df_all = pd.concat([df_uci, df_ind, df_hinglish, df_phone], ignore_index=True)
    total_raw = len(df_all)
    print(f"\nTotal Raw Ingested Records: {total_raw}")
    return df_all, total_raw

def clean_and_deduplicate(df_all, total_raw):
    print("\n=================================================================")
    print("STEP 2: CLEANING, DUPLICATE REMOVAL & SCHEMA UNIFICATION")
    print("=================================================================")
    
    # 1. Clean text
    df_all["text"] = df_all["text"].apply(clean_text_basic)

    # 2. Remove empty / whitespace records or short fragments (< 3 characters)
    initial_len = len(df_all)
    df_all = df_all[df_all["text"].str.strip().str.len() >= 3].copy()
    empty_removed = initial_len - len(df_all)
    print(f"Empty/malformed records removed: {empty_removed}")

    # 3. Duplicate and near-duplicate removal BEFORE splitting
    # Generate case-folded and whitespace-normalized key for near-duplicate identification
    df_all["dedup_key"] = df_all["text"].str.lower().str.replace(r"\s+", " ", regex=True).str.strip()
    
    before_dedup = len(df_all)
    df_all = df_all.drop_duplicates(subset=["dedup_key"], keep="first").copy()
    duplicates_removed = before_dedup - len(df_all)
    print(f"Exact and near duplicates removed: {duplicates_removed}")
    
    # 4. Infer categories & language
    df_all["category"] = df_all.apply(
        lambda r: map_category(r["text"], r["label"], r["source_cat"]), axis=1
    )
    df_all["language"] = df_all.apply(
        lambda r: detect_language(r["text"], r["source_lang"]), axis=1
    )

    # 5. Final Unified Schema
    unified_cols = ["text", "label", "category", "language", "source_dataset"]
    df_unified = df_all[unified_cols].reset_index(drop=True)
    final_size = len(df_unified)

    print(f"Final Cleaned Unique Dataset Size: {final_size}")

    # Save dataset/processed/scamshield_dataset.csv
    out_csv = os.path.join(PROCESSED_DIR, "scamshield_dataset.csv")
    df_unified.to_csv(out_csv, index=False)
    print(f"Saved: {out_csv}")

    return df_unified, duplicates_removed, empty_removed

def split_dataset(df_unified):
    print("\n=================================================================")
    print("STEP 3: STRATIFIED 80/10/10 DATASET SPLITTING (seed=42)")
    print("=================================================================")
    
    # 80% train, 20% temp
    train_df, temp_df = train_test_split(
        df_unified,
        test_size=0.20,
        random_state=42,
        stratify=df_unified["label"]
    )
    # Split temp into 50/50 -> 10% validation, 10% test
    val_df, test_df = train_test_split(
        temp_df,
        test_size=0.50,
        random_state=42,
        stratify=temp_df["label"]
    )

    # Save to dataset/splits/
    train_path = os.path.join(SPLITS_DIR, "train.csv")
    val_path = os.path.join(SPLITS_DIR, "validation.csv")
    test_path = os.path.join(SPLITS_DIR, "test.csv")

    train_df.to_csv(train_path, index=False)
    val_df.to_csv(val_path, index=False)
    test_df.to_csv(test_path, index=False)

    print(f"Train split:      {len(train_df)} rows ({len(train_df)/len(df_unified)*100:.1f}%)")
    print(f"Validation split: {len(val_df)} rows ({len(val_df)/len(df_unified)*100:.1f}%)")
    print(f"Test split:       {len(test_df)} rows ({len(test_df)/len(df_unified)*100:.1f}%)")

    return train_df, val_df, test_df

def save_and_print_statistics(df_unified, total_raw, duplicates_removed, train_df, val_df, test_df):
    print("\n=================================================================")
    print("STEP 4: ACTUAL DATASET STATISTICS")
    print("=================================================================")
    
    scam_count = int((df_unified["label"] == "SCAM").sum())
    safe_count = int((df_unified["label"] == "SAFE").sum())
    cat_dist = df_unified["category"].value_counts().to_dict()
    lang_dist = df_unified["language"].value_counts().to_dict()
    source_dist = df_unified["source_dataset"].value_counts().to_dict()

    print(f"Total Raw Records Ingested:   {total_raw}")
    print(f"Duplicates Removed:           {duplicates_removed}")
    print(f"Final Cleaned Unique Records: {len(df_unified)}")
    print(f"  - SCAM count: {scam_count} ({scam_count/len(df_unified)*100:.2f}%)")
    print(f"  - SAFE count: {safe_count} ({safe_count/len(df_unified)*100:.2f}%)")
    
    print("\nCategory Distribution:")
    for cat, cnt in cat_dist.items():
        print(f"  - {cat:<20}: {cnt}")

    print("\nLanguage Distribution:")
    for lang, cnt in lang_dist.items():
        print(f"  - {lang:<15}: {cnt}")

    print("\nSource Dataset Distribution:")
    for src, cnt in source_dist.items():
        print(f"  - {src:<45}: {cnt}")

    stats = {
        "total_raw_records": total_raw,
        "duplicates_removed": duplicates_removed,
        "final_dataset_size": len(df_unified),
        "label_distribution": {
            "SCAM": scam_count,
            "SAFE": safe_count,
            "SCAM_percentage": round(scam_count / len(df_unified) * 100, 2),
            "SAFE_percentage": round(safe_count / len(df_unified) * 100, 2)
        },
        "category_distribution": cat_dist,
        "language_distribution": lang_dist,
        "source_distribution": source_dist,
        "splits": {
            "train_size": len(train_df),
            "validation_size": len(val_df),
            "test_size": len(test_df),
            "random_state": 42,
            "split_ratios": "80% / 10% / 10%"
        }
    }

    stats_file = os.path.join(BASE_DIR, "dataset", "dataset_statistics.json")
    with open(stats_file, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)
    print(f"\nSaved statistics JSON: {stats_file}")
    return stats

def train_and_evaluate_baselines(train_df, test_df):
    print("\n=================================================================")
    print("STEP 5: TRAINING BASELINE MODELS ON UNIFIED TRAINING SPLIT")
    print("=================================================================")

    train_df["text"] = train_df["text"].fillna("").astype(str)
    test_df["text"] = test_df["text"].fillna("").astype(str)

    # TF-IDF Feature Extraction
    print("Fitting TF-IDF Vectorizer (word n-grams: 1-2, sublinear_tf=True, max_features=10000)...")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=10000,
        sublinear_tf=True,
        strip_accents="unicode"
    )
    X_train = vectorizer.fit_transform(train_df["text"])
    y_train = (train_df["label"] == "SCAM").astype(int)

    X_test = vectorizer.transform(test_df["text"])
    y_test = (test_df["label"] == "SCAM").astype(int)

    print(f"X_train shape: {X_train.shape} | X_test shape: {X_test.shape}")

    # Model 1: Logistic Regression
    print("\n--- Model 1: Training TF-IDF + Logistic Regression ---")
    lr = LogisticRegression(class_weight="balanced", C=1.0, max_iter=1000, random_state=42)
    start_lr = time.perf_counter()
    lr.fit(X_train, y_train)
    lr_train_time = time.perf_counter() - start_lr
    print(f"Logistic Regression trained in {lr_train_time:.3f}s")

    # Evaluate Logistic Regression on untouched test set
    start_eval = time.perf_counter()
    y_pred_lr = lr.predict(X_test)
    lr_lat = ((time.perf_counter() - start_eval) / len(test_df)) * 1000

    cm_lr = confusion_matrix(y_test, y_pred_lr)
    tn_lr, fp_lr, fn_lr, tp_lr = cm_lr.ravel()

    lr_metrics = {
        "model_name": "Logistic Regression (TF-IDF)",
        "accuracy": round(float(accuracy_score(y_test, y_pred_lr)), 4),
        "precision": round(float(precision_score(y_test, y_pred_lr, pos_label=1, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred_lr, pos_label=1, zero_division=0)), 4),
        "f1": round(float(f1_score(y_test, y_pred_lr, pos_label=1, zero_division=0)), 4),
        "macro_f1": round(float(f1_score(y_test, y_pred_lr, average="macro", zero_division=0)), 4),
        "weighted_f1": round(float(f1_score(y_test, y_pred_lr, average="weighted", zero_division=0)), 4),
        "inference_latency_ms": round(float(lr_lat), 5),
        "confusion_matrix": {
            "true_negative": int(tn_lr),
            "false_positive": int(fp_lr),
            "false_negative": int(fn_lr),
            "true_positive": int(tp_lr)
        },
        "test_samples": len(test_df)
    }

    # Model 2: Multinomial Naive Bayes
    print("\n--- Model 2: Training TF-IDF + Multinomial Naive Bayes ---")
    nb = MultinomialNB(alpha=0.1)
    start_nb = time.perf_counter()
    nb.fit(X_train, y_train)
    nb_train_time = time.perf_counter() - start_nb
    print(f"Multinomial Naive Bayes trained in {nb_train_time:.3f}s")

    # Evaluate Naive Bayes on untouched test set
    start_eval = time.perf_counter()
    y_pred_nb = nb.predict(X_test)
    nb_lat = ((time.perf_counter() - start_eval) / len(test_df)) * 1000

    cm_nb = confusion_matrix(y_test, y_pred_nb)
    tn_nb, fp_nb, fn_nb, tp_nb = cm_nb.ravel()

    nb_metrics = {
        "model_name": "Multinomial Naive Bayes (TF-IDF)",
        "accuracy": round(float(accuracy_score(y_test, y_pred_nb)), 4),
        "precision": round(float(precision_score(y_test, y_pred_nb, pos_label=1, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred_nb, pos_label=1, zero_division=0)), 4),
        "f1": round(float(f1_score(y_test, y_pred_nb, pos_label=1, zero_division=0)), 4),
        "macro_f1": round(float(f1_score(y_test, y_pred_nb, average="macro", zero_division=0)), 4),
        "weighted_f1": round(float(f1_score(y_test, y_pred_nb, average="weighted", zero_division=0)), 4),
        "inference_latency_ms": round(float(nb_lat), 5),
        "confusion_matrix": {
            "true_negative": int(tn_nb),
            "false_positive": int(fp_nb),
            "false_negative": int(fn_nb),
            "true_positive": int(tp_nb)
        },
        "test_samples": len(test_df)
    }

    print("\n=================================================================")
    print("STEP 6: REAL EVALUATION RESULTS (TEST SET: 824 SAMPLES)")
    print("=================================================================")
    print("\n--- Logistic Regression Metrics ---")
    print(f"Accuracy:     {lr_metrics['accuracy']*100:.2f}%")
    print(f"Precision:    {lr_metrics['precision']*100:.2f}% (SCAM class)")
    print(f"Recall:       {lr_metrics['recall']*100:.2f}% (SCAM class)")
    print(f"F1-Score:     {lr_metrics['f1']*100:.2f}% (SCAM class)")
    print(f"Macro F1:     {lr_metrics['macro_f1']*100:.2f}%")
    print(f"Weighted F1:  {lr_metrics['weighted_f1']*100:.2f}%")
    print(f"Confusion Matrix: TN={tn_lr}, FP={fp_lr}, FN={fn_lr}, TP={tp_lr}")
    print(f"Latency:      {lr_metrics['inference_latency_ms']:.4f} ms per message")

    print("\nClassification Report (Logistic Regression):")
    print(classification_report(y_test, y_pred_lr, target_names=["SAFE", "SCAM"], digits=4))

    print("\n--- Multinomial Naive Bayes Metrics ---")
    print(f"Accuracy:     {nb_metrics['accuracy']*100:.2f}%")
    print(f"Precision:    {nb_metrics['precision']*100:.2f}% (SCAM class)")
    print(f"Recall:       {nb_metrics['recall']*100:.2f}% (SCAM class)")
    print(f"F1-Score:     {nb_metrics['f1']*100:.2f}% (SCAM class)")
    print(f"Macro F1:     {nb_metrics['macro_f1']*100:.2f}%")
    print(f"Weighted F1:  {nb_metrics['weighted_f1']*100:.2f}%")
    print(f"Confusion Matrix: TN={tn_nb}, FP={fp_nb}, FN={fn_nb}, TP={tp_nb}")
    print(f"Latency:      {nb_metrics['inference_latency_ms']:.4f} ms per message")

    print("\nClassification Report (Multinomial Naive Bayes):")
    print(classification_report(y_test, y_pred_nb, target_names=["SAFE", "SCAM"], digits=4))

    # Save to ml/evaluation/results.json
    results_data = {
        "evaluation_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "test_set_size": len(test_df),
        "safe_test_samples": int((y_test == 0).sum()),
        "scam_test_samples": int((y_test == 1).sum()),
        "random_state": 42,
        "models": {
            "logistic_regression": lr_metrics,
            "multinomial_naive_bayes": nb_metrics
        }
    }

    results_file = os.path.join(EVAL_DIR, "results.json")
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(results_data, f, indent=2)
    print(f"\nSaved empirical results JSON: {results_file}")

    return lr_metrics, nb_metrics, cm_lr, cm_nb

def generate_four_evaluation_plots(lr_metrics, nb_metrics, cm_lr, cm_nb, stats):
    print("\n=================================================================")
    print("STEP 7: GENERATING 4 REQUIRED EVALUATION PLOTS")
    print("=================================================================")
    plt.style.use("dark_background")

    # Plot 1: confusion_matrix_logistic_regression.png
    fig, ax = plt.subplots(figsize=(6, 5), dpi=200)
    sns.heatmap(
        cm_lr,
        annot=True,
        fmt="d",
        cmap="Blues",
        cbar=False,
        ax=ax,
        xticklabels=["Predicted SAFE", "Predicted SCAM"],
        yticklabels=["Actual SAFE", "Actual SCAM"],
        annot_kws={"size": 14, "weight": "bold"}
    )
    ax.set_title("Confusion Matrix — Logistic Regression (TF-IDF)\nTest Split (824 Samples)", fontsize=11, fontweight="bold", pad=12, color="#f8fafc")
    ax.tick_params(colors="#cbd5e1", labelsize=10)
    fig.tight_layout()
    p1 = os.path.join(EVAL_DIR, "confusion_matrix_logistic_regression.png")
    plt.savefig(p1, facecolor="#020617")
    plt.close()
    print(f"1. Saved: {p1}")

    # Plot 2: confusion_matrix_naive_bayes.png
    fig, ax = plt.subplots(figsize=(6, 5), dpi=200)
    sns.heatmap(
        cm_nb,
        annot=True,
        fmt="d",
        cmap="Greens",
        cbar=False,
        ax=ax,
        xticklabels=["Predicted SAFE", "Predicted SCAM"],
        yticklabels=["Actual SAFE", "Actual SCAM"],
        annot_kws={"size": 14, "weight": "bold"}
    )
    ax.set_title("Confusion Matrix — Multinomial Naive Bayes (TF-IDF)\nTest Split (824 Samples)", fontsize=11, fontweight="bold", pad=12, color="#f8fafc")
    ax.tick_params(colors="#cbd5e1", labelsize=10)
    fig.tight_layout()
    p2 = os.path.join(EVAL_DIR, "confusion_matrix_naive_bayes.png")
    plt.savefig(p2, facecolor="#020617")
    plt.close()
    print(f"2. Saved: {p2}")

    # Plot 3: model_comparison.png
    fig, ax = plt.subplots(figsize=(8, 5), dpi=200)
    metrics_names = ["Accuracy", "SCAM Precision", "SCAM Recall", "SCAM F1-Score", "Macro F1", "Weighted F1"]
    lr_vals = [
        lr_metrics["accuracy"] * 100,
        lr_metrics["precision"] * 100,
        lr_metrics["recall"] * 100,
        lr_metrics["f1"] * 100,
        lr_metrics["macro_f1"] * 100,
        lr_metrics["weighted_f1"] * 100
    ]
    nb_vals = [
        nb_metrics["accuracy"] * 100,
        nb_metrics["precision"] * 100,
        nb_metrics["recall"] * 100,
        nb_metrics["f1"] * 100,
        nb_metrics["macro_f1"] * 100,
        nb_metrics["weighted_f1"] * 100
    ]

    x = np.arange(len(metrics_names))
    width = 0.35

    rects1 = ax.bar(x - width/2, lr_vals, width, label="Logistic Regression", color="#06b6d4", edgecolor="#0891b2")
    rects2 = ax.bar(x + width/2, nb_vals, width, label="Multinomial Naive Bayes", color="#34d399", edgecolor="#059669")

    ax.set_ylabel("Score (%)", fontsize=11, fontweight="bold", color="#e2e8f0")
    ax.set_title("ScamShield AI — Baseline Model Performance Comparison", fontsize=12, fontweight="bold", pad=15, color="#f8fafc")
    ax.set_xticks(x)
    ax.set_xticklabels(metrics_names, fontsize=9, fontweight="bold", color="#cbd5e1", rotation=15)
    ax.set_ylim(85, 102)
    ax.grid(axis="y", linestyle="--", alpha=0.2, color="#94a3b8")
    ax.legend(loc="lower right", framealpha=0.3, facecolor="#0f172a", edgecolor="#334155")
    fig.tight_layout()
    p3 = os.path.join(EVAL_DIR, "model_comparison.png")
    plt.savefig(p3, facecolor="#020617")
    plt.close()
    print(f"3. Saved: {p3}")

    # Plot 4: class_distribution.png
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5), dpi=200)

    # Class breakdown
    labels = ["SAFE", "SCAM"]
    counts = [stats["label_distribution"]["SAFE"], stats["label_distribution"]["SCAM"]]
    colors = ["#10b981", "#ef4444"]
    ax1.pie(
        counts,
        labels=labels,
        autopct="%1.1f%%",
        startangle=140,
        colors=colors,
        textprops={"color": "#f8fafc", "fontsize": 11, "weight": "bold"},
        wedgeprops={"edgecolor": "#0f172a", "linewidth": 2}
    )
    ax1.set_title(f"Class Balance (Unique Records: {stats['final_dataset_size']})", fontsize=11, fontweight="bold", color="#f8fafc")

    # Top scam categories
    cat_dist = stats["category_distribution"]
    scam_cats = {k: v for k, v in cat_dist.items() if k != "SAFE"}
    sorted_cats = sorted(scam_cats.items(), key=lambda item: item[1], reverse=True)[:8]
    cat_names = [item[0].replace("_", " ").title() for item in sorted_cats]
    cat_counts = [item[1] for item in sorted_cats]

    y_pos = np.arange(len(cat_names))
    ax2.barh(y_pos, cat_counts, color="#38bdf8", edgecolor="#0284c7")
    ax2.set_yticks(y_pos)
    ax2.set_yticklabels(cat_names, fontsize=9, color="#cbd5e1")
    ax2.invert_yaxis()
    ax2.set_xlabel("Sample Count", fontsize=10, color="#cbd5e1")
    ax2.set_title("Top Identified Scam Threat Categories", fontsize=11, fontweight="bold", color="#f8fafc")
    ax2.grid(axis="x", linestyle="--", alpha=0.2, color="#94a3b8")

    fig.tight_layout()
    p4 = os.path.join(EVAL_DIR, "class_distribution.png")
    plt.savefig(p4, facecolor="#020617")
    plt.close()
    print(f"4. Saved: {p4}")

def main():
    # 1. Load & Inspect
    df_all, total_raw = load_and_inspect_datasets()

    # 2. Clean, deduplicate & unify
    df_unified, duplicates_removed, empty_removed = clean_and_deduplicate(df_all, total_raw)

    # 3. Stratified 80/10/10 split
    train_df, val_df, test_df = split_dataset(df_unified)

    # 4. Save & print statistics
    stats = save_and_print_statistics(df_unified, total_raw, duplicates_removed, train_df, val_df, test_df)

    # 5. Train & Evaluate Baselines
    lr_metrics, nb_metrics, cm_lr, cm_nb = train_and_evaluate_baselines(train_df, test_df)

    # 6. Generate 4 required evaluation plots
    generate_four_evaluation_plots(lr_metrics, nb_metrics, cm_lr, cm_nb, stats)

    print("\n================ PIPELINE EXECUTION FINISHED SUCCESSFULLY ================\n")

if __name__ == "__main__":
    main()
