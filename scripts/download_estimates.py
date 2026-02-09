#!/usr/bin/env python3
"""Download estimate spreadsheets from JotForm URLs in the Project List."""

import os
import sys
import time
from urllib.parse import unquote

import openpyxl
import requests

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_LIST = os.path.join(PROJECT_ROOT, "DriveShop_Project_List.xlsx")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "historical_estimates")

# Pass --test to only download first 5 files
TEST_MODE = "--test" in sys.argv


def extract_urls(path):
    """Read column B from the Project List and return list of (url, filename) tuples."""
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active

    urls = []
    skipped = []
    for row in ws.iter_rows(min_row=2, min_col=2, max_col=2, values_only=True):
        cell_val = row[0]
        if not cell_val or not str(cell_val).strip().startswith("http"):
            continue
        # Some cells contain multiple URLs separated by newlines
        for url in str(cell_val).strip().split("\n"):
            url = url.strip()
            if not url.startswith("http"):
                continue
            filename = unquote(url.split("/")[-1])
            if not filename.lower().endswith(".xlsx"):
                skipped.append(filename)
                continue
            urls.append((url, filename))

    wb.close()
    return urls, skipped


def download_files(urls, output_dir, test_mode=False):
    """Download files from URL list into output_dir."""
    os.makedirs(output_dir, exist_ok=True)

    if test_mode:
        urls = urls[:5]
        print(f"TEST MODE: downloading first {len(urls)} files only")

    total = len(urls)
    downloaded = 0
    failures = []
    already_exists = 0

    for i, (url, filename) in enumerate(urls, 1):
        dest = os.path.join(output_dir, filename)

        if os.path.exists(dest):
            already_exists += 1
            downloaded += 1
            if i % 50 == 0 or test_mode:
                print(f"[{i}/{total}] Already exists: {filename}")
            continue

        try:
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            with open(dest, "wb") as f:
                f.write(resp.content)
            downloaded += 1
            if i % 50 == 0 or test_mode:
                print(f"[{i}/{total}] Downloaded: {filename}")
        except Exception as e:
            failures.append((filename, str(e)))
            print(f"[{i}/{total}] FAILED: {filename} — {e}")

        # Small delay to avoid hammering the server
        if not test_mode and i % 100 == 0:
            time.sleep(1)

    return downloaded, failures, already_exists


def main():
    print(f"Reading Project List: {PROJECT_LIST}")
    urls, skipped = extract_urls(PROJECT_LIST)
    print(f"Found {len(urls)} xlsx URLs, {len(skipped)} non-xlsx skipped")

    if skipped:
        print(f"Skipped non-xlsx files: {skipped[:5]}...")

    print(f"\nDownloading to: {OUTPUT_DIR}")
    downloaded, failures, already_exists = download_files(urls, OUTPUT_DIR, TEST_MODE)

    print(f"\n--- RESULTS ---")
    print(f"Total xlsx URLs: {len(urls)}")
    print(f"Downloaded: {downloaded}")
    print(f"Already existed: {already_exists}")
    print(f"Failures: {len(failures)}")
    if failures:
        print("Failed files:")
        for fn, err in failures:
            print(f"  {fn}: {err}")

    # Count actual files in output dir
    actual = len([f for f in os.listdir(OUTPUT_DIR) if f.endswith(".xlsx")])
    print(f"\nActual .xlsx files in {OUTPUT_DIR}: {actual}")


if __name__ == "__main__":
    main()
