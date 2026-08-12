# /update — Pull the latest 120x method into this folder

Bring this project folder up to date with the latest 120x method, and repair
anything missing — without touching your own work (your plan, decisions, and
code are left exactly as they are).

Do this now:

1. From the project root — the folder that holds `.120x/method-manifest.json` —
   run:

   ```bash
   node scripts/update-method.js
   ```

   It reads this folder's mode + version from `.120x/method-manifest.json`,
   fetches the current method files from the 120x app, refreshes only the shared
   method files that changed, and (for an existing-project folder) adds any
   missing pieces in place — including the owned 120x launchers at the
   surrounding repository root. Root writes are limited to
   `.claude/commands/120x/` and `.agents/skills/120x-*/`; it never touches sibling
   source files, deletes your work, or uploads anything.

   A folder carrying the pre-v9 updater may need this command twice. The first
   run safely refreshes the updater while leaving the folder at v8. Run the same
   command again; the refreshed updater installs the outer-root launchers and
   reports v9 only after every required placement succeeds.

2. Read the summary the script prints. If an existing-project folder still
   reports a version below the latest method after refreshing files, run the
   command once more. Relay the final summary in plain English: whether the
   folder was already up to date, or how many workspace files and root launchers
   were refreshed and whether starter/status repairs were added. If it reports
   an error, relay that instead; do not claim the folder is current.

That's the whole job — run the script and report what changed. Do not edit method
files by hand.
