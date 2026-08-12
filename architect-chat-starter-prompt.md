# Existing Project / Feature or Fix Architect Starter Prompt

> **Current position (updated 2026-07-27) — read this before the rest of the file.**
>
> This starter prompt was filled by the Launcher when the project first adopted the 120x method, and its "Feature Or Fix Request", "Current Behavior", "Desired Behavior", "Known Evidence", and "Architect Pack Output Requirement" sections below describe **Sprint 019, which has since shipped**. Treat them as historical framing, not as the work in front of you.
>
> For where the project actually stands and where it is going, read in this order:
> 1. `planning/ROADMAP.md` — the whole road, about 6 sprints
> 2. `planning/ARCHITECT_BRIEFING.md` — where the last sprint left off
> 3. `planning/STATE.md` + `planning/STATUS.json` — the active sprint and its phase
> 4. The active sprint folder under `planning/sprints/`
>
> The method rules further down this file (no production code, distill source material, save packs to `planning/architect-packs/`, the delimiter format) all still apply. Only the project-specific request sections are stale. Name packs `architect-pack-###-{sprint-name}.md` for the sprint you are actually planning — not `001`.

I am working on an existing project and I have placed the generated 120x feature/fix folder in the root of that project.

Act as the Architect Layer using the 120x Architect / Builder methodology.

First, read the generated 120x folder and its planning files.

Do not write code.

Your job is to help create an Architect Pack for this feature, fix, repair, or enhancement.

After the Architect Pack is created and applied, the Builder will execute from the approved sprint files under `planning/sprints/`, not directly from the Architect Pack.

Save Architect Packs in `planning/architect-packs/`. Run the importer from inside the generated `event-estimate/` folder (where this file lives), using a relative pack path — not from the existing project's repo root. This folder is nested inside the existing project, so "project root" here means this generated folder.

## Workflow Mode

This is an Existing Project / Feature or Fix workflow.

The user already has an app, repo, workflow, prototype, project, codebase, or partially built product somewhere else.

That project most likely is not yet using the 120x Architect / Builder method. Adopting the method on it — going forward — is part of this job, not just the change itself.

The user wants to use the 120x Architect / Builder method to plan the work they have in mind. That may be one change or several.

A change may be a new feature, bug fix, repair, enhancement, refactor, workflow change, UI improvement, API change, or cleanup task.

If the user has several changes in mind, do not force them into one sprint. Sequence them: the first sprint stays narrow, and later sprints are recorded in `planning/STATE.md` as next actions.

This generated 120x folder should live in the root of the existing project while the Architect creates the pack.

## Existing Source Material

The user may already have Claude projects, ChatGPT threads, master prompts, strategy notes, roadmaps, prototype notes, repo notes, screenshots, logs, or other scattered context.

Treat that material as source material, not final truth.

Distill the source material into durable project artifacts: requirements, decisions, risks, open questions, architecture notes, acceptance criteria, validation notes, and the Builder handoff prompt.

Do not ask the Builder to implement directly from raw chat transcripts or unreviewed notes. Convert the context into the 120x folder-based handoff first.

## Project / App Metadata

| Field | Value |
|---|---|
| Project / app name | DriveShop Event Estimate Engine |
| Client | DriveShop (delivered by R-Cubed Holdings / 120x.ai) |
| Mode | Existing Project / Feature or Fix |
| Planning folder | event-estimate/ |
| Existing project location | Local repo at /Users/richardrierson/Desktop/Projects/Event_History (the Event Estimate Engine repo) |
| Existing project notes | Local repo at /Users/richardrierson/Desktop/Projects/Event_History (the Event Estimate Engine repo) |
| Canonical GitHub repo | https://github.com/aininja-pro/Event_Estimate |
| Tech stack | - Frontend: React 19 + TypeScript, Vite 7, React Router v7- Styling: Tailwind CSS v4 + shadcn/ui; charts via Recharts- File parsing: SheetJS (xlsx)- Database: PostgreSQL via Supabase- Backend: Python + FastAPI- AI: Anthropic Claude API- PDF: WeasyPrint + Jinja2- Deployment: Render (auto-deploy from main) |

## Existing Project Status

The user already has an existing app, repo, workflow, or codebase outside this exported folder.

Project Launcher has not inspected or modified that implementation.

## Adopting The 120x Method Going Forward

This project probably has no `planning/` structure, no decisions or risks log, and no sprint cadence yet. Establishing that is part of the deliverable, not a side effect.

As part of the first pack, stand up the durable planning files and capture an honest `planning/FILE_INVENTORY.md` of the existing project as the user describes it. No source code is read automatically — use what the user provides.

Reconciling or cleaning up the existing file and folder structure is legitimate work, but propose it explicitly in `planning/DECISIONS.md` and the sprint plan. Never silently restructure the project. Preserve existing behavior unless an approved sprint says otherwise.

## Where Your Code Lives And How It Ships

This generated folder is a planning workspace, not a code repository. It holds the Architect Pack, planning files, and sprint handoffs only. No production code is ever written inside it.

The actual code stays in the existing project around this folder. When the Builder is approved, it edits the existing project's real source files in place — never anything inside this folder. There is deliberately no `src/` or `tests/` here; those already exist in the project.

Code ships the way it already does: through the existing project's own repository and normal git workflow (the Canonical GitHub repo named above, if any). This folder can be committed alongside the project as planning documentation or kept untracked — the user's choice. It never becomes the source of truth for the running code.

## Feature Or Fix Request

Load the real Intacct mapping data DriveShop delivered and clean the rate cards onto the canonical item catalog (Sprint 019 / AP-019), unblocking the Sprint 018 Phase 2 Intacct export. Specifically:
- Remap 10 test-named rate-card items to their catalog Item IDs (preserve prices), and delete 6 test items with no catalog equivalent.
- Populate the fee_type Intacct fields (intacct_ar_item_id, intacct_ap_gl_account_no, revenue gl_code) from the 160-item catalog.
- Load the Intacct reference tables: office_accounting_profiles (vendors/affiliates), revenue_segments (departments), and clients.intacct_customer_id (customers).

## Existing Source Material Guidance

Treat existing Claude/ChatGPT chats, master prompts, strategy notes, roadmaps, prototype notes, repo notes, screenshots, logs, and source excerpts as reference material, not final product truth.

The Architect should distill this material into requirements, decisions, risks, open questions, architecture notes, acceptance criteria, validation notes, and a Builder handoff before implementation starts.

Builder should not implement directly from raw chat transcripts or unreviewed notes.

## Current Behavior

The AR/AP Intacct exporter is already built and matches the accounting templates field-for-field, but it is blocked on data: fee_types / rate_card_items intacct_ar_item_id and intacct_ap_gl_account_no are 0/967, the AR itemId has no fallback, and the few populated values are placeholder test data (customer 123456, item 9999). The rate cards contain test-named items that do not match the accounting catalog. Result: 0 valid exports today — only 1 of 5 office estimates clears the workflow gate, and it still fails at the line level for missing itemId/glAccountNo.

## Desired Behavior

The 160-item catalog is the single source of truth for item identity and GL codes, stored once at the fee_type level with rate cards referencing it (prices stay in the rate cards). Rate cards are cleaned (10 remapped, 6 deleted). fee_types carry real intacct_ar_item_id / intacct_ap_gl_account_no; the office, segment, and customer reference tables are loaded and active clients carry their intacct_customer_id. At least one previously-blocked office estimate produces a valid AR + AP export.

## Known Evidence

### Reproduction Steps

- DECISIONS.md records intacct_ar_item_id 0/967, clients.intacct_customer_id 1/23, client dept/location defaults 0/23, and placeholder values (123456 / ABC123 / 9999).
- Architect verification (2026-07-01): the catalog has 0 duplicate Item IDs and 0 duplicate names; the coding tabs (customers, segments, vendors) have 0 duplicates; every rate-card line carrying a GL code maps to the catalog; only 16 test-named items (all missing a GL) fail to map.
- Reproduce: attempt an Intacct export on an office estimate — it fails at the line level because itemId / glAccountNo are unpopulated.

### Known Files, Modules, URLs, Logs, Screenshots, Or Reports

- scripts/import_rate_cards.py — the dry-run to --confirm to apply import pattern to mirror
- scripts/migration_intacct_accounting_metadata.sql — defines the target columns/tables (all already exist; no schema change needed)
- fee_types and rate_card_items tables (Supabase)
- The exporter chain: accounting-review-service.ts to accounting-export-line-service.ts to accounting-csv-service.ts
- scripts/seed_fee_types.py / scripts/seed_rate_cards.py
- data/imports/ — staged source spreadsheets (Item IDs - Dave M Edits_06.24.26.xlsx, Intacct Coding.xlsx)

## Constraints

- No schema changes — every target column/table already exists.
- No rebuild of the exporter itself (that is Sprint 018 Phase 2, which this change unblocks).
- No historical estimate backfill.
- No Resend domain verification, PDF rollup changes, or corporate-cost / pass-through logic changes.
- Full approval gate before any database write (dry-run report, then confirm, then apply).
- Estimate-facing visibility flag and overtime .01 item modeling are deferred to the 2026-07-02 Dave meeting and are not part of this change.

## Validation Expectations

- A dry-run duplicate + GL-coverage report runs first and must pass clean before any write.
- After

## Your Job As Architect

First, help clarify the feature or fix.

Clarify:

- existing project purpose
- what is broken, missing, or needs changing
- current behavior
- desired behavior
- evidence, screenshots, logs, errors, reports, URLs, or source notes
- affected users or workflows
- constraints and out-of-scope boundaries
- risks
- acceptance criteria
- likely implementation areas
- validation expectations

If anything important is missing or vague, ask targeted discovery questions before producing the Architect Pack.

Do not invent unknown facts. Preserve unknowns in `planning/QUESTIONS.md`.

Use assumptions only when necessary and label them clearly.

## Architect Pack Goal

Produce an Architect Pack for the first focused feature-or-fix sprint.

The Architect Pack should create or update:

- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/DOMAIN.md`
- `planning/FILE_INVENTORY.md`
- `docs/ARCHITECTURE.md`, if relevant
- `docs/API.md`, if relevant
- `docs/VALIDATION.md`
- `planning/sprints/001-existing-project-feature-or-fix/requirements.md`
- `planning/sprints/001-existing-project-feature-or-fix/blueprint.md`
- `planning/sprints/001-existing-project-feature-or-fix/acceptance.md`
- `planning/sprints/001-existing-project-feature-or-fix/handoff-prompt.md`

The `handoff-prompt.md` should later tell the Builder what to inspect, what to change, what not to change, and how to validate the approved feature or fix.

## Feature Or Fix Sprint Expectations

Keep the first feature-or-fix sprint narrow.

The sprint should include:

- concise feature/fix summary
- current behavior
- desired behavior
- evidence and reproduction steps
- likely files/modules/areas to inspect
- constraints and out-of-scope boundaries
- risks and open questions
- acceptance criteria
- validation plan
- exact Builder handoff prompt

## Architect Pack Output Requirement

When ready, create a downloadable Markdown file named:

`architect-pack-001-existing-project-feature-or-fix.md`

The file must be ready to use with:

`node scripts/apply-architect-pack.js planning/architect-packs/architect-pack-001-existing-project-feature-or-fix.md --dry-run`

After dry-run review, it should be ready to apply with:

`node scripts/apply-architect-pack.js planning/architect-packs/architect-pack-001-existing-project-feature-or-fix.md`

Run both commands from inside the generated `event-estimate/` folder, not the existing project's repo root.

Use the standard Architect Pack delimiter format:

```text
============================================================
FILE: planning/STATE.md
============================================================

[file content]

============================================================
FILE: planning/sprints/001-existing-project-feature-or-fix/requirements.md
============================================================

[file content]
```

Important delimiter rules:

- Every separator line must be exactly 60 equals signs.
- Do not shorten the separator.
- Do not use markdown headings instead of `FILE:` sections.
- Do not wrap the final Architect Pack in triple backticks.
- Do not include extra commentary inside the downloadable pack unless it belongs in a target file.

## Rules

- Do not write implementation code.
- Do not fix the bug directly in this Architect step.
- Do not jump to Builder execution.
- Do not invent unknown facts.
- Use assumptions only when necessary and label them clearly.
- Make open questions explicit.
- Keep the first feature-or-fix sprint narrow.
- Preserve existing behavior unless the approved feature-or-fix sprint says otherwise.
- The Builder executes only after the Architect Pack is applied and the sprint files are approved.
- After the pack is applied, Builders should implement from the generated files under `planning/sprints/`, not directly from the Architect Pack.
