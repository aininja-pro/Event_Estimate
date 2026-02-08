# Coding Conventions

**Analysis Date:** 2026-02-08

## Naming Patterns

**Files:**
- snake_case for all files (`download_estimates.py`, `rescan_and_enrich.py`)
- Pattern: `action_noun.py` for scripts, `descriptor_type.json` for outputs

**Functions:**
- snake_case for all functions (`load_sheet_data()`, `classify_tab()`, `extract_metadata()`, `detect_format()`)
- Short abbreviations for utility helpers: `sf()` (Safe Float), `ss()` (Safe String)
- No special prefix for async functions (none used)

**Variables:**
- snake_case for variables (`input_dir`, `output_json`, `error_log`, `sheet_names`, `grid`, `row_count`)
- UPPER_SNAKE_CASE for constants (`AUTO_BRANDS`, `STRUCTURAL_TABS`, `SECTION_WHITELIST`, `MAX_ROWS_TO_LOAD`)

**Types:**
- No type hints used anywhere in the codebase

## Code Style

**Formatting:**
- 4-space indentation (Python standard)
- Line length generally under 100 characters
- No formatting tool configured (no `.editorconfig`, `.flake8`, `pyproject.toml`)

**Quotes:**
- Double quotes for strings (consistent throughout)
- Triple double quotes for docstrings

**Linting:**
- No linting tools configured
- No type checking (mypy, pyright)

## Import Organization

**Order:**
1. Standard library (`os`, `json`, `re`, `sys`, `traceback`, `collections`, `statistics`)
2. Third-party packages (`openpyxl`, `requests`)

**Grouping:**
- No blank lines between import groups (all imports listed sequentially)
- No path aliases

## Error Handling

**Patterns:**
- `try/except Exception` wrapping per-file processing in main loops
- Errors accumulated in list, processing continues
- Full traceback written to dedicated log files
- Error count reported in console summary

**Error Types:**
- Broad `except Exception as e:` used everywhere (no specific exception types)
- Errors logged but never re-raised

**Logging:**
- `print()` for progress and summary output
- Dedicated `*_errors.log` files per script with full tracebacks

## Logging

**Framework:**
- `print()` for all output (no logging library)

**Patterns:**
- Progress reporting every 100 files: `print(f"  {i}/{total} scanned ({len(errors)} errors)")`
- Section separators using `"=" * 70`
- Phase markers: `# Phase 1: Classify all tabs`

## Comments

**When to Comment:**
- Module-level docstrings for purpose and performance notes
- Section markers: `# --- Constants ---`, `# ========== MAIN ==========`
- Phase markers: `# Phase 1: Classify all tabs`, `# Phase 2: Extract metadata`
- Inline comments for column references: `# H` (column H)

**Docstrings:**
- Module docstrings present (multiline `"""..."""`)
- Function docstrings brief with Returns section when applicable
- Example: `load_sheet_data()`: "Load all cell data from a sheet in a single pass. Returns: (grid, row_count)"

**TODO Comments:**
- None found in codebase

## Function Design

**Size:**
- Functions range from 10-80 lines
- Main processing blocks are larger (100+ lines in some cases)

**Parameters:**
- Typically 2-4 parameters
- Grid dict and row/column indices are common parameter patterns

**Return Values:**
- Tuples for multi-value returns: `return (grid, row_count)`
- Dicts for structured data: `return file_info`
- Lists for collections

## Module Design

**Exports:**
- Not applicable (scripts are self-contained, not imported)

**Cross-Module Sharing:**
- None - each script is completely independent
- Utility functions (`sf()`, `ss()`) duplicated across scripts
- Data handoff via JSON files on disk

---

*Convention analysis: 2026-02-08*
*Update when patterns change*
