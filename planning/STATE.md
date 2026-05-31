# Current State

**Project:** DriveShop Event Estimate Engine
**Phase:** 2 — Stabilization / First Production Deploy
**Mode:** Directed

## Active Sprint

Sprint 017 — Deploy Readiness — **code complete; pending operator deploy + beta release.**

All eight work items are resolved (W1–W7 shipped; W8 investigated, fix deferred pending Tatiana). What remains is operator/ops action, not code:

**Operator deploy checklist (not yet done):**
- In the Render dashboard, set the secret values declared in `render.yaml`: `RESEND_API_KEY`, `DATA_FEED_API_KEY` (confirm `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`).
- Set `FRONTEND_URL` and `APPROVAL_BASE_URL` to the **production** URLs (not localhost) so approval links resolve.
- Leave `CLIENT_APPROVAL_EMAIL_ENABLED=false` for beta (hybrid email mode — internal routing stays live).
- **Rotate** the Supabase, Anthropic, and Resend keys (they sat in local plaintext).
- Push to `main` → Render builds the backend with the new `Aptfile` (WeasyPrint native libs).
- Smoke-test on the live instance: generate a PDF; exercise the approval flow in disabled-email mode; refresh mid-estimate (no data loss).
- **Guardrail:** do NOT generate client-facing PDFs for recap-stage estimates that have unplanned schedule items (see Deferred / DECISIONS).

## Just Shipped

**Sprint 017 — Deploy Readiness** (W1–W7 shipped, W8 investigated)
- **W1 — Agency fee on PDFs:** fee-basis lines now compute against estimate-wide non-fee revenue in `pdf_data_service.py`; PDF grand total matches the on-screen total and is internally consistent to the cent. Verified across all 5 estimates; non-fee output byte-identical.
- **W2 — Snapshot / CO / threshold correctness:** version snapshots delegate to the canonical engine (`estimate-totals.ts`); change-order baselines (Option A, per-segment) and `computeSegmentRevenue` now include fee-basis revenue and exclude unplanned. Verified against the real TS engine (Δ = agency fee, cost unchanged).
- **W3 — WeasyPrint on Render:** added root `Aptfile` (Pango/Cairo/gdk-pixbuf) so PDFs render in production.
- **W4 — render.yaml env vars:** declared the 5 missing backend vars (Resend key, data-feed key, approval base URL, frontend URL, extra CORS) + the `CLIENT_APPROVAL_EMAIL_ENABLED` gate; secrets `sync: false`.
- **W5 — Hybrid email mode:** client-facing approval email gated off for beta (backend-enforced via `CLIENT_APPROVAL_EMAIL_ENABLED`, frontend reads `/api/health`); internal routing, transitions, audit trail, and the confirm endpoint all intact; UI hides the Send button and shows the manual-approve path. Backend smoke-tested (`email_sent: false`, token still created, no Resend call).
- **W6 — Env hygiene:** removed the frontend Anthropic key + dead `src/lib/ai.ts`; gitignored `api/.env`; fixed a corrupted root `.env` line; (incidental) fixed a latent Node-types leak in `ScheduleGrid.tsx`.
- **W7 — Summary-tab section %:** each section header shows its revenue as % of total bid (read-only, derived from canonical totals; reconciles to the cent).
- **W8 — Office-cost recalc:** **investigation only — code unchanged.** Found the office labor cost/GP formula is **inverted** (three-signal agreement: historical data 3,200-to-0, DOMAIN wording, Dave's symptom; provenance proven clean). Fix deferred pending Tatiana's confirmation. See Deferred + DECISIONS.

## Recently Shipped

- **Sprint 016** — Rate Card Bulk Import (20-tab cost rate card; 14 new OEM clients, 46 fee_types, No-Client fallback)
- **Sprint 015** — Admin Settings UI for Financial Thresholds
- **Sprint 014** — Final Polish (client approval email, toasts, invoice-with-receipts PDF, data feed API)
- **Sprint 013** — Client-Specific Approval Routing
- **Sprint 012** — Unplanned Additions in Recap
- **Sprint 011** — Schedule Recap Actuals + Financial Summary Cards

## Next Up

**Sprint 018 — Sage Intacct CSV Export + Final QA**
CSV export from the Event Estimate Engine for upload into Intacct (not an API integration). Blocked on corporate cost rate data from finance to finalize the export format. Final QA pass folds in here once beta feedback is collected.

## Deferred

**Sprint 017 findings (need a decision before fixing — see DECISIONS.md for full data):**
- **W8 — Office-event cost/GP formula is INVERTED.** Office labor cost should be `day_rate × office_payout_pct` (office's share), not `day_rate × (1 − payout)`. Fix **Issue ① (recompute on toggle)** + **Issue ③ (formula direction)** as a pair, under full gate, **once Tatiana confirms direction.** Guardrail: office-event cost/GP figures are unreliable until fixed (corporate unaffected).
- **PDF labor rollup diverges from canonical** on recap+unplanned estimates (PDF over-counts labor; +$1,995/+40% on Mazda Ride & Drive). Fix = point PDF at the canonical rollup. Guardrail: no client PDFs for recap-stage estimates with unplanned items.
- **CO deltas don't reflect the agency-fee ripple** (per-segment by design) — pending Tatiana.
- **Approval threshold is fee-blind** (per-segment by design) — governance call for Tatiana.
- **Totals computed in 5 independent places** — consolidate onto one engine (future sprint).
- **Data hygiene:** historical pipeline field `cost_rate` actually holds the source's **Margin %** — rename to `margin_pct` so it isn't mis-read again.

**Pre-existing / longer-term:**
- `driveshop.com` Resend sender domain verification (flip `CLIENT_APPROVAL_EMAIL_ENABLED=true` once verified to re-enable client email)
- Drop now-unused `@anthropic-ai/sdk` from the frontend `package.json` (no importers after W6)
- Internal / External / Vendor line type driving cost source (needs business-rule decisions)
- Locked rates on the corporate / no-client rate card; Internal/External/Vendor cost-mix on Summary (depends on type-driven logic)
- New rate card sections — Creator Services, Media, Talent (blocked on field defs + GL codes)
- Rate card data cleanup; Corporate event recap workflow
- Recap-variance overtime-multiplier reconciliation; data-feed totals performance (O(n))
- Location-aware historical patterns; per-estimate approver override (OOO); confirmation emails to client + AM on client approval
- Live broadcast of system settings to open tabs; default landing page setting
- Editing `is_unplanned` post-creation; unplanned items on client-facing PDFs
- SMS notifications; multiple receipt attachments per line item
- Change Order / Recap PDF options in Export dropdown
- Broader role-based workflow rules engine
