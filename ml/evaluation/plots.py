"""
ScamShield AI - Evaluation Plotting Utility
Generates actual visualization figures from experimental results:
1. confusion_matrix.png (LR and SVM confusion matrices)
2. model_comparison.png (Bar chart comparing Acc, Prec, Rec, F1 across models)
3. class_distribution.png (SCAM vs SAFE distribution & category frequencies)
"""

import os
import json
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EVAL_DIR = os.path.join(BASE_DIR, "ml", "evaluation")
DATASET_STATS_FILE = os.path.join(BASE_DIR, "dataset", "dataset_statistics.json")
RESULTS_FILE = os.path.join(EVAL_DIR, "results.json")

os.makedirs(EVAL_DIR, exist_ok=True)

plt.style.use("dark_background")
PALETTE = ["#06b6d4", "#34d399", "#fbbf24", "#f87171"]

def generate_plots():
    if not os.path.exists(RESULTS_FILE):
        print(f"Results file not found: {RESULTS_FILE}")
        return

    with open(RESULTS_FILE, "r") as f:
        results = json.load(f)

    # 1. Model Comparison Plot
    models_data = results["benchmark_models"]
    model_names = []
    accs, precs, recs, f1s = [], [], [], []

    name_map = {
        "logistic_regression": "Logistic Regression",
        "multinomial_naive_bayes": "Naive Bayes",
        "linear_svm": "Linear SVM",
        "distilbert": "DistilBERT (Multilingual)"
    }

    for key, data in models_data.items():
        label = name_map.get(key, key)
        model_names.append(label)
        accs.append(data["accuracy"] * 100)
        precs.append(data["scam_precision"] * 100)
        recs.append(data["scam_recall"] * 100)
        f1s.append(data["scam_f1"] * 100)

    fig, ax = plt.subplots(figsize=(10, 5.5), dpi=200)
    x = np.arange(len(model_names))
    width = 0.2

    ax.bar(x - 1.5 * width, accs, width, label="Accuracy", color="#06b6d4")
    ax.bar(x - 0.5 * width, precs, width, label="SCAM Precision", color="#34d399")
    ax.bar(x + 0.5 * width, recs, width, label="SCAM Recall", color="#fbbf24")
    ax.bar(x + 1.5 * width, f1s, width, label="SCAM F1-Score", color="#f87171")

    ax.set_ylabel("Score (%)", fontsize=11, fontweight="bold", color="#e2e8f0")
    ax.set_title("ScamShield AI — Model Benchmark Comparison", fontsize=13, fontweight="bold", pad=15, color="#f8fafc")
    ax.set_xticks(x)
    ax.set_xticklabels(model_names, fontsize=10, fontweight="bold", color="#cbd5e1")
    ax.set_ylim(85, 102)
    ax.grid(axis="y", linestyle="--", alpha=0.2, color="#94a3b8")
    ax.legend(loc="lower right", framealpha=0.3, facecolor="#0f172a", edgecolor="#334155")
    fig.tight_layout()

    comp_plot_path = os.path.join(EVAL_DIR, "model_comparison.png")
    plt.savefig(comp_plot_path, facecolor="#020617")
    plt.close()
    print(f"Saved: {comp_plot_path}")

    # 2. Confusion Matrix Plot
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.5), dpi=200)
    cm_models = [("logistic_regression", "Logistic Regression"), ("linear_svm", "Linear SVM")]

    for idx, (m_key, title) in enumerate(cm_models):
        if m_key not in models_data:
            continue
        cm_dict = models_data[m_key]["confusion_matrix"]
        cm_matrix = np.array([
            [cm_dict["true_negative"], cm_dict["false_positive"]],
            [cm_dict["false_negative"], cm_dict["true_positive"]]
        ])
        sns.heatmap(
            cm_matrix,
            annot=True,
            fmt="d",
            cmap="Blues",
            cbar=False,
            ax=axes[idx],
            xticklabels=["Predicted SAFE", "Predicted SCAM"],
            yticklabels=["Actual SAFE", "Actual SCAM"]
        )
        axes[idx].set_title(f"{title} (Test Set)", fontsize=11, fontweight="bold", pad=10, color="#f8fafc")
        axes[idx].tick_params(colors="#cbd5e1", labelsize=9)

    fig.suptitle("Confusion Matrix Analysis", fontsize=13, fontweight="bold", color="#f8fafc", y=1.02)
    fig.tight_layout()
    cm_plot_path = os.path.join(EVAL_DIR, "confusion_matrix.png")
    plt.savefig(cm_plot_path, facecolor="#020617")
    plt.close()
    print(f"Saved: {cm_plot_path}")

    # 3. Class & Category Distribution Plot
    if os.path.exists(DATASET_STATS_FILE):
        with open(DATASET_STATS_FILE, "r") as f:
            stats = json.load(f)

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5), dpi=200)

        # Binary Class Distribution
        labels = ["SAFE", "SCAM"]
        counts = [stats["label_distribution"]["SAFE"], stats["label_distribution"]["SCAM"]]
        colors = ["#10b981", "#ef4444"]
        ax1.pie(counts, labels=labels, autopct="%1.1f%%", startangle=140, colors=colors, textprops={"color": "#f8fafc", "fontsize": 11, "weight": "bold"}, wedgeprops={"edgecolor": "#0f172a", "linewidth": 2})
        ax1.set_title("Unified Dataset Class Distribution (Unique: 8,233)", fontsize=11, fontweight="bold", color="#f8fafc")

        # Top Categories
        cat_dist = stats["category_distribution"]
        # Filter out SAFE for scam category breakdown
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
        ax2.set_title("Top Identified Scam Categories", fontsize=11, fontweight="bold", color="#f8fafc")
        ax2.grid(axis="x", linestyle="--", alpha=0.2, color="#94a3b8")

        fig.tight_layout()
        dist_plot_path = os.path.join(EVAL_DIR, "class_distribution.png")
        plt.savefig(dist_plot_path, facecolor="#020617")
        plt.close()
        print(f"Saved: {dist_plot_path}")

if __name__ == "__main__":
    generate_plots()
