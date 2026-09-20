"""
ScamShield AI - DistilBERT Fine-Tuning Pipeline
Fine-tunes a transformer model (distilbert-base-uncased) on the unified ScamShield training split.
Evaluates on the held-out test split, updates results.json, and saves artifacts for the FastAPI backend.
"""

import os
import sys
import time
import json
import logging
import shutil
import torch
import numpy as np
import pandas as pd
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup
)
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("TrainDistilBERT")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ML_SPLITS_DIR = os.path.join(BASE_DIR, "ml", "data", "splits")
ML_MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")
BACKEND_MODELS_DIR = os.path.join(BASE_DIR, "backend", "models")
EVAL_DIR = os.path.join(BASE_DIR, "ml", "evaluation")

MODEL_NAME = "distilbert-base-uncased"
BATCH_SIZE = 32
MAX_LEN = 128
EPOCHS = 2
LR = 3e-5
SEED = 42

class TextClassificationDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]

        encoding = self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_len,
            padding="max_length",
            return_tensors="pt"
        )

        return {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "label": torch.tensor(label, dtype=torch.long)
        }

def get_device():
    if torch.backends.mps.is_available():
        logger.info("Using Apple Silicon MPS (GPU) device.")
        return torch.device("mps")
    elif torch.cuda.is_available():
        logger.info("Using NVIDIA CUDA (GPU) device.")
        return torch.device("cuda")
    else:
        logger.info("Using CPU device.")
        return torch.device("cpu")

def train_and_evaluate():
    torch.manual_seed(SEED)
    np.random.seed(SEED)
    device = get_device()

    logger.info(f"Loading data splits from {ML_SPLITS_DIR}...")
    train_df = pd.read_csv(os.path.join(ML_SPLITS_DIR, "train.csv"))
    val_df = pd.read_csv(os.path.join(ML_SPLITS_DIR, "validation.csv"))
    test_df = pd.read_csv(os.path.join(ML_SPLITS_DIR, "test.csv"))

    for df in [train_df, val_df, test_df]:
        df["text"] = df["text"].fillna("").astype(str)

    train_texts = train_df["text"].tolist()
    train_labels = (train_df["label"] == "SCAM").astype(int).tolist()

    val_texts = val_df["text"].tolist()
    val_labels = (val_df["label"] == "SCAM").astype(int).tolist()

    test_texts = test_df["text"].tolist()
    test_labels = (test_df["label"] == "SCAM").astype(int).tolist()

    logger.info(f"Initializing tokenizer for {MODEL_NAME}...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    train_dataset = TextClassificationDataset(train_texts, train_labels, tokenizer, MAX_LEN)
    val_dataset = TextClassificationDataset(val_texts, val_labels, tokenizer, MAX_LEN)
    test_dataset = TextClassificationDataset(test_texts, test_labels, tokenizer, MAX_LEN)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE)

    logger.info(f"Loading base model {MODEL_NAME} for binary classification...")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=2,
        id2label={0: "SAFE", 1: "SCAM"},
        label2id={"SAFE": 0, "SCAM": 1}
    )
    model.to(device)

    optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=0.01)
    total_steps = len(train_loader) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=int(total_steps * 0.1),
        num_training_steps=total_steps
    )

    logger.info(f"Starting fine-tuning for {EPOCHS} epochs ({total_steps} steps)...")
    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0.0
        start_epoch = time.time()

        for step, batch in enumerate(train_loader):
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["label"].to(device)

            optimizer.zero_grad()
            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()

            total_loss += loss.item()

            if (step + 1) % 50 == 0 or (step + 1) == len(train_loader):
                logger.info(f"Epoch {epoch+1}/{EPOCHS} | Step {step+1}/{len(train_loader)} | Loss: {loss.item():.4f}")

        avg_loss = total_loss / len(train_loader)
        epoch_time = time.time() - start_epoch
        logger.info(f"Epoch {epoch+1} finished in {epoch_time:.1f}s | Average Train Loss: {avg_loss:.4f}")

    # Evaluate on held-out test split
    logger.info("Evaluating fine-tuned DistilBERT on Test Split...")
    model.eval()
    all_preds = []
    all_probs = []
    start_eval = time.perf_counter()

    with torch.no_grad():
        for batch in test_loader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1)[:, 1].cpu().numpy()
            preds = torch.argmax(logits, dim=-1).cpu().numpy()

            all_preds.extend(preds)
            all_probs.extend(probs)

    eval_latency = ((time.perf_counter() - start_eval) / len(test_dataset)) * 1000
    y_test = np.array(test_labels)
    y_pred = np.array(all_preds)

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    metrics = {
        "model_name": "DistilBERT (Fine-tuned)",
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "scam_precision": round(float(precision_score(y_test, y_pred, pos_label=1, zero_division=0)), 4),
        "scam_recall": round(float(recall_score(y_test, y_pred, pos_label=1, zero_division=0)), 4),
        "scam_f1": round(float(f1_score(y_test, y_pred, pos_label=1, zero_division=0)), 4),
        "macro_f1": round(float(f1_score(y_test, y_pred, average="macro", zero_division=0)), 4),
        "weighted_f1": round(float(f1_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
        "inference_latency_ms": round(float(eval_latency), 4),
        "confusion_matrix": {
            "true_negative": int(tn),
            "false_positive": int(fp),
            "false_negative": int(fn),
            "true_positive": int(tp)
        },
        "test_samples": len(test_dataset)
    }

    logger.info(f"DistilBERT Results: Acc={metrics['accuracy']:.4f} | Prec={metrics['scam_precision']:.4f} | Rec={metrics['scam_recall']:.4f} | F1={metrics['scam_f1']:.4f} | Latency={metrics['inference_latency_ms']:.2f}ms")

    # Save artifacts
    save_dir_ml = os.path.join(ML_MODELS_DIR, "distilbert")
    save_dir_backend = os.path.join(BACKEND_MODELS_DIR, "distilbert")
    os.makedirs(save_dir_ml, exist_ok=True)
    os.makedirs(save_dir_backend, exist_ok=True)

    logger.info(f"Saving model to {save_dir_ml}...")
    model.save_pretrained(save_dir_ml)
    tokenizer.save_pretrained(save_dir_ml)

    logger.info(f"Mirroring model to {save_dir_backend}...")
    model.save_pretrained(save_dir_backend)
    tokenizer.save_pretrained(save_dir_backend)

    # Update results.json
    results_file = os.path.join(EVAL_DIR, "results.json")
    if os.path.exists(results_file):
        with open(results_file, "r") as f:
            data = json.load(f)
    else:
        data = {"benchmark_models": {}}

    data["benchmark_models"]["distilbert"] = metrics
    with open(results_file, "w") as f:
        json.dump(data, f, indent=2)

    print("\n================ DISTILBERT EVALUATION SUMMARY ================")
    print(f"Accuracy:      {metrics['accuracy']*100:.2f}%")
    print(f"SCAM Precision:{metrics['scam_precision']*100:.2f}%")
    print(f"SCAM Recall:   {metrics['scam_recall']*100:.2f}%")
    print(f"SCAM F1-Score: {metrics['scam_f1']*100:.2f}%")
    print(f"Avg Latency:   {metrics['inference_latency_ms']:.2f} ms")
    print(f"Confusion:     TN={tn}, FP={fp}, FN={fn}, TP={tp}")
    print("===============================================================\n")

if __name__ == "__main__":
    train_and_evaluate()
