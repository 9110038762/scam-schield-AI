"""
ScamShield AI - Dataset Downloader
Downloads all 4 primary research datasets:
1. UCI SMS Spam Collection (5,574 samples, CC BY 4.0)
2. Scam/Spam India Dataset (2,272 samples, Apache 2.0)
3. Hinglish & English Financial Scam/Fraud Text Dataset (3,787 samples, CC BY 4.0)
4. Indian Cyber Scam PhoneCall Hinglish Dataset (10,000 samples, Apache 2.0)

Raw datasets are saved to dataset/raw/ and mirrored to ml/data/raw/.
Original raw files are preserved without modification.
"""

import os
import sys
import shutil
import zipfile
import urllib.request
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("DatasetDownloader")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_RAW_DIR = os.path.join(BASE_DIR, "dataset", "raw")
ML_RAW_DIR = os.path.join(BASE_DIR, "ml", "data", "raw")

DATASET_CONFIGS = [
    {
        "name": "uci_sms_spam",
        "url": "https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip",
        "is_zip": True,
        "target_file": "SMSSpamCollection",
        "license": "CC BY 4.0",
        "citation": "Almeida, T. & Hidalgo, J. (2011). SMS Spam Collection. UCI ML Repository."
    },
    {
        "name": "india_scam",
        "url": "https://huggingface.co/datasets/anmolshrivastav/scam-hum-india/resolve/main/scam_hum_india.csv",
        "is_zip": False,
        "target_file": "scam_hum_india.csv",
        "license": "Apache 2.0",
        "citation": "Shrivastav, A. (2024). Scam-Hum-India. Hugging Face Datasets."
    },
    {
        "name": "hinglish_scam",
        "url": "https://huggingface.co/datasets/bolewara/hinglish-scam-text-dataset/resolve/main/data.json",
        "is_zip": False,
        "target_file": "data.json",
        "license": "CC BY 4.0",
        "citation": "Bolewara, R. (2024). Hinglish & English Financial Scam/Fraud Text Dataset. Hugging Face."
    },
    {
        "name": "phonecall_hinglish",
        "url": "https://huggingface.co/datasets/ysangam/Indian_Cyber_Scam_PhoneCall_Hinglish_Dataset/resolve/main/India_Cyber_Scam_Hinglish_Dataset.csv",
        "is_zip": False,
        "target_file": "India_Cyber_Scam_Hinglish_Dataset.csv",
        "license": "Apache 2.0",
        "citation": "Sangam, Y. (2024). Indian Cyber Scam PhoneCall Hinglish Dataset. Hugging Face."
    }
]

def download_file(url: str, dest_path: str):
    logger.info(f"Downloading {url} -> {dest_path}")
    headers = {"User-Agent": "ScamShield-AI-Research/1.0"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response, open(dest_path, "wb") as out_file:
        shutil.copyfileobj(response, out_file)
    logger.info(f"Saved: {dest_path} ({os.path.getsize(dest_path)} bytes)")

def run():
    os.makedirs(DATASET_RAW_DIR, exist_ok=True)
    os.makedirs(ML_RAW_DIR, exist_ok=True)

    for cfg in DATASET_CONFIGS:
        name = cfg["name"]
        logger.info(f"--- Fetching {name} ---")
        dest_dir = os.path.join(DATASET_RAW_DIR, name)
        os.makedirs(dest_dir, exist_ok=True)

        if cfg["is_zip"]:
            zip_dest = os.path.join(dest_dir, "archive.zip")
            if not os.path.exists(zip_dest):
                download_file(cfg["url"], zip_dest)
            
            with zipfile.ZipFile(zip_dest, "r") as zip_ref:
                zip_ref.extractall(dest_dir)
            logger.info(f"Extracted zip archive into {dest_dir}")
        else:
            file_dest = os.path.join(dest_dir, cfg["target_file"])
            if not os.path.exists(file_dest):
                download_file(cfg["url"], file_dest)

        # Mirror to ml/data/raw
        ml_dest_dir = os.path.join(ML_RAW_DIR, name)
        os.makedirs(ml_dest_dir, exist_ok=True)
        for item in os.listdir(dest_dir):
            s = os.path.join(dest_dir, item)
            d = os.path.join(ml_dest_dir, item)
            if os.path.isfile(s) and not os.path.exists(d):
                shutil.copy2(s, d)

    logger.info("All raw datasets downloaded and mirrored successfully.")

if __name__ == "__main__":
    run()
