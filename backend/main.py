"""
FastAPI Backend Server for SRM CampusFind.
Provides REST APIs for lost/found item submission, multimodal similarity search,
GenAI explanations, vector retrieval, notifications, and model evaluation metrics.
"""

import os
import json
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel

from src.preprocessing.text_cleaner import clean_text, extract_structured_attributes
from src.preprocessing.dataset_generator import generate_dataset
from src.text_matching.encoder import TransformerTextEncoder, compute_cosine_similarity
from src.image_matching.encoder import ImageEncoder
from src.multimodal.fusion import MultimodalFusionEngine, compute_location_similarity, compute_time_similarity, compute_attribute_similarity
from src.retrieval.vector_db import VectorDatabase
from src.genai.explanation_generator import GenAIExplanationEngine, GenAINormalizerEngine, GenAISyntheticDataGenerator
from src.notification.notifier import NotificationManager
from src.evaluation.evaluator import SystemEvaluator

app = FastAPI(
    title="SRM CampusFind API",
    description="Intelligent Multimodal Lost-and-Found System using GenAI",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Core AI Components
dataset = generate_dataset()
text_encoder = TransformerTextEncoder()
image_encoder = ImageEncoder()
fusion_engine = MultimodalFusionEngine()
notification_manager = NotificationManager(confidence_threshold=0.75)
vector_db = VectorDatabase()

# Populate Vector DB
corpus = [r["description"] for r in dataset]
text_encoder.fit_fallback(corpus)

for item in dataset:
    t_emb = text_encoder.encode(item["description"])
    i_emb = image_encoder.encode(item["image_filename"])
    vector_db.add_record(item, t_emb, i_emb)


class ReportItemRequest(BaseModel):
    status: str  # "LOST" or "FOUND"
    description: str
    category: Optional[str] = "other"
    brand: Optional[str] = "unknown"
    color: Optional[str] = "unspecified"
    location_name: str
    coordinates: Optional[List[float]] = [12.8231, 80.0442]
    timestamp: str
    image_filename: Optional[str] = "default_item.jpg"


class SearchMatchRequest(BaseModel):
    query_description: str
    target_status: str = "FOUND"
    category: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    coordinates: Optional[List[float]] = [12.8231, 80.0442]
    timestamp: Optional[str] = "2026-10-05T12:00:00"
    image_filename: Optional[str] = "default_item.jpg"
    weights: Optional[Dict[str, float]] = None


@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "SRM CampusFind AI Backend", "dataset_size": len(vector_db.records)}


@app.get("/api/dataset")
def get_dataset():
    return {"total_records": len(vector_db.records), "records": vector_db.records}


@app.post("/api/report/lost")
def report_lost_item(report: ReportItemRequest):
    new_id = f"LOST_{len(vector_db.records) + 101}"
    record = report.dict()
    record["id"] = new_id
    record["data_source"] = "USER_SUBMITTED"
    
    # Run GenAI normalization
    norm = GenAINormalizerEngine.normalize_description(report.description)
    record["category"] = norm["normalized_category"] if report.category == "other" else report.category
    
    t_emb = text_encoder.encode(record["description"])
    i_emb = image_encoder.encode(record["image_filename"])
    vector_db.add_record(record, t_emb, i_emb)
    
    return {"message": "Lost report created successfully", "record": record}


@app.post("/api/report/found")
def report_found_item(report: ReportItemRequest):
    new_id = f"FOUND_{len(vector_db.records) + 101}"
    record = report.dict()
    record["id"] = new_id
    record["data_source"] = "USER_SUBMITTED"
    
    t_emb = text_encoder.encode(record["description"])
    i_emb = image_encoder.encode(record["image_filename"])
    vector_db.add_record(record, t_emb, i_emb)
    
    return {"message": "Found report created successfully", "record": record}


@app.post("/api/search/matches")
def search_matches(req: SearchMatchRequest):
    """
    Multimodal Match Search API:
    1. Encodes query text & image.
    2. Retrieves top-K nearest candidates from Vector DB.
    3. Computes multimodal similarity scores & classifications.
    4. Generates GenAI evidence explanations.
    5. Triggers notification if score >= threshold.
    """
    q_t_emb = text_encoder.encode(req.query_description)
    q_i_emb = image_encoder.encode(req.image_filename)
    
    # Configure custom fusion weights if provided
    custom_fusion = MultimodalFusionEngine(req.weights) if req.weights else fusion_engine
    
    # 1. Vector Retrieval
    candidates = vector_db.search(q_t_emb[0], q_i_emb[0], target_status=req.target_status, top_k=5)
    
    match_results = []
    
    query_record = {
        "description": req.query_description,
        "category": req.category,
        "color": req.color,
        "brand": req.brand,
        "coordinates": req.coordinates,
        "timestamp": req.timestamp
    }
    
    for rec, t_sim, i_sim in candidates:
        loc_sim = compute_location_similarity(req.coordinates, rec.get("coordinates", [12.8231, 80.0442]))
        time_sim = compute_time_similarity(req.timestamp, rec.get("timestamp", "2026-10-05T12:00:00"))
        attr_sim = compute_attribute_similarity(query_record, rec)
        
        # 2. Multimodal Fusion
        fused = custom_fusion.fuse(t_sim, i_sim, loc_sim, time_sim, attr_sim)
        
        # 3. GenAI Explanation
        explanation = GenAIExplanationEngine.generate_explanation(query_record, rec, fused)
        
        # 4. Notification Check
        notif = notification_manager.process_match_result(query_record, rec, fused, explanation)
        
        # 5. Ablation Breakdown
        ablation = custom_fusion.run_ablation(t_sim, i_sim, loc_sim, time_sim, attr_sim)
        
        match_results.append({
            "candidate_record": rec,
            "multimodal_score": fused["final_score"],
            "classification": fused["classification"],
            "subscores": fused["subscores"],
            "ablation_study": ablation,
            "genai_explanation": explanation["explanation_text"],
            "evidence_grounding": explanation["evidence_grounding"],
            "notification_alert": notif["triggered"]
        })
        
    # Sort final output by multimodal score
    match_results.sort(key=lambda x: x["multimodal_score"], reverse=True)
    return {
        "query": query_record,
        "total_matches_found": len(match_results),
        "matches": match_results
    }


@app.get("/api/notifications")
def get_notifications():
    return {"notifications": notification_manager.get_all_notifications()}


@app.get("/api/evaluation")
def get_evaluation_metrics():
    evaluator = SystemEvaluator(vector_db.records)
    return evaluator.evaluate_all()


@app.post("/api/synthetic/generate")
def generate_synthetic_samples(item: str, color: str, brand: str, location: str):
    variations = GenAISyntheticDataGenerator.generate_synthetic_samples(item, color, brand, location)
    return {"original": f"{color} {brand} {item} lost near {location}", "synthetic_paraphrases": variations}


# Serve Frontend Web App
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

@app.get("/", response_class=HTMLResponse)
def serve_index():
    index_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>SRM CampusFind API Running. Frontend index.html not found.</h1>"
