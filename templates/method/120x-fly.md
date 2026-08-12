# 120x Fly — Discover, plan, build, and verify one sprint

Fly runs one reviewed 120x sprint from the current project folder. The folder is
the durable record. The current coding tool supplies the separate working
contexts; no Project Launcher process is required.

## Resolve the method layout first

Before beginning Architect discovery, determine which supported folder layout is
active. Do not assume that every layout contains the same Codex skills.

### Ordinary New Project or Website folder

The method workspace and coding-tool root are the same folder.

- Claude Code reads `.claude/commands/architect.md`.
- Codex reads `.agents/skills/120x-architect/SKILL.md`.

These direct Codex folders contain the repository Architect skill because they
ship the full method allowlist.

### Nested Existing Project folder

The coding tool is open at an outer repository root and the method workspace is
a generated child folder such as `120x-cora/` or `existing-app-repair/`.

For either Claude Code or Codex, the canonical Architect body is:

`<workspace>/.claude/commands/architect.md`

The nested existing-project allowlist intentionally does not contain
`.agents/skills/**`. Do not try to read a nested
`.agents/skills/120x-architect/SKILL.md`.

Do not depend on a root `$120x-architect` skill either. An already-issued folder
may predate relocation of that launcher. The root Fly launcher supplies the
workspace name and delegates directly to the nested Claude command bodies, which
are the existing-project canonical method source.

Treat `AGENTS.md`, `planning/`, `templates/`, `.claude/commands/`, the filled
starter prompt, and every other method-relative path as relative to the resolved
method workspace. The surrounding repository remains read context during
Architect work and becomes the Builder's implementation target only after Fly's
plan approval.

## Start with the project's complete Architect workflow

Do not imitate, summarize, or maintain a second copy of the Architect workflow.

Read the canonical Architect body selected above and follow all of its required
project reads, plain-English opening, discovery behavior, recommendations,
roadmap work, Plan-corrections review, risks, questions, Pack rules, and explicit
`go` gate.

A project without `planning/ROADMAP.md` is valid. Conduct discovery and propose
the road exactly as the Architect normally would.

Open in plain English before discussing files or implementation. Discovery is a
real conversation: ask, react, recommend, and push back. Every blocking question
includes a recommendation. "Do what you recommend" is a valid decision.

Until the human explicitly says `go`, do not change any file. In particular, do
not write or amend the roadmap, create a Pack, update STATUS, start a Builder, or
touch implementation. Present proposed roadmap work and recommendations in the
conversation while discovery continues.

Agreement, "sounds good," and approval of a general direction are not `go`.

The human's `go` authorizes one Pack, one sprint, and this flight only.

## Classify the flight before packing

During read-only Architect discovery, before writing the Pack, declare exactly
one flight class and give one plain-English reason:

- **`local`** — the requested behavior is confined to one implementation layer,
  or is documentation/planning-only, and carries no critical consequence.
- **`cross-layer`** — the asserted behavior or data crosses two or more material
  layers, such as input, domain logic, persistence, rendering, or document
  output. A small edit list can still be cross-layer.
- **`critical`** — failure could affect authentication, authorization, security,
  privacy, money, pricing, legal or compliance obligations, migrations,
  destructive operations, irreversible external writes, or silent corruption.
  Critical outranks the layer count.

Classification changes evidence depth and process weight, never the trust gates.
Every class retains the literal human `go`, exactly one appliable Pack, an exact
Builder plan, real checks, at least one independent check before a landing, and
close-out. How that independent check is staffed for each class is defined in
"Flight weight scales to the class" below. No class is permission to skip
independent review before a landing.

The class may change when discovery reveals new evidence. State the final class,
reason, and evidence depth before asking for `go`. Classification writes
nothing.

## Flight weight scales to the class

The class governs evidence depth (Sprint 119) and now also governs the flight's
process weight. The gates that make Fly trustworthy never disappear; only their
machinery scales. **Every class keeps:** the one human `go`; the Architect
producing exactly one Pack; the Builder executing only that Pack; the folder as
the durable record; git trusted over prose; real checks that actually run; at
least one independent check before a landing is claimed; and a refresh of the
briefing's live-facing summary (the Executive summary, the test counts, the
readiness signals, and the recommended next action), because Mission Control
reads the briefing live and a stale summary shows a customer false state.

- **`local`**: one Architect context and one Builder context, both persistent
  across the flight. The Builder builds directly from the applied Pack. The
  Architect reviews the actual implementation diff, and that diff review is the
  independent check. No separate plan-review round, no fresh context per step, no
  finding-ledger transcription.
- **`cross-layer`**: as `local`, plus one genuinely independent inspection of the
  diff and evidence before close, held by a context that did not write the code.
- **`critical`**: the full treatment in the sections below, unchanged. A fresh
  Architect review of the exact Builder plan before code, real checks, and a fresh
  independent inspection after, each under the stable finding ledger and decision
  budgets. The wasted-build cost of reviewing the plan first is worth paying only
  where failure can touch authentication, authorization, security, privacy,
  money, pricing, legal or compliance obligations, migrations, or irreversible
  writes.

Independent judgment comes from the separation of the Architect and Builder roles
and from adversarially verifying claims against git and real output, not from
discarding context. A flight uses one Architect and one Builder context that
accumulate understanding across it; it does not spin a new context for each step.
Where a `critical` flight needs a second independent reading, create a fresh
context for that inspection; do not pretend a fresh context is required for every
judgment.

## Verify only what the blueprint depends on

Perform targeted read-only evidence work before packing:

- For `local`, identify the affected surface and its source of truth, and state
  why no cross-layer trace is required.
- For `cross-layer`, trace the asserted behavior from origin to sink. Name the
  material layers, paths or symbols, transformations, and invariant.
- For `critical`, perform that trace plus the relevant negative, boundary,
  fallback, or failure path. Do not turn it into a general repository audit.

Every Fly-created Pack blueprint must contain a `## Flight evidence` section
that records:

1. class and reason;
2. the acceptance invariant at risk;
3. affected layers and verified paths or symbols, or the local surface and why
   a trace is unnecessary;
4. source of truth, transformations, and sink when applicable;
5. one discriminating example for every cross-layer or critical correctness
   claim;
6. the git state or other durable source used for verification; and
7. known uncertainty or a blocking question instead of an invented fact.

A discriminating example uses inputs for which the intended implementation and
a plausible wrong implementation produce different results. Numeric, pricing,
mapping, override, fallback, and document-output behavior must not rely on a
degenerate fixture where competing formulas or paths collapse to the same
output. A test plan is evidence only when it can go red for the plausible wrong
implementation.

Match the proof to the failure mode. A wrong result a human sees at a glance
(appearance, layout, spacing, colour, copy) is verified by looking at it once in
the real surface. Adversarial proofs (deliberately breaking the code to confirm a
test fails, reading computed values rather than source) are reserved for silent
correctness risks: numbers, mappings, overrides, fallbacks, data that can render
plausibly wrong. Re-run only the checks a change can actually affect; do not
re-run a build a change cannot reach.

After Pack application, the applied sprint files remain authority and their
Flight evidence is the shared brief. Builders and reviewers may reuse facts
that still match git; they report drift or contradiction before relying on a
recorded fact. Fresh judgment does not require fresh amnesia.

## After `go`: write and apply one standard Pack

After `go`, continue following the current Architect doctrine:

1. Write or visibly amend `planning/ROADMAP.md`.
2. Create exactly one standard Architect Pack in `planning/architect-packs/`.
3. The Pack must contain exactly one sprint's four files:
   `requirements.md`, `blueprint.md`, `acceptance.md`, and
   `handoff-prompt.md`.
4. The blueprint must contain the complete `## Flight evidence` section for the
   declared class.
5. The handoff must carry the five-field task contract: `objective`, `owns`,
   `must_not`, `acceptance`, and `verification`.
6. Write `planning/STATUS.json` with `phase: "apply-pack"`.

Do not stop where ordinary Architect stops. Instead:

1. Identify the one Pack created by this flight.
2. Verify that its paths are relative, traversal-free, and limited to the four
   files under one `planning/sprints/<sprint>/` folder.
3. Run the Pack importer with `--dry-run`.
4. Read every reported destination. If it differs from the expected four paths,
   stop with one blocking question and a recommendation.
5. Apply the same Pack without `--dry-run`.
6. Reread all four applied sprint files. From this point onward, they—not the
   Pack and not the preceding conversation—are the sprint authority.

## Plan without implementation

This pre-implementation plan gate is part of the `critical` path. On a `local` or
`cross-layer` flight the Builder builds directly from the applied Pack and the
plan is judged as the implementation diff afterward (see "Flight weight scales to
the class"), so the separate plan document below is not produced.

Give a Builder context the applied sprint folder and ask it to read the project
for itself. It must return, without editing implementation:

- the task contract;
- the exact implementation file list;
- scope guards;
- every acceptance criterion;
- verification commands;
- observed test baselines and target arithmetic;
- the standard close-out files and actions required after inspection;
- a named `Pack corrections` section, where `None` is valid; and
- any blocking ambiguity.

Builder-discovered Pack defects are batched into that first exact plan. Each
proposed correction names the applied file and exact contradiction. The Builder
does not silently let its plan contradict applied sprint authority and does not
open a preliminary review loop.

The Builder does not approve its own plan.

## Fresh Architect review

This section is the `critical` path in full. For `local` and `cross-layer`
flights, the plan is not reviewed as a separate document before code: the
Architect reviews the implementation diff after the build (see "Flight weight
scales to the class"), and a `cross-layer` flight adds one independent inspection
before close. The budgets, blocker and advisory definitions, and finding ledger
below are the `critical` machinery; they are kept, not deleted, and a lean flight
simply does not convene them.

### Critical plan review (critical flights only)

**Hard gate. Everything from here to the end of this section is the `critical`
path only. On a `local` or `cross-layer` flight, do not create a fresh review
context and do not run any step below; the Builder's plan is judged as the
implementation diff after the build. Stop here and continue at "Build the
approved plan."**

Create a genuinely fresh Architect context that does not inherit the Builder's
conversation or the flight controller's reasoning. Give it only:

- the project folder;
- the active sprint folder;
- current git state;
- the exact proposed Builder plan;
- the declared class and complete Flight evidence;
- the review number and total plan-review budget;
- the previous-to-current plan delta when the review number is greater than 1;
- the full plan finding ledger; and
- the blocker/advisory definitions and stopping question below.

The first plan review is complete: the reviewer reads deeply enough to judge the
entire exact plan. A correction review is delta-focused. It judges changed plan
sections, unresolved findings, and regressions caused by the correction. It does
not reopen an unrelated accepted surface without concrete new evidence.

The stopping question is: **Does this exact plan sufficiently protect the
written sprint contract at the declared flight class?** The reviewer does not
ask whether the plan could be improved indefinitely.

Every finding is classified:

- **`blocking`** — a credible path to an unmet acceptance criterion, violated
  invariant, silent wrong result, security or data harm, prohibited scope
  change, or a claim the proposed verification cannot falsify.
- **`advisory`** — a useful improvement, preference, cleanup, or speculative
  hardening that can be deferred without violating the sprint contract.

Only a blocking finding prevents `pass`. Every blocker names the violated
criterion or invariant, affected path or data flow, concrete counterexample,
failure mechanism, or falsification gap, and the smallest required correction.
Generalized unease such as "could be safer" or "consider more tests" is
advisory unless connected to the written contract by concrete evidence.

The flight keeps one stable plan ledger. IDs are assigned `PLAN-001`,
`PLAN-002`, and so on, and are never renumbered or reused. Each entry records the
phase and review number, severity, signature, concrete evidence, required
correction, and status: `open`, `resolved`, `repeat`, or
`deferred-advisory`. The signature is the acceptance criterion or invariant,
affected origin-to-sink path, and failure mode. A materially identical failure
reuses its ID and becomes `repeat` even when its symptom, file, or wording
moves. A new legitimate finding receives a new ID but still consumes the same
phase-wide budget.

Builder Pack corrections are included in the first full review. The reviewer
may accept a correction only as a clarification within approved intent and must
require the applied sprint authority to be amended before `pass`. A correction
that changes product scope returns `ask`.

It must read the folder for itself and return one decision:

- `pass`: the exact plan implements the written sprint, respects scope, includes
  the required standard close-out, and is safe to build;
- `fix`: concrete corrections the Builder must make;
- `ask`: one genuinely blocking human question, with a recommendation.

Advisories are recorded for Plan corrections or a future roadmap and do not
trigger another plan review. Return `pass` whenever no blocking finding remains,
even when advisories exist.

If a fresh context cannot be created honestly in the current tool, stop and say
so. Do not substitute self-review.

A `fix` returns to Builder planning. The revised plan receives another new,
fresh Architect review under both limits:

- `local`: at most 2 plan decisions total, the initial review plus one
  correction review;
- `cross-layer` or `critical`: at most 3 plan decisions total, the initial
  review plus two correction reviews; and
- the same unresolved failure still gets at most two focused repair attempts.

Count all review decisions. New findings never reset the phase-wide total. The
first limit reached stops autonomous review. Return `ask` with the complete
residual ledger, what is proven, remaining business risk, and one
recommendation. The human may accept named residual risk, rescope, stop, or
authorize one named focused round; Fly never silently starts another.

Inside Fly only, fresh Architect `pass` is approval of that exact Builder plan.
Proceed automatically. Do not ask the human to type `approved` after `go`.

After classification and after every plan review, post a plain-English status
of no more than three short lines: class or decision count/budget, resolved/open
or new blockers and advisories, and the automatic next action. It is not an
approval prompt or timed pause. Immediately before implementation, state the
passing plan review count and that implementation is starting. The human may
interrupt or rescope; silence means continue under the original `go`.

This does not change standalone `/build` or `$120x-builder`; those workflows
still require the human to approve their exact implementation plan.

## Build the approved plan

Give a Builder context the exact passed plan and the applied sprint files.

The Builder:

- implements only the passed plan;
- trusts git over prose;
- preserves unrelated work;
- does not broaden scope or invent product behavior;
- does not commit, push, merge, deploy, or delete user files unless the sprint
  and human separately authorize it.

If implementation must differ from the passed plan, return to planning and a new
fresh Architect review before making that different change.

## Run the real checks

Run the verification commands declared by the project and sprint. Record:

- the exact command;
- exit code;
- passing, failing, skipped, and cancelled counts when available;
- build, type, or lint result;
- any command that could not run and why.

Do not turn a command claim into evidence. The command must actually run.

When a sprint changes something the operator should judge for themselves, that
look lands right after the build, before any independent inspection, so the
operator's findings ride the same correction cycle as the inspector's rather than
opening a new one.

On a `local` or `cross-layer` flight this is where the independent check happens:
the Architect reads the full implementation diff against the numbered acceptance
criteria and the Flight evidence, and returns `pass`, `fix`, or `ask`. `local`
uses the persistent Architect; `cross-layer` uses a context that did not write the
code. This one diff review replaces both the critical-path plan review and the
critical-path inspection. `critical` instead runs the fresh plan review before
code and the fresh inspection after.

## Fresh inspection

The depth of inspection follows the class. On a `local` flight the Architect's
review of the implementation diff (see "Run the real checks" below) is the
independent check; do not create a separate inspection context. On a
`cross-layer` flight perform exactly one independent inspection of the diff and
evidence, held by a context that did not write the code, then proceed to close;
do not convene the budgeted, multi-round committee below. **Everything from the
next paragraph to the end of this section is the `critical` path only.**

### Critical inspection (critical flights only)

Create a new fresh Architect context. It must not be the planning reviewer and
must not inherit the Builder conversation.

Give it:

- the project folder and applied sprint files;
- the approved exact plan;
- the complete implementation diff;
- the real check evidence;
- the declared class and Flight evidence;
- numbered acceptance criteria;
- the inspection number and total inspection budget;
- the corrective implementation diff when inspection number is greater than 1;
- the full inspection finding ledger; and
- the same blocker/advisory definitions used for plan review.

The inspector reads the evidence and diff for itself and judges every applicable
sprint acceptance criterion by number.

It also confirms that the approved plan still includes the required standard
close-out. It does not require roadmap, briefing, documentation, or
`sprint-closed` artifacts that the workflow has not created yet.

It returns:

- `pass`: the implemented work and checks satisfy every applicable criterion,
  and the approved plan still contains a complete close-out;
- `fix`: the failed criteria and concrete corrective work;
- `ask`: one blocking human question and a recommendation.

The first inspection judges the whole implementation. A corrective inspection
is delta-focused on the repair, open findings, and repair-caused regressions;
unrelated accepted surfaces reopen only with concrete new evidence.

Inspection findings use stable `INSPECT-001`, `INSPECT-002`, and so on, with the
same signature, repeat, severity, and status rules as plan findings. Advisories
do not block an inspection `pass`.

A `fix` returns through Builder planning and another fresh Architect review
before repair. Never repair directly from an inspector's instruction. Apply
both limits:

- `local`: at most 2 inspection decisions total;
- `cross-layer` or `critical`: at most 3 inspection decisions total; and
- the same failure receives at most two focused repair attempts.

Every decision consumes the phase-wide inspection budget, including a genuinely
new finding. At the first limit reached, return `ask` with the residual ledger,
proven facts, remaining risk, and recommendation, and make no further
implementation write. After each inspection, post the same concise non-blocking
status shape and automatic next action.

## Close the sprint after inspection `pass`

Only after fresh inspection returns `pass`, perform the normal Builder close-out:

1. Update project state and any durable decisions, risks, questions,
   architecture, and validation documentation required by the sprint, and keep
   the boot files bounded: move finished history verbatim into
   `planning/archive/` (copy first, verify the copy, then trim; never
   summarize; never trim without a verified copy; if the copy cannot be
   verified, leave the file unbounded and say so).
2. Change only the completed sprint's roadmap row from `planned` to `done`.
3. Refresh `planning/ARCHITECT_BRIEFING.md`, including Executive summary,
   Readiness signals, real Tests counts, Evidence, Plan corrections, and the
   structured recommended next Architect action.
4. Record the flight class, Flight evidence, plan and inspection decision
   counts, stable finding ledger when any finding existed, deferred advisories,
   and explicitly accepted residual risk, if any.
5. Write `planning/STATUS.json` with `phase: "sprint-closed"`.

Record durable decisions and real plan corrections. The stable finding ledger
with reused IDs is kept for `critical` flights and for any finding that changes
the shipped result; routine advisories are acted on or dropped, not transcribed
into the permanent record. What scales with the class is the depth of the flight
record and the finding ledger, never the briefing's live-facing summary. Every
close, lean included, refreshes that summary; a lean close may drop the
flight-record narrative and the per-advisory ledger, not the live fields Mission
Control reads. Keep the boot files bounded under the existing archive law.

Then read the resulting close-out back from disk:

- reread the completed roadmap row;
- reread the briefing and its required sections;
- reread every state, decision, risk, question, architecture, or validation file
  the approved close-out required;
- reread `planning/STATUS.json`;
- inspect the final git diff for missing close-out work or scope drift.

Claim a landing only when that read-back proves the roadmap row is `done`, the
briefing records the real evidence and plan corrections, required documentation
is present, STATUS is `sprint-closed`, and the final diff remains within the
approved plan.

If the final read-back is incomplete or inconsistent, do not claim a landing.
Stop with the exact missing or inconsistent close-out item and a recommendation.

One flight ends here. A future sprint requires a new Architect conversation and
a new human `go`.

## Honest limits

Fly relies on the current coding tool's separate contexts, filesystem
permissions, git inspection, and real command output. It does not claim stronger
containment or timeout guarantees than that tool provides. If separation,
permissions, git truth, or required checks cannot be established, stop and
explain the blocker with a recommendation.
