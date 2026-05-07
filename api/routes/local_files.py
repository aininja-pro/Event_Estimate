import re
from pathlib import Path

from fastapi import APIRouter
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


@router.post("/save-csv")
async def save_csv(request: SaveCsvRequest):
    try:
        downloads = Path.home() / "Downloads"
        downloads.mkdir(parents=True, exist_ok=True)
        target = unique_path(downloads, safe_filename(request.filename))
        target.write_text(request.csv_text, encoding="utf-8", newline="")
        return {"ok": True, "path": str(target), "filename": target.name}
    except Exception as exc:
        return JSONResponse(status_code=500, content={"ok": False, "error": str(exc)})
