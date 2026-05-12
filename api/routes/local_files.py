import re
import os
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/local-files")


class SaveCsvRequest(BaseModel):
    filename: str
    csv_text: str


def safe_filename(filename: str) -> str:
    name = Path(filename).name.strip() or "intacct_upload.csv"
    name = re.sub(r"[^A-Za-z0-9._ -]+", "_", name)
    if not name.lower().endswith(".csv"):
        name += ".csv"
    return name


def unique_path(directory: Path, filename: str) -> Path:
    path = directory / filename
    if not path.exists():
        return path

    stem = path.stem
    suffix = path.suffix
    for i in range(1, 1000):
        candidate = directory / f"{stem} ({i}){suffix}"
        if not candidate.exists():
            return candidate

    return directory / f"{stem} ({path.stat().st_mtime_ns}){suffix}"


def local_file_save_enabled(request: Request) -> bool:
    if os.getenv("ENABLE_LOCAL_FILE_SAVE", "").lower() != "true":
        return False
    if os.getenv("ENVIRONMENT", os.getenv("APP_ENV", "development")).lower() == "production":
        return False
    host = request.client.host if request.client else ""
    return host in {"127.0.0.1", "::1", "localhost"}


@router.post("/save-csv")
async def save_csv(request: Request, payload: SaveCsvRequest):
    """Dev-only helper for local browser environments that block blob downloads."""
    if not local_file_save_enabled(request):
        raise HTTPException(status_code=403, detail="Local file save is disabled. Use browser download.")

    try:
        target_dir = Path(os.getenv("LOCAL_FILE_SAVE_DIR", str(Path.home() / "Downloads"))).expanduser()
        target_dir.mkdir(parents=True, exist_ok=True)
        target = unique_path(target_dir, safe_filename(payload.filename))
        target.write_text(payload.csv_text, encoding="utf-8", newline="")
        return {"ok": True, "path": str(target), "filename": target.name}
    except Exception as exc:
        return JSONResponse(status_code=500, content={"ok": False, "error": str(exc)})
