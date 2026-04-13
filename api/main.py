import os

from dotenv import load_dotenv

# Load .env BEFORE any route/service imports — several services read env vars
# at module load time (e.g. email_service sets resend.api_key on import).
load_dotenv(override=True)

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from routes.ai import router as ai_router  # noqa: E402
from routes.approval import router as approval_router  # noqa: E402
from routes.email import router as email_router  # noqa: E402
from routes.pdf import router as pdf_router  # noqa: E402


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
app.include_router(pdf_router)
app.include_router(approval_router)
app.include_router(email_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
