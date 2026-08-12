# Builder Sprint Completion Review Prompt

Review Sprint {{SPRINT_NUMBER}} - {{SPRINT_NAME}} against:

`planning/sprints/{{SPRINT_FOLDER}}/acceptance.md`

Use the project folder as the source of truth.

You are the independent check on this sprint — the Judge. Run this review in a
**fresh session** where possible, so you judge what is actually in the folder
and the repo, not what a long conversation remembers. Do not take the Builder's
word for anything you can verify yourself.

## Review Inputs

Read:

1. `planning/STATE.md`
2. `planning/DECISIONS.md`
3. `planning/RISKS.md`
4. `planning/QUESTIONS.md`
5. `planning/sprints/{{SPRINT_FOLDER}}/requirements.md`
6. `planning/sprints/{{SPRINT_FOLDER}}/blueprint.md`
7. `planning/sprints/{{SPRINT_FOLDER}}/acceptance.md`
8. `planning/sprints/{{SPRINT_FOLDER}}/handoff-prompt.md`
9. relevant changed files
10. validation output, if available

`planning/archive/` is finished history. Do not read it at session start; read it only when the current work touches something it records.

## Run the verification yourself

If the sprint's handoff carries a task contract, **execute its `verification`
commands** — don't just read claims about them. Otherwise run the project's
standard checks (tests, type checks, builds) named in `acceptance.md`. Record
each command you ran and what it reported (counts, exit codes, output that
matters). A Builder's claim is not completion; evidence is.

## Report

Report:

1. acceptance criteria complete
2. acceptance criteria incomplete or uncertain
3. files created
4. files modified
5. tests/checks/validation run — the commands you executed and their results
6. current behavior preserved or changed
7. risks introduced
8. decisions that should be added to `planning/DECISIONS.md`
9. updates made or needed in `planning/STATE.md`
10. open questions that should be added to `planning/QUESTIONS.md`
11. recommended next sprint

## Required Final Action

Write or refresh `planning/ARCHITECT_BRIEFING.md` per `docs/ARCHITECT_BRIEFING_SPEC.md`. It must be a bounded current-state snapshot, not a log. Never include source code, secrets, or credentials. It must **lead with a plain-English `## Where things stand`** (2–4 jargon-free sentences: what just got done, whether it works, what happens next) before the technical sections — and carry the two evidence sections:

- **`## Evidence`** — the validation commands that were run and what each reported (counts, exit codes, build results), so the next reader can re-run them and expect the same answers.
- **`## Plan corrections`** — in plain language, what the plan got wrong or left ambiguous (acceptance criteria that didn't hold, things the blueprint missed, anything rebuilt) — or "None — the plan held." The next Architect session reads this before planning new work.

At sprint close, keep the boot files bounded: move finished history verbatim into `planning/archive/` (`STATE.md` keeps the current picture plus one prior sprint; `QUESTIONS.md` keeps open rows; `DECISIONS.md` keeps recent entries plus a one-line index of everything archived). Copy first, verify the copy, then trim. Never summarize; never trim without a verified copy; if the copy cannot be verified, leave the file unbounded and say so.

Also overwrite `planning/STATUS.json` with:

```json
{ "schemaVersion": 1, "phase": "sprint-closed", "sprint": "<sprint folder id>", "updated": "<ISO-8601 now>" }
```

Do not mark the sprint complete if acceptance criteria are not satisfied.

If validation was not run, say exactly why and what should be run before completion.
