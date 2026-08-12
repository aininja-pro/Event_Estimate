---
name: 120x-fly-lean
description: Run one reviewed 120x flight (lean) for the current project. Use only when explicitly invoked to begin with full Architect discovery, wait for the human go, then carry one reviewed Builder sprint through real checks and close-out with no second human approval.
---

# Run one reviewed 120x flight (lean)

Run the lean 120x Fly workflow. It flies one sprint with two persistent
contexts, one Architect and one Builder, and keeps every durable safety gate.
This is an ordinary direct method layout: the method workspace and repository
skill root are the current folder.

Do this now:

1. Read `templates/method/120x-fly-lean.md`. That file is the workflow; this
   skill is only its Codex entry point.
2. When that doctrine begins Architect work, use the direct root
   `.agents/skills/120x-architect/SKILL.md` as the canonical Architect body.
3. Follow it exactly, in order:
   - full Architect discovery and the explicit human `go`, with nothing written
     before `go`;
   - after `go`, the Architect writes the `planning/ROADMAP.md` update and the
     four sprint files straight into `planning/sprints/<sprint>/`;
   - the Builder posts its plan; the Architect returns `pass`, `fix`, or `ask`,
     and a `pass` authorizes the build with no further human prompt;
   - the Builder builds only the passed plan and runs the declared checks for
     real;
   - the same Architect reads the full diff against the numbered acceptance
     criteria and returns `pass`, `fix`, or `ask`;
   - the scaled close-out, then the read-back from disk before any landing is
     claimed.
4. Do not substitute the standalone `$120x-architect` or `$120x-builder`
   stopping behavior for the authority transition this workflow defines.
