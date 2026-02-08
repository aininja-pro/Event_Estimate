# Technology Stack

**Analysis Date:** 2026-02-08

## Languages

**Primary:**
- Python 3.12+ - All application code (`download_estimates.py`, `catalog_estimates.py`, `extract_estimates.py`, `rescan_and_enrich.py`)

**Secondary:**
- None

## Runtime

**Environment:**
- Python 3.12.5
- No browser runtime (CLI scripts only)

**Package Manager:**
- pip (standard Python)
- No `requirements.txt` or `pyproject.toml` present (dependencies not formally declared)

## Frameworks

**Core:**
- None (vanilla Python scripts, no web framework)

**Testing:**
- None (no test framework configured)

**Build/Dev:**
- None (scripts run directly via `python`)

## Key Dependencies

**Critical:**
- `openpyxl` (v3.x inferred) - Excel/XLSX file reading and processing; primary data source format
  - Used in: `download_estimates.py`, `catalog_estimates.py`, `extract_estimates.py`, `rescan_and_enrich.py`
- `requests` - HTTP client for downloading estimate files from URLs
  - Used in: `download_estimates.py`

**Standard Library (heavily used):**
- `collections` (Counter, defaultdict) - Data aggregation throughout all scripts
- `json` - JSON serialization for all output files
- `re` - Regular expressions for text pattern matching
- `os` - File and directory operations
- `statistics` - Statistical calculations (mean, median) for rate cards
- `traceback` - Exception reporting to error logs

## Configuration

**Environment:**
- No environment variables used
- All configuration via hardcoded constants at module level:
  - `INPUT_DIR = "historical_estimates/"` - all scripts
  - `EXCEL_FILE = "DriveShop Project List.xlsx"` - `download_estimates.py`, `rescan_and_enrich.py`
  - Output JSON filenames and error log paths defined per-script

**Build:**
- No build configuration (scripts run directly)

## Platform Requirements

**Development:**
- Any platform with Python 3.12+ (macOS/Linux/Windows)
- No external services required (local file processing)

**Production:**
- Not deployed — runs as local batch processing scripts
- Requires ~2GB disk for 1,703 XLSX files + JSON outputs

---

*Stack analysis: 2026-02-08*
*Update after major dependency changes*
