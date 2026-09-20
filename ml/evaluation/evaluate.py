"""
ScamShield AI - Model Evaluation & Benchmark Verifier
Loads serialized models and runs evaluation against the held-out test split.
Outputs classification reports, confusion matrix breakdowns, and latency benchmarks.
"""

import os
import json
import time
import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEST_SPLIT_FILE = os.path.join(BASE_DIR, "ml", "data", "splits", "test.csv")
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")
RESULTS_FILE = os.path.join(BASE_DIR, "ml", "evaluation", "results.json")

def evaluate_models():
    print(f"Loading test split from {TEST_SPLIT_FILE}...")
    test_df = pd.read_csv(TEST_SPLIT_FILE)
    test_df["text"] = test_df["text"].fillna("").astype(str)
    test_df = test_df[test_df["text"].str.strip() != ""].reset_index(drop=True)

    vec_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl")
    lr_path = os.path.join(MODELS_DIR, "logistic_regression.pkl")
    nb_path = os.path.join(MODELS_DIR, "naive_bayes.pkl")
    svm_path = os.path.join(MODELS_DIR, "svm.pkl")

    if not os.path.exists(vec_path) or not os.path.exists(lr_path):
        print("Model artifacts not found. Please run: python ml/training/train_baseline.py")
        return

    vectorizer = joblib.load(vec_path)
    lr_model = joblib.load(lr_path)
    nb_model = joblib.load(nb_path) if os.path.exists(nb_path) else None
    svm_model = joblib.load(svm_path) if os.path.exists(svm_path) else None

    X_test = vectorizer.transform(test_df["text"])
    y_test = (test_df["label"] == "SCAM").astype(int)

    models = [("Logistic Regression", lr_model)]
    if nb_model:
        models.append(("Multinomial Naive Bayes", nb_model))
    if svm_model:
        models.append(("Linear SVM", svm_model))

    print("\n" + "=" * 65)
    print("      SCAMSHIELD AI: HELD-OUT TEST BENCHMARK EVALUATION")
    print(f"      Total Test Samples: {len(test_df)} (SAFE: {(y_test==0).sum()}, SCAM: {(y_test==1).sum()})")
    print("=" * 65)

    for name, model in models:
        start = time.perf_counter()
        y_pred = model.predict(X_test)
        latency = ((time.perf_counter() - start) / len(test_df)) * 1000

        acc = accuracy_score(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()

        print(f"\nModel: {name}")
        print("-" * 50)
        print(f"Accuracy:  {acc*100:.2f}%")
        print(f"Confusion: TN={tn}, FP={fp}, FN={fn}, TP={tp}")
        print(f"Avg Latency per message: {latency:.4f} ms")
        print("Classification Report:")
        print(classification_report(y_test, y_pred, target_names=["SAFE", "SCAM"], digits=4))

if __name__ == "__main__":
    evaluate_models()
