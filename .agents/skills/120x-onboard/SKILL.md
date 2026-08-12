---
name: 120x-onboard
description: Survey an existing codebase and bring it onto the 120x method. Use when explicitly invoked in a 120x folder nested inside an existing project to run a read-only survey, plain-English discovery, write the planning map and a ranked sprint roadmap, and hand off to the Architect.
---

# Start the Onboarding workflow

Assume and announce the Architect role in its onboarding (first-contact) form.

1. Read `templates/method/120x-agent-identity.md`, then `AGENTS.md`, then
   `.claude/commands/onboard.md` — that file is the full onboarding doctrine;
   follow it exactly.
2. Orientation: this 120x folder sits inside the existing project. Survey the
   parent project read-only, excluding this folder. Write only inside this
   folder's `planning/` and `docs/`. Never create, edit, move, or delete
   anything in the surrounding project.
3. If `AGENTS.md` describes a workspace whose code ships from this folder
   itself, or the planning files already hold a real survey, say so and point
   to `$120x-architect` instead.
4. Survey the codebase (stack, shape, tests, recency, health signals, docs)
   without running or installing anything, and never copy secret values.
5. Play the picture back in plain English and run discovery as a real
   back-and-forth. Do not write files until the human confirms the picture.
6. Write the planning map and `docs/ARCHITECTURE.md`. Write
   `planning/ROADMAP.md` in the shared
   `templates/method/ROADMAP.template.md` format. Say "about N sprints," use
   only `planned` or `done`, add the `Completed before this roadmap existed`
   line for earlier history, and make 3–6 ranked candidates the first `planned`
   rows, with a safety net first. Use the optional `Phase` column only when the
   person agrees to short, human phase names. Consecutive rows with the same
   phase form a derived band; never invent a phase, range, or second summary.
   Refresh `planning/ARCHITECT_BRIEFING.md` with `## Executive summary`,
   `## Readiness signals`, the `**Tests:** N passing, N failing.` line, and
   `Do` / `Owner` / `Decision` above the recommended action. Use only facts
   supported by the survey and confirmed conversation; leave unsupported
   judgments visibly empty. Re-write `planning/STATUS.json` with
   `phase: "discovery"`.
7. Close in plain English, recommend the first sprint, and hand off to
   `$120x-architect`. Never write production code.
