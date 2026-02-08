# External Integrations

**Analysis Date:** 2026-02-08

## APIs & External Services

**HTTP File Downloads:**
- Direct URL downloads - Fetching XLSX estimate files from web URLs
  - Client: `requests.get(url, timeout=30)` - `download_estimates.py`
  - Auth: None (public URLs)
  - Rate limiting: `DELAY = 0.5` seconds between requests - `download_estimates.py`

**Payment Processing:**
- Not applicable

**Email/SMS:**
- Not applicable

**External APIs:**
- Not applicable

## Data Storage

**Databases:**
- None - All data stored as local files (XLSX input, JSON output)

**File Storage:**
- Local filesystem only
  - Input: `historical_estimates/` directory (1,703 XLSX files)
  - Input: `DriveShop_Project_List.xlsx` (master project list)
  - Output: Multiple JSON files in project root
  - Logs: `*_errors.log` files in project root

**Caching:**
- In-memory only - Grid-based cell caching during XLSX processing (`extract_estimates.py`, `rescan_and_enrich.py`)

## Authentication & Identity

**Auth Provider:**
- Not applicable (no authentication required)

**OAuth Integrations:**
- Not applicable

## Monitoring & Observability

**Error Tracking:**
- File-based error logging:
  - `download_errors.log` - `download_estimates.py`
  - `catalog_errors.log` - `catalog_estimates.py`
  - `extract_errors.log` - `extract_estimates.py`
  - `rescan_errors.log` - `rescan_and_enrich.py`

**Analytics:**
- Not applicable

**Logs:**
- Console output via `print()` (progress reporting every 100 files)
- Error logs to dedicated `.log` files with full tracebacks

## CI/CD & Deployment

**Hosting:**
- Not deployed - Local batch processing only

**CI Pipeline:**
- Not applicable

## Environment Configuration

**Development:**
- No environment variables required
- No secrets or credentials needed
- All configuration hardcoded in script constants

**Staging:**
- Not applicable

**Production:**
- Not applicable (local processing only)

## Webhooks & Callbacks

**Incoming:**
- Not applicable

**Outgoing:**
- Not applicable

---

*Integration audit: 2026-02-08*
*Update when adding/removing external services*
