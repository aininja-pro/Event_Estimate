# Architecture

**Analysis Date:** 2026-02-08

## Pattern Overview

**Overall:** Sequential ETL Pipeline (Extract-Transform-Load)

**Key Characteristics:**
- Multi-stage batch data processing (4 sequential scripts)
- Self-contained modules with no cross-script imports
- Data handoff via JSON/XLSX files between stages
- File-based state (no database)

## Layers

**Data Acquisition Layer:**
- Purpose: Download estimate XLSX files from URLs in the master project list
- Contains: URL extraction, HTTP downloads, duplicate filename handling, rate limiting
- Location: `download_estimates.py`
- Depends on: `requests` library, `DriveShop_Project_List.xlsx`
- Used by: All downstream stages (produces `historical_estimates/` directory)

**Structure Discovery Layer:**
- Purpose: Initial scan of all files to understand structure patterns
- Contains: Sheet enumeration, header detection, keyword categorization
- Location: `catalog_estimates.py`
- Depends on: `historical_estimates/` directory, `openpyxl`
- Used by: Informed design of extraction logic

**Format Detection & Extraction Layer:**
- Purpose: Comprehensive 5-phase analysis of each estimate file
- Contains: Format classification (FORMAT_A/B/UNKNOWN), metadata extraction, financial extraction, section detection, labor role extraction
- Location: `extract_estimates.py`
- Depends on: `historical_estimates/` directory, `openpyxl`
- Used by: Reference output; superseded by enrichment stage

**Integration & Enrichment Layer:**
- Purpose: Master data integration combining project list metadata with detailed extraction
- Contains: Project list parsing, corrected section detection, join logic, rate card extraction, financial summaries
- Location: `rescan_and_enrich.py`
- Depends on: `historical_estimates/` directory, `DriveShop_Project_List.xlsx`, `openpyxl`
- Used by: Downstream analysis (produces master dataset)

## Data Flow

**ETL Pipeline Execution:**

1. `download_estimates.py` reads URLs from `DriveShop_Project_List.xlsx`
2. Downloads 1,703 XLSX files to `historical_estimates/`
3. `catalog_estimates.py` scans all files for structure patterns
4. Outputs `inventory_report.json` with file-by-file structure
5. `extract_estimates.py` performs 5-phase analysis per file
6. Classifies FORMAT_A (1,039), FORMAT_B (596), FORMAT_UNKNOWN (24)
7. Outputs `extract_estimates.json` with detailed extraction
8. `rescan_and_enrich.py` re-scans with corrected logic + joins project metadata
9. Outputs `enriched_master_index.json` (12 MB master dataset)

**State Management:**
- File-based: All state lives on disk as JSON/XLSX files
- No persistent in-memory state between script runs
- Each script is independently executable

## Key Abstractions

**Safe Value Extraction:**
- Purpose: Robust handling of None/invalid values from Excel cells
- Functions: `sf(val)` (Safe Float, returns 0.0), `ss(val)` (Safe String, returns None)
- Location: `extract_estimates.py`, `rescan_and_enrich.py` (duplicated)
- Pattern: Defensive conversion at data boundary

**Grid-Based Cell Caching:**
- Purpose: Performance-optimized Excel data access
- Functions: `load_sheet_data()` in `extract_estimates.py`, `load_sheet_grid()` in `rescan_and_enrich.py`
- Pattern: Single `iter_rows()` pass into `{(row, col): value}` dict, then random access from cache
- Impact: Reduced 1,681 file processing from 30+ min to ~4 min

**Format Classification:**
- Purpose: Detect which template layout an estimate file uses
- Function: `detect_format()` in `extract_estimates.py`, format detection in `rescan_and_enrich.py`
- Categories: FORMAT_A (Overview+Templates+Brands), FORMAT_B (P&L summary), FORMAT_UNKNOWN (payouts)

**Section Whitelist:**
- Purpose: Canonical cost section names for normalization
- Location: `rescan_and_enrich.py` (lines 32-63)
- Sections: PLANNING & ADMINISTRATION, ACCESS/SPONSORSHIP FEES, ONSITE LABOR ACTIVITY, TRAVEL EXPENSES, CREATIVE COSTS, PRODUCTION EXPENSES, LOGISTICS EXPENSES, OTHER

## Entry Points

**`download_estimates.py`:**
- Triggers: Manual execution (`python download_estimates.py`)
- Responsibilities: Read URLs from project list, download XLSX files, log errors

**`catalog_estimates.py`:**
- Triggers: Manual execution after download stage
- Responsibilities: Scan all XLSX files, catalog structure, output inventory

**`extract_estimates.py`:**
- Triggers: Manual execution after catalog stage
- Responsibilities: Classify formats, extract metadata/financials/sections/roles

**`rescan_and_enrich.py`:**
- Triggers: Manual execution after extract stage
- Responsibilities: Parse project list, re-scan with corrected logic, join datasets, generate summaries

## Error Handling

**Strategy:** Try-except per file, accumulate errors, continue processing all files

**Patterns:**
- Each script wraps per-file processing in `try/except Exception`
- Errors logged with full traceback to dedicated log files
- Error count reported in console summary
- 22 known error files (mileage tracking spreadsheets with invalid XML)
- No retry mechanisms

## Cross-Cutting Concerns

**Logging:**
- `print()` for progress output (every 100 files)
- Dedicated `*_errors.log` files for error tracking
- No structured logging framework

**Validation:**
- Defensive `sf()`/`ss()` functions at data extraction boundary
- Whitelist-based section detection (exact match)
- No formal input validation for file formats

**Performance:**
- Grid-based caching pattern (critical optimization)
- `read_only=True` mode for openpyxl
- Batch progress reporting every 100 files

---

*Architecture analysis: 2026-02-08*
*Update when major patterns change*
