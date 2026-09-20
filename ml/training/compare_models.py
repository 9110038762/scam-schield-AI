"""
ScamShield AI - Model Comparison Benchmark Utility
Reads results.json and displays formatted comparative analysis across all trained classifiers.
"""

import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RESULTS_FILE = os.path.join(BASE_DIR, "ml", "evaluation", "results.json")

def compare():
    if not os.path.exists(RESULTS_FILE):
        print(f"Results file not found at {RESULTS_FILE}. Train models first.")
        return

    with open(RESULTS_FILE, "r") as f:
        data = json.load(f)

    models = data.get("benchmark_models", {})

    print("\n" + "=" * 95)
    print("               SCAMSHIELD AI — COMPREHENSIVE MODEL COMPARISON BENCHMARK")
    print("=" * 95)
    header = f"{'Model':<28} | {'Accuracy':<10} | {'SCAM Prec':<10} | {'SCAM Rec':<10} | {'SCAM F1':<10} | {'Latency (ms)':<12}"
    print(header)
    print("-" * 95)

    for key, m in models.items():
        name = m.get("model_name", key)
        acc = f"{m.get('accuracy', 0)*100:.2f}%"
        prec = f"{m.get('scam_precision', 0)*100:.2f}%"
        rec = f"{m.get('scam_recall', 0)*100:.2f}%"
        f1 = f"{m.get('scam_f1', 0)*100:.2f}%"
        lat = f"{m.get('inference_latency_ms', 0):.4f} ms"
        print(f"{name:<28} | {acc:<10} | {prec:<10} | {rec:<10} | {f1:<10} | {lat:<12}")

    print("=" * 95)

    # Sub-experiments
    sub_exps = data.get("dataset_experiments", {})
    if sub_exps:
        print("\n--- Source Dataset Isolation Experiments (Logistic Regression) ---")
        for exp_id, exp_data in sub_exps.items():
            name = exp_data.get("name")
            m = exp_data.get("metrics", {})
            acc = f"{m.get('accuracy', 0)*100:.2f}%"
            f1 = f"{m.get('scam_f1', 0)*100:.2f}%"
            samples = f"Train: {exp_data.get('train_samples')} / Test: {exp_data.get('test_samples')}"
            print(f"• {name:<45} | Acc: {acc:<8} | SCAM F1: {f1:<8} | Samples: {samples}")
        print("-" * 95)

if __name__ == "__main__":
    compare()
