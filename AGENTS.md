# AGENTS.md

## Project

**Name:** DriveShop Event Estimate Engine  
**Client:** DriveShop (delivered by R-Cubed Holdings / 120x.ai)  
**Mode:** Existing Project / Feature or Fix  
**Planning folder:** `event-estimate/`  
**Existing project notes:** Local repo at /Users/richardrierson/Desktop/Projects/Event_History (the Event Estimate Engine repo)

---

## Operating Model

This project uses the 120x Architect / Builder methodology.

The handoff is a folder, not a conversation.

The Architect defines the focused feature-or-fix plan, acceptance criteria, risks, decisions, and Builder handoff prompt.

The Builder executes from written artifacts and must not redefine scope or invent product behavior.

This folder is planning only. Production code lives in the existing project around this folder and ships through that project's own repository. The Builder edits the existing project's real source files in place and never writes production code into this folder — there is deliberately no `src/` or `tests/` here.

---

## Two Roles

This folder runs the 120x **Architect → Builder** method in your coding tool (Claude Code, Codex, or Cursor). The handoff between the two roles is this folder, not a conversation.

- **Architect (plans).** Start an Architect session by reading `templates/method/120x-agent-identity.md`, then the filled starter prompt at the project root, `architect-chat-starter-prompt.md`. In Claude Code, run `/architect`. In another tool, paste the contents of `architect-chat-starter-prompt.md` as your first message. The Architect produces the Architect Pack and stops — it does not write code.
- **Builder (executes).** After the pack is applied, in Claude Code run `/build`; in another tool, start from the approved files under `planning/sprints/`. The Builder edits your existing project's **real source files in place** and stops at the code gate for your approval.

Read `templates/method/120x-agent-identity.md` first to assume a role. Prefer to plan in ChatGPT or Claude instead? You can paste `architect-chat-starter-prompt.md` into a chat — that's the fallback, not the main path.

---

## First Files To Read

1. `templates/method/120x-agent-identity.md` — pick your role first
2. `AGENTS.md`
3. `planning/ROADMAP.md` — **where the project is going.** The whole road in plain English, about 6 sprints. Read this before you form any opinion about what to build next.
4. `planning/ARCHITECT_BRIEFING.md` — the Builder's plain-English "where we left off" from the last sprint close. Describes; git proves. When it and the repo disagree, believe the repo.
5. `planning/STATE.md` — the active sprint and what is in flight
6. `planning/STATUS.json` — machine-readable phase marker (`apply-pack` / `awaiting-approval` / `building` / `sprint-closed`)
7. `planning/DECISIONS.md` — non-obvious choices you must not accidentally undo
8. `planning/DOMAIN.md`
9. `planning/RISKS.md`
10. `planning/QUESTIONS.md` — what is still unanswered, and who owes the answer
11. The **active sprint folder** named in `STATE.md`, under `planning/sprints/` — `requirements.md`, `blueprint.md`, `acceptance.md`, `handoff-prompt.md`. As of Sprint 020 that is `planning/sprints/020-rate-card-pricing/`.
12. `docs/ARCHITECTURE.md` and other relevant docs under `docs/`
13. Relevant source notes under `references/`

The current sprint number is always whatever `planning/STATE.md` and `planning/STATUS.json` say — never assume it from this list.

---

## Builder Rules

- Do not start by editing the existing project.
- Use `planning/architect-packs/` to find, dry-run, and apply Architect Packs from the project root.
- After a pack is applied, read the generated sprint files under `planning/sprints/` before implementation.
- Do not implement directly from the Architect Pack after it has been applied.
- Inspect the relevant source files before changing code.
- Summarize the implementation plan before making changes.
- Keep the fix narrow and avoid broad rewrites unless explicitly approved.
- Preserve existing behavior unless the sprint acceptance criteria require a change.
- Do not store secrets, API keys, passwords, tokens, or private credentials.
- Update planning/docs/tests when the sprint requires it.
