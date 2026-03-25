import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.ai import router as ai_router

load_dotenv()

app = FastAPI(title="DriveShop AI API", version="1.0.0")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
extra_origins = os.getenv("EXTRA_CORS_ORIGINS", "").split(",")
allowed_origins = [frontend_url] + [o.strip() for o in extra_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
