import os
import time
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from .schemas import (
    ParsedResumeResponse,
    EmbedRequest,
    EmbedResponse,
    MatchRequest,
    MatchResponse,
)
from .parsers.resume_parser import ResumeParser
from .embeddings.embedder import embedder, DIMENSIONS, MODEL_NAME
from .matching.scorer import MatchingEngine

app = FastAPI(
    title="AI Job Agent - AI & Matching Service",
    description="Multilingual CV Parsing, Semantic Vector Embeddings, and Explainable Matching Engine for Germany & EU",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "uptime_seconds": int(time.time() - START_TIME),
        "embedding_model": MODEL_NAME,
        "embedding_dimensions": DIMENSIONS,
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.post("/parse-resume", response_model=ParsedResumeResponse)
async def parse_resume(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None)
):
    text_content = ""
    if file:
        file_bytes = await file.read()
        filename = (file.filename or "").lower()
        if filename.endswith(".pdf"):
            text_content = ResumeParser.extract_text_from_pdf(file_bytes)
        elif filename.endswith(".docx") or filename.endswith(".doc"):
            text_content = ResumeParser.extract_text_from_docx(file_bytes)
        else:
            text_content = file_bytes.decode('utf-8', errors='ignore')
    elif raw_text:
        text_content = raw_text
    else:
        raise HTTPException(status_code=400, detail="Either file or raw_text must be provided")

    if not text_content.strip():
        raise HTTPException(status_code=422, detail="Extracted text is empty")

    parsed = ResumeParser.parse(text_content)
    return parsed

@app.post("/embed", response_model=EmbedResponse)
def generate_embeddings(request: EmbedRequest):
    if not request.texts:
        raise HTTPException(status_code=400, detail="Texts list cannot be empty")
    
    embeddings = embedder.embed_texts(request.texts)
    return EmbedResponse(
        embeddings=embeddings,
        dimensions=DIMENSIONS,
        model_version=MODEL_NAME
    )

@app.post("/match", response_model=MatchResponse)
def compute_job_match(request: MatchRequest):
    return MatchingEngine.compute_match(
        candidate=request.candidate,
        job=request.job,
        weights=request.weights
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
