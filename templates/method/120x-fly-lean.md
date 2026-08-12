# 120x Fly (lean) — one reviewed sprint, two persistent contexts

Fly-lean runs one reviewed 120x sprint from the current project folder; the
folder is the durable record. The lean doctrine keeps two persistent contexts,
plain reviewer judgment, and every durable safety gate. It has no flight classes,
no critical path, no finding ledgers, no decision budgets, and no classification
step. Do not add them.

## Two contexts, both persistent

A flight uses exactly two contexts and keeps both alive its whole length: one
**Architect** context (discovery, planning, plan review, reading the diff) and
one **Builder** context (planning its own work, building, running checks). Never
create a fresh or throwaway context for any purpose. The Architect that reviews
the plan and reads the diff is the one that ran discovery, so it already holds
the project in mind and never re-reads the whole repository to judge its own
plan.

## Resolve the layout first

Before discovery, determine the active folder layout, because it decides how the
sprint files are written.

**Ordinary New Project or Website folder.** The method workspace and the
coding-tool root are the same folder. Claude Code reads the canonical Architect
body at `.claude/commands/architect.md`. After `go`, the Architect writes the
four sprint files directly into `planning/sprints/<sprint>/`: no Architect Pack,
no importer, no dry-run.

**Nested existing-project folder.** The coding tool is open at an outer
repository root and the method workspace is a generated child folder (for example
`120x-cora/`), whose canonical Architect body is
`<workspace>/.claude/commands/architect.md`. This is the one layout that keeps
the Pack path: the Architect writes one standard Pack and applies it with the
importer (dry-run, read the reported destinations, then apply) so the four files
land under the nested workspace. Treat every method-relative path as relative to
the resolved workspace.

## The flight, identical for every sprint

1. **Discovery.** Run the full Architect discovery from the canonical Architect
   body: a plain-English opening, real back-and-forth, recommendations, and an
   explicit human `go`. Nothing is written before `go`. Agreement or "sounds
   good" is not `go`. The `go` authorizes this one sprint and this flight only.

2. **Plan.** After `go`, the Architect writes the `planning/ROADMAP.md` update
   and the sprint's four files (`requirements.md`, `blueprint.md`,
   `acceptance.md`, `handoff-prompt.md`) into `planning/sprints/<sprint>/`. The
   handoff carries the five-field task contract: `objective`, `owns`, `must_not`,
   `acceptance`, and `verification`. Write `planning/STATUS.json` with
   `phase: "apply-pack"`. (Ordinary layout writes directly; the nested layout
   writes and applies one Pack, as above.)

3. **Flight evidence.** The blueprint carries a short `## Flight evidence`
   section: the acceptance invariant at risk, the paths or symbols verified, and
   one discriminating example for any correctness claim where a plausible wrong
   implementation would give a different result. A test is evidence only if it
   can go red for that wrong implementation.

4. **Builder plan.** The Builder reads the sprint folder for itself and posts its
   plan: the exact file list, scope guards, every acceptance criterion, the
   verification commands, observed test baselines with target arithmetic, and any
   corrections (each naming the file and the exact contradiction; `None` is
   valid). The Builder does not approve its own plan.

5. **Plan review.** The Architect reviews that exact plan and returns one verdict.
   It does not re-read the repository; it already holds the context.
   - `pass`: the plan implements the written sprint, respects scope, and is safe
     to build. A `pass` authorizes the build with no further human prompt.
   - `fix`: the specific correction the Builder must make.
   - `ask`: one genuinely blocking question for the human, with a recommendation.
     Return `ask` whenever the change touches something the Architect is
     genuinely unsure or worried about.

6. **Fix loop.** A `fix` returns only the flagged correction to the Builder, who
   amends only that; the Architect re-checks only the delta. If the same defect
   survives two rounds, stop and `ask` the human with what is proven, the
   remaining risk, and one recommendation. Do not loop.

7. **Build.** The Builder implements only the passed plan, trusts git over prose,
   preserves unrelated work, and does not broaden scope, invent behavior, or
   commit, push, merge, deploy, or delete user files unless the sprint and human
   separately authorize it.

8. **Real checks.** Run the verification commands the project and sprint declare,
   for real. Record the exact command, exit code, pass/fail/skip counts when
   available, and any build, type, or lint result. A command claim is not
   evidence; the command must run. When a sprint changes something the operator
   should judge by eye, take that look now, before the diff read, so its findings
   ride the same correction cycle.

9. **Diff read.** The Architect reads the full implementation diff against the
   numbered acceptance criteria and the real-check evidence, and returns `pass`,
   `fix`, or `ask` by the same rule as step 5. A `fix` returns through the Builder
   and step 6's two-round bound.

10. **Close-out, scaled.** After a `pass` on the diff, always refresh
    `planning/ARCHITECT_BRIEFING.md` (executive summary, real test counts, plan
    corrections, next Architect action), write `planning/STATUS.json` with
    `phase: "sprint-closed"`, and flip the completed sprint's roadmap row from
    `planned` to `done`. Record durable decisions, risks, questions, and any
    accepted residual risk. Do archive bounding (copy first, verify the copy,
    then trim; never summarize) only if a boot file has grown past its bound.
    Then read the close-out back from disk (roadmap row, briefing, STATUS, final
    diff) and claim a landing only when that read-back proves the row is `done`,
    the briefing records the real evidence, STATUS is `sprint-closed`, and the
    diff stays within the passed plan. If it is inconsistent, stop with the exact
    missing item and a recommendation.

One flight ends here. A future sprint needs a new Architect conversation and a
new human `go`.

## Honest limits

Fly relies on the current coding tool's separate contexts, filesystem
permissions, git inspection, and real command output. It does not claim stronger
containment or timeout guarantees than that tool provides. If separation,
permissions, git truth, or required checks cannot be established, stop and explain
the blocker with a recommendation.
