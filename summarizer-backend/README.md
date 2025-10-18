# Summarizer Backend (FastAPI)

## 1) Setup (Windows PowerShell)
```powershell
cd summarizer-backend
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
```

> If Torch installation fails on Windows, use the CPU wheel:
```powershell
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

## 2) Run
```powershell
uvicorn main:app --reload --port 8000
```

Open http://localhost:8000/docs and try **POST /summarize**.

## 3) Example (PowerShell)
```powershell
$body = @{ text = "Paste a very long text here..." } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:8000/summarize -ContentType "application/json" -Body $body
```

## Notes
- First call may download the model (internet needed once). Next calls will be faster.
- CORS is enabled for local dev (to connect a frontend on another port).
- The model used is `sshleifer/distilbart-cnn-12-6`. You can switch to BART-large later.
