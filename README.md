# SRM CampusFind — Intelligent Multimodal Lost-and-Found System Using GenAI

**Applied Generative AI Course Project — B.Tech 6th Semester**  
**SRM Institute of Science and Technology, Kattankulathur (KTR)**

---

## ⚡ Overview

**SRM CampusFind** is an AI-powered lost-and-found platform engineered to connect lost and found item reports across SRM KTR campus. Standard search systems fail when users describe the same item using different words (e.g., *"black wireless earbuds"* vs *"dark Bluetooth earphones"*). SRM CampusFind solves this through:

- **Transformer Semantic NLP** (Sentence-Transformers / 384-dim dense text embeddings)
- **Deep Visual Encoders** (ResNet / Composite visual feature extraction for shape, color distribution, and texture)
- **Multimodal Fusion Engine** (Weighted combination of Text, Vision, Geo-Location Proximity, Time Decay, and Attributes)
- **Vector Storage & Retrieval Index** (Fast candidate vector search)
- **Generative AI Engines** (Natural language evidence explanations, structured attribute normalizer, and synthetic data generation)
- **Automated Match Notifications** (Triggered alerts when confidence score $\ge 0.75$)

---

## 📂 Project Structure

```text
srm-campusfind/
│
├── data/
│   ├── raw/
│   ├── processed/          # SRM KTR campus lost/found dataset
│   └── synthetic/          # AI-generated paraphrased variations
│
├── docs/
│   ├── SRM_CampusFind_Academic_Report.md  # Complete 20-Chapter Academic Report
│   ├── SRM_CampusFind_Presentation.md     # 27-Slide Presentation Structure
│   └── SRM_CampusFind_Viva_QA.md          # 32 Technical Viva Questions & Answers
│
├── models/
│   ├── text_encoder/
│   ├── image_encoder/
│   └── fusion_model/
│
├── src/
│   ├── preprocessing/      # Text cleaner, entity extractor, dataset generator
│   ├── text_matching/       # Transformer text encoder & cosine similarity
│   ├── image_matching/      # Deep visual encoder & color-texture feature extractor
│   ├── multimodal/          # Multimodal feature fusion engine & ablation study
│   ├── retrieval/           # Vector Database & candidate search index
│   ├── genai/               # GenAI explanation generator, normalizer & synthetic data
│   ├── notification/        # Automated alert notification manager
│   └── evaluation/          # Benchmark suite (Accuracy, Precision, Recall, F1, Recall@K, MRR)
│
├── backend/
│   └── main.py              # FastAPI REST server & static web server
│
├── frontend/
│   ├── index.html           # Modern glassmorphism web interface
│   ├── style.css            # Dark mode styling & micro-animations
│   └── app.js               # Frontend application logic
│
├── requirements.txt         # Core dependencies
└── README.md                # Project documentation & setup guide
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Experimental Model Evaluation Benchmark
Execute the benchmark suite comparing **Baseline 1 (Keyword)**, **Baseline 2 (TF-IDF)**, **Baseline 3 (Transformer Text)**, **Baseline 4 (Image Only)**, and the **Proposed Multimodal Model**:
```bash
python -m src.evaluation.evaluator
```

### 3. Launch Web Application & Interactive Dashboard
Start the FastAPI server:
```bash
uvicorn backend.main:app --reload --port 8000
```
Open your browser and navigate to:
👉 **`http://localhost:8000`**

---

## 📊 Experimental Evaluation Benchmark Results

| Model Architecture | Accuracy | Precision | Recall | F1 Score | Recall@1 | Recall@3 | MRR |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline 1 (Keyword)** | 0.1250 | 0.0000 | 0.0000 | 0.0000 | 0.8750 | 1.0000 | 0.9375 |
| **Baseline 2 (TF-IDF)** | 0.2500 | 1.0000 | 0.2500 | 0.4000 | 1.0000 | 1.0000 | 1.0000 |
| **Baseline 3 (Transformer Text)** | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 1.0000 | 1.0000 | 1.0000 |
| **Baseline 4 (Image Only)** | 0.2500 | 0.2500 | 1.0000 | 0.4000 | 0.2500 | 0.6250 | 0.4937 |
| **Proposed Multimodal Model** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** |

---

## 🗺️ Objective-to-Module Mapping

| Objective | AI Technique | Model | Input | Output | Evaluation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Semantic Text Matching** | NLP + Transformer | Sentence Transformer (`all-MiniLM-L6-v2`) | Text Description | 384-dim Embedding & Cosine Score | Recall@K, F1 |
| **Image Identification** | Deep Learning / CV | ResNet18 / Visual Feature Extractor | Item Image | 512-dim Visual Vector | Precision, Recall |
| **Multimodal Matching** | Feature Fusion | Weighted Similarity Engine | Text + Vision + Geo + Time + Attr | Unified Confidence Score | F1 Score, Accuracy |
| **Match Explanation** | Generative AI | GenAI Explanation Engine | Evidence & Subscores | Natural Language Explanation | Grounding & Faithfulness |
| **Match Notifications** | Logic Trigger | Notification Manager | Score $\ge 0.75$ | Alert Ledger Payload | Correctness |

---

## 📄 Academic Documentation Deliverables

- 📜 **[20-Chapter Academic Report](docs/SRM_CampusFind_Academic_Report.md)**
- 📊 **[27-Slide Presentation Outline](docs/SRM_CampusFind_Presentation.md)**
- ❓ **[32 Technical Viva Q&A Guide](docs/SRM_CampusFind_Viva_QA.md)**
