from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Summarizer API", version="1.0.0")

# Allow local frontends (e.g., Vite @ 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load once (fast, small model)
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

class SumRequest(BaseModel):
    text: str
    max_words: int | None = 120

@app.get("/")
def health():
    return {"ok": True}

@app.post("/summarize")
def summarize(req: SumRequest):
    text = req.text.strip()
    if not text:
        return {"summary": ""}

    # Basic chunking to avoid length issues
    max_chunk = 900
    chunks = [text[i:i+max_chunk] for i in range(0, len(text), max_chunk)]

    pieces = []
    for c in chunks:
        out = summarizer(c, max_length=180, min_length=60, do_sample=False)[0]["summary_text"]
        pieces.append(out)

    merged = " ".join(pieces)
    final = summarizer(merged, max_length=220, min_length=60, do_sample=False)[0]["summary_text"]
    return {"summary": final}
