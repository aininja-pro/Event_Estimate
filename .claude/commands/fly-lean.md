# /fly-lean — Run one reviewed 120x flight (lean)

Run the lean 120x Fly workflow for this project. It flies one sprint with two
persistent contexts, one Architect and one Builder, and keeps every durable
safety gate.

Do this now:

1. Read `templates/method/120x-fly-lean.md`. That file is the workflow; this
   command is only its Claude Code entry point.
2. Resolve the folder layout as that file describes, then read the canonical
   Architect body it points you to.
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
4. Do not substitute the standalone `/architect` or `/build` stopping behavior
   for the authority transition this workflow defines.
