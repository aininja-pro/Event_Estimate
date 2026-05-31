import os

from dotenv import load_dotenv

# Load .env BEFORE any route/service imports — several services read env vars
# at module load time (e.g. email_service sets resend.api_key on import).
load_dotenv(override=True)

# WeasyPrint's native libraries are installed under Homebrew on local macOS
# machines. Make that path discoverable before any PDF route lazy-imports it.
if "DYLD_FALLBACK_LIBRARY_PATH" not in os.environ and os.path.exists("/opt/homebrew/lib"):
    os.environ["DYLD_FALLBACK_LIBRARY_PATH"] = "/opt/homebrew/lib"

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from routes.ai import router as ai_router  # noqa: E402
from routes.approval import router as approval_router  # noqa: E402
from routes.data_feed import router as data_feed_router  # noqa: E402
from routes.email import router as email_router  # noqa: E402
from routes.local_files import router as local_files_router  # noqa: E402
from routes.pdf import router as pdf_router  # noqa: E402


app = FastAPI(title="DriveShop AI API", version="1.0.0")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
extra_origins = os.getenv("EXTRA_CORS_ORIGINS", "").split(",")
default_dev_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
allowed_origins = list(dict.fromkeys(
    [frontend_url, *default_dev_origins, *[o.strip() for o in extra_origins if o.strip()]]
))

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
app.include_router(data_feed_router)
app.include_router(local_files_router)


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "client_approval_email_enabled": os.getenv("CLIENT_APPROVAL_EMAIL_ENABLED", "false").strip().lower() == "true",
    }
