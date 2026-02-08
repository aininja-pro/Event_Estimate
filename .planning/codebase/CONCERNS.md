# Codebase Concerns

**Analysis Date:** 2026-02-08

## Tech Debt

**Duplicate Utility Functions:**
- Issue: `sf()` and `ss()` defined identically in both `extract_estimates.py` (lines 45-60) and `rescan_and_enrich.py` (lines 72-87)
- Why: Each script is self-contained with no shared module
- Impact: Bug fixes must be applied in multiple places
- Fix approach: Extract into shared `utils.py` module

**Hardcoded Column Indices (Magic Numbers):**
- Issue: Column positions referenced by integer throughout extraction logic
- Files: `extract_estimates.py` (e.g., line 308: `sf(grid.get((row_idx, 8)))`), `rescan_and_enrich.py`
- Why: Rapid prototyping, column positions are fixed per format
- Impact: Fragile to format changes; no single source of truth for column mappings
- Fix approach: Define column mapping constants at module level (e.g., `COL_COST = 8`)

**No Dependency Management:**
- Issue: No `requirements.txt`, `setup.py`, or `pyproject.toml`
- Dependencies used: `openpyxl`, `requests` (not formally declared)
- Why: Quick scripts not packaged for distribution
- Impact: Difficult to reproduce environment; version conflicts possible
- Fix approach: Create `requirements.txt` with pinned versions

**Hardcoded Configuration:**
- Issue: All paths, filenames, and constants hardcoded at module level
- Files: All 4 scripts (`INPUT_DIR`, `OUTPUT_DIR`, `EXCEL_FILE`, etc.)
- Why: Single-use scripts, no environment variation needed
- Impact: Hard to customize for different datasets
- Fix approach: Add CLI argument parsing or config file

## Known Bugs

**Corrupted Excel Files (22 files):**
- Symptoms: `ValueError: Max value is 14` from openpyxl stylesheet parsing
- Trigger: Opening mileage tracking spreadsheets with invalid XML stylesheets
- Files affected: 22 of 1,703 files (1.3% error rate)
- Workaround: Files silently fail, logged to error files, processing continues
- Root cause: openpyxl cannot parse font family values > 14 in corrupted stylesheets
- Fix: Add file-type detection to skip/quarantine mileage tracking files before load

## Security Considerations

**No Security Concerns:**
- No credentials, API keys, or secrets in codebase
- No user input validation needed (batch processing of local files)
- No network-facing services
- Downloads use public URLs with no authentication

## Performance Bottlenecks

**Grid Loading Over-fetches Columns:**
- Problem: `load_sheet_data()` loads all columns up to `MAX_COLS_TO_LOAD=26` but often only uses columns 1-2
- File: `extract_estimates.py` (line 71), `rescan_and_enrich.py` (line 195)
- Cause: Defensive approach to ensure all needed columns are captured
- Improvement path: Profile actual column usage per function; load only needed columns

**O(n^2) Section Detection:**
- Problem: For each section, iterates through `col_b_rows` again inside loop
- File: `rescan_and_enrich.py` (lines 302-327)
- Cause: Double loop over rows when single pass would suffice
- Improvement path: Refactor to single-pass row scanning with section boundary tracking

## Fragile Areas

**Format Detection Heuristics:**
- File: `extract_estimates.py` (`detect_format()`), `rescan_and_enrich.py` (lines 206-252)
- Why fragile: Checks for GL codes (float 1000-9999) in column A could falsely match
- Common failures: Misclassification leads to incorrect section/financial extraction
- Safe modification: Add additional validation signals beyond GL code range check
- Test coverage: No tests

**Section Detection Logic:**
- File: `rescan_and_enrich.py` (lines 270-350)
- Why fragile: Relies on exact text matching of section headers in specific columns
- Common failures: New section naming variants not in whitelist get missed
- Safe modification: Only modify `SECTION_WHITELIST` and `SECTION_ALIASES` constants
- Test coverage: No tests; only ~48 files have explicit section headers

## Scaling Limits

**Memory:**
- Current: Grid cache per sheet (~200 rows x 26 cols = manageable)
- Limit: Would need refactoring for sheets with 10,000+ rows
- Symptoms: Memory pressure if processing sheets with very large row counts
- Scaling path: Stream processing or chunked loading

## Dependencies at Risk

**openpyxl:**
- Risk: Known bugs with corrupted stylesheets (affects 22 files)
- Impact: Cannot process certain XLSX files
- Migration plan: No alternative needed; issue is in source files, not library

## Missing Critical Features

**No Shared Utilities Module:**
- Problem: Each script duplicates utility functions
- Current workaround: Copy-paste between files
- Blocks: Clean refactoring and code reuse
- Implementation complexity: Low (extract `sf`, `ss`, `load_sheet_grid` to `utils.py`)

## Test Coverage Gaps

**Zero Test Suite:**
- What's not tested: All extraction logic, format detection, financial calculations
- Risk: Regressions not caught; section detection changes could silently break extraction
- Priority: High for format detection and financial extraction
- Difficulty to test: Need sample XLSX fixtures per format type

**Financial Calculations:**
- What's not tested: `extract_financial_summary_a()`, `extract_financial_summary_b()`, margin calculations
- Risk: Incorrect financial aggregations could go unnoticed
- Priority: High (correctness-critical)
- Difficulty to test: Medium (need golden datasets with known correct values)

## Error Handling Issues

**Broad Exception Catching:**
- Issue: All scripts use `except Exception as e:` - catches everything including `KeyboardInterrupt`
- Files: `download_estimates.py` (line 64), `catalog_estimates.py` (line 95), `extract_estimates.py` (line 643), `rescan_and_enrich.py` (line 653)
- Impact: Cannot cleanly interrupt processing with Ctrl+C
- Fix: Use specific exception types (e.g., `except (IOError, ValueError, openpyxl.utils.exceptions.InvalidFileException):`)

**Silent Type Conversion:**
- Issue: `sf()` returns 0.0 for any non-float value, masking data quality issues
- Files: `extract_estimates.py` (lines 45-52), `rescan_and_enrich.py` (lines 72-79)
- Impact: Missing values indistinguishable from actual zeros in financial totals
- Fix: Return `None` for missing values, 0.0 only for explicit zeros

**No Network Retry Logic:**
- Issue: `requests.get()` called once per URL with no retry mechanism
- File: `download_estimates.py` (line 55)
- Impact: Transient network failures cause permanent data gaps
- Fix: Add retry with exponential backoff (e.g., `urllib3.util.retry`)

---

*Concerns audit: 2026-02-08*
*Update as issues are fixed or new ones discovered*
