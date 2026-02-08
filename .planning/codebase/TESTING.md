# Testing Patterns

**Analysis Date:** 2026-02-08

## Test Framework

**Runner:**
- None configured - No formal test framework present

**Assertion Library:**
- Not applicable

**Run Commands:**
```bash
# No test commands available
# Scripts run directly: python extract_estimates.py
```

## Test File Organization

**Location:**
- No test files exist in the codebase

**Naming:**
- Not applicable

**Structure:**
- Not applicable

## Embedded Validation Approach

In lieu of a test suite, validation is embedded in the scripts themselves:

**Error Accumulation Pattern:**
- Each script wraps per-file processing in `try/except`
- Errors collected in list, processing continues
- Full traceback logged to dedicated error files
- Used in: `download_estimates.py`, `catalog_estimates.py`, `extract_estimates.py`, `rescan_and_enrich.py`

**Progress Reporting:**
- Batch progress every 100 files with error count
- Example: `extract_estimates.py`: `print(f"  {i}/{total} scanned ({len(errors)} errors)")`

**Join Verification:**
- `rescan_and_enrich.py` tracks matched, scan-only, and list-only records
- Outputs `join_report.json` with join statistics

## Data Validation Patterns

**Type Safety:**
- No type hints or static analysis
- Defensive runtime conversion via `sf()` (Safe Float) and `ss()` (Safe String)
- `sf(val)` returns 0.0 for any non-float value
- `ss(val)` returns None for empty/TBA values

**Null/Empty Checks:**
- Pervasive throughout code
- Pattern: `if any(cell is not None for cell in row):`

**Data Quality:**
- Whitelist-based section validation (`SECTION_WHITELIST` in `rescan_and_enrich.py`)
- Format classification validation (FORMAT_A/B/UNKNOWN detection)

## Coverage

**Requirements:**
- No coverage requirements (no tests exist)

**Critical Functions Without Tests:**
- `extract_sections()` - Complex multi-step section detection
- `detect_format()` - Format classification logic
- `extract_financial_summary_a()` / `extract_financial_summary_b()` - Financial data correctness
- `load_sheet_data()` / `load_sheet_grid()` - Core data loading
- `classify_tab()` - Tab classification

## Output Verification

**JSON Schema Consistency:**
- Output JSON files follow consistent structure per script
- `file_info` dict schema defined in `extract_estimates.py`
- Aggregation summaries maintain consistent keys

**Error Collection:**
- All scripts collect and report error counts
- Known: 22 files always error (mileage tracking with invalid XML)
- Error rate: ~1.3% (22/1,703 files)

## Recommendations

**If adding tests, candidates for TDD:**
- `sf()` / `ss()` - Pure functions with defined inputs/outputs
- `detect_format()` - Classification with testable heuristics
- `extract_sections()` - Complex parsing with expected outputs
- Format-specific financial extraction functions

**Testing approach that would fit:**
- pytest with fixture files (sample XLSX files per format)
- Golden file testing (expected JSON output vs actual)
- Unit tests for utility functions (`sf`, `ss`, `classify_tab`)

---

*Testing analysis: 2026-02-08*
*Update when test patterns change*
