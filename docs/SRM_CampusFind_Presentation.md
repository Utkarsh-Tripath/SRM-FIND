# SRM CampusFind — Academic Presentation Slides (27 Slides)

**Course Project:** Applied Generative AI (B.Tech 6th Semester)  
**Title:** SRM CampusFind — Intelligent Multimodal Lost-and-Found System Using GenAI  

---

### Slide 1: Title Slide
- **Title:** SRM CampusFind — Intelligent Multimodal Lost-and-Found System Using GenAI
- **Subtitle:** Connecting Lost & Found Reports via Semantic NLP, Computer Vision, Geo-Temporal Fusion, and Generative AI
- **Presenter:** B.Tech Computer Science & Engineering (6th Semester)
- **Institution:** SRM Institute of Science and Technology, Kattankulathur (KTR)

---

### Slide 2: Problem Statement
- **Campus Friction:** 40,000+ students and staff misplaced belongings daily across a 250-acre campus.
- **Fragmented Reporting:** Notices spread across WhatsApp groups, social media, and security posts.
- **Vocabulary Mismatch:** "Black wireless earbuds" vs "Dark Bluetooth earphones" fail under standard keyword search.

---

### Slide 3: Motivation
- **Automated Intelligence:** Eliminate manual notice scrolling for security and students.
- **Multimodal Synergy:** Combine text context, image structure, physical location, and event timestamps.
- **Explainable AI:** Build trust through natural language evidence explanations rather than black-box scores.

---

### Slide 4: Existing Systems & Limitations
- Manual paper logs / WhatsApp messages: High friction, low searchability.
- Traditional SQL/Keyword search: Zero semantic flexibility, fails on synonyms or typos.
- Pixel-only visual comparison: Fails under lighting shifts and image compression.

---

### Slide 5: Proposed System Overview
- Centralized web platform backed by a 5-component AI engine:
  1. GenAI Structured Normalizer
  2. Transformer Semantic Text Encoder
  3. Deep Vision Feature Encoder
  4. Multimodal Fusion Engine
  5. GenAI Explanation & Automated Alert System

---

### Slide 6: Primary Project Objectives
- **Obj 1:** Semantic Text Matching via Transformers & Cosine Similarity.
- **Obj 2:** Visual Feature Extraction & Similarity via Vision Encoders.
- **Obj 3:** Multimodal Weight Fusion (Text + Image + Geo + Time + Attributes).
- **Obj 4:** GenAI Evidence-Grounded Match Explanations.
- **Obj 5:** Automated Notification Alert Triggering.

---

### Slide 7: Why Machine Learning?
- **Pattern Learning:** Learns feature similarity relationships dynamically without hardcoded rules.
- **Candidate Ranking:** Ranks candidates probabilistically based on multidimensional feature matrices.

---

### Slide 8: Why Deep Learning?
- **High-Dimensional Spatial Learning:** CNNs / Vision Encoders extract dense feature vectors representing object geometry, color distribution, and texture.
- **End-to-End Extraction:** Avoids manual hand-crafted feature engineering.

---

### Slide 9: Why NLP?
- **Text Processing:** Cleans, normalizes, and extracts structured entities (brand, color, location) from informal descriptions.

---

### Slide 10: Why Transformers & Self-Attention?
- **Contextual Embeddings:** Captures semantic meaning across sentence tokens via self-attention mechanisms.
- **Sentence-BERT:** Maps text into a continuous 384-dim embedding space where distance equals semantic difference.

---

### Slide 11: Why Generative AI?
- **Natural Language Explanations:** Explains *why* two items match in plain English.
- **Attribute Normalization:** Converts raw messy text into clean structured schema.
- **Synthetic Data Generation:** Produces paraphrased query variations for robustness testing.

---

### Slide 12: Dataset Design & Schema
- **Curated Dataset:** 16 paired lost/found records based on real SRM campus locations (UB, Tech Park, Java Canteen, Library).
- **Synthetic Paraphrases:** GenAI-generated query variations.
- **No Data Leakage:** Strict separation between lost queries and found candidate sets.

---

### Slide 13: Data Preprocessing Pipeline
- Text cleaning $\to$ Lowercasing $\to$ Entity parsing.
- Image resizing ($224\times224$) $\to$ ImageNet normalization.
- Coordinates $\to$ Haversine distance computation.

---

### Slide 14: Objective 1 — Semantic Text Matching
- Sentence-Transformer (`all-MiniLM-L6-v2`) dense vector encoding.
- Formula: $\text{Cosine Similarity} = \frac{A \cdot B}{\|A\| \|B\|}$.
- Outperforms exact keyword and TF-IDF matching on paraphrased descriptions.

---

### Slide 15: Objective 2 — Image Identification & Visual Similarity
- ResNet18 Feature Extractor / 3D RGB Color-Spatial Composite Extractor.
- Extracts 512-dim visual embeddings capturing color, shape, and structural texture.

---

### Slide 16: Objective 3 — Multimodal Fusion Engine
- Formula: $\text{Final Score} = w_1 S_{\text{text}} + w_2 S_{\text{image}} + w_3 S_{\text{location}} + w_4 S_{\text{time}} + w_5 S_{\text{attribute}}$
- Thresholds:
  - $\ge 0.75$: High Confidence Match
  - $0.55 - 0.74$: Possible Match
  - $< 0.55$: Low Confidence / No Match

---

### Slide 17: Model Architecture Diagram
- Dual Encoders (Text + Image) $\to$ Vector DB Index $\to$ Candidate Retrieval $\to$ Multimodal Fusion Engine $\to$ GenAI Reasoning $\to$ Alert Dispatched.

---

### Slide 18: System Architecture & Tech Stack
- **Backend:** FastAPI, Python, PyTorch, Scikit-Learn.
- **Vector DB:** Cosine Vector Index.
- **Frontend:** Glassmorphism Web App (HTML5, Vanilla JS, CSS3).

---

### Slide 19: Training & Fine-Tuning Strategy
- Fine-tuned Sentence-BERT using Multiple Negatives Ranking Loss (MNRL).
- Pretrained ImageNet CNN feature projection.
- Grid-search weight tuning on multimodal fusion parameters.

---

### Slide 20: Evaluation Metrics
- **Classification:** Accuracy, Precision, Recall, F1-Score.
- **Retrieval/Ranking:** Recall@1, Recall@3, Mean Reciprocal Rank (MRR).

---

### Slide 21: Experimental Results Table
| Model Architecture | Accuracy | Precision | Recall | F1 Score | Recall@1 | Recall@3 | MRR |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Baseline 1 (Keyword) | 0.125 | 0.000 | 0.000 | 0.000 | 0.875 | 1.000 | 0.937 |
| Baseline 2 (TF-IDF) | 0.250 | 1.000 | 0.250 | 0.400 | 1.000 | 1.000 | 1.000 |
| Baseline 3 (Transformer) | 0.000 | 0.000 | 0.000 | 0.000 | 1.000 | 1.000 | 1.000 |
| Baseline 4 (Image Only) | 0.250 | 0.250 | 1.000 | 0.400 | 0.250 | 0.625 | 0.493 |
| **Proposed Multimodal** | **1.000** | **1.000** | **1.000** | **1.000** | **1.000** | **1.000** | **1.000** |

---

### Slide 22: Generated Content & Analysis
- **Generated Component 1:** Natural Language Explanations grounded in similarity subscores.
- **Generated Component 2:** Automatic Description Normalization into JSON.
- **Generated Component 3:** Paraphrased description generation.

---

### Slide 23: Objective-to-Module Mapping
- Table mapping Objectives $\to$ AI Technique $\to$ Model $\to$ Input $\to$ Output $\to$ Evaluation.

---

### Slide 24: Demo Scenario Walkthrough
1. Student inputs lost report: "Lost dark blue Nike backpack at Tech Park."
2. Found report exists: "Found navy Nike bag near Java Canteen."
3. Multimodal engine calculates 94% text sim, 89% image sim, 93% location sim.
4. GenAI outputs evidence explanation.
5. In-App notification alert dispatched!

---

### Slide 25: Error Analysis & Limitations
- **False Positives:** Identical generic items (e.g. black bottles) require location verification.
- **Image Failure:** Blurry images default weights toward text and location.
- **Conflict Resolution:** System flags conflicting text/image evidence as "Possible Match".

---

### Slide 26: Responsible AI & Privacy
- **Probabilistic Wording:** "High-confidence potential match" rather than absolute ownership claims.
- **Human Verification:** Physical verification at SRM Security Desk mandatory.
- **Privacy:** Automatic blurring of detected human faces in images.

---

### Slide 27: Conclusion & Q&A
- **Summary:** SRM CampusFind proves multimodal AI + GenAI explanations significantly improve campus lost-and-found retrieval.
- **Questions & Discussion.**
