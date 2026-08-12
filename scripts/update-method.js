#!/usr/bin/env node
// Sprint 060 — the any-tool method updater + self-heal, run from a coding tool
// (Claude Code / Codex / Cursor) instead of the Mission Control browser dashboard.
//
// It does the SAME mode-aware update + repair the browser does: it reads this folder's
// mode + version from .120x/method-manifest.json, fetches the current method files for
// that mode from the 120x app, rewrites only the shared method files that changed, and —
// for an existing-project folder — repairs the two non-allowlist files that broke pre-059
// downloads (copies the old-named Architect prompt to the canonical name if the canonical
// is absent; seeds planning/STATUS.json if absent). It COPIES — never deletes — and never
// overwrites an existing STATUS.json. Nothing is uploaded; the only network call fetches
// our own doctrine TO this machine.
//
// Pure Node — no dependencies, uses the global fetch (Node 18+). It ships INSIDE customer
// folders (a TEMPLATE_FILE), so it cannot require the app's modules. The three helpers
// below are deliberate inlined copies of:
//   - diffManifest      → apps/hosted/lib/cockpit/method-update.js
//   - inferFolderMode   → apps/hosted/lib/cockpit/method-heal.js
//   - planHeal          → apps/hosted/lib/cockpit/method-heal.js
// Keep them in sync if the originals change (an accepted watch-item, recorded in
// planning/QUESTIONS.md, same posture as the cockpit's copied strings). tests/update-method.test.js
// checks this copy against the SAME case matrix as tests/cockpit-method-heal.test.js.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Mirrors src/generators.js DEFAULT_METHOD_SOURCE — the production Render deploy. Used only
// when the folder's manifest has no `source` and METHOD_API_BASE isn't set.
const DEFAULT_METHOD_SOURCE = "https://one20x-project-launcher.onrender.com";

const MANIFEST_PATH = ".120x/method-manifest.json";
const METHOD_DELIVERY_CONTRACT = "placement-v1";
const SAFE_WORKSPACE_BASENAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ROOT_FLY_LAUNCHER_PATTERNS = [
  /^\.claude\/commands\/120x\/fly\.md$/,
  /^\.agents\/skills\/120x-fly\/(?:SKILL\.md|agents\/openai\.yaml)$/,
];

// Heal constants — mirror apps/hosted/lib/cockpit/method-heal.js.
const OLD_PROMPT_NAME = "existing-project-feature-or-fix-architect-starter-prompt.md";
const CANONICAL_PROMPT_NAME = "architect-chat-starter-prompt.md";
const STATUS_PATH = "planning/STATUS.json";
const EXISTING_PROJECT_SPRINT_FOLDER = "planning/sprints/001-existing-project-feature-or-fix";
// MUST stay byte-identical to src/generators.js generateStatusJsonContent().
const STATUS_SEED =
  JSON.stringify({ schemaVersion: 1, phase: "discovery", sprint: null, updated: null }, null, 2) + "\n";

// ── inlined pure helpers (kept in sync with the app — see header note) ──────────────────

// Mirror of apps/hosted/lib/cockpit/method-update.js diffManifest.
function diffManifest(current, folderHashes, folderVersion, rootState = {}) {
  const files = (current && current.files) || {};
  const hashes = folderHashes || {};
  const changedFiles = Object.keys(files).filter((p) => hashes[p] !== files[p]);
  const rootLaunchers = (current && current.rootLaunchers) || {};
  const rootPaths = Object.keys(rootLaunchers);
  const rootAvailable = rootState.available !== false;
  const rootHashes = rootState.hashes || {};
  const rootUnavailable = rootPaths.length > 0 && !rootAvailable;
  const rootChangedFiles = rootUnavailable
    ? rootPaths
    : rootPaths.filter((p) => rootHashes[p] !== rootLaunchers[p].sha256);
  const baseVersion = folderVersion == null ? 0 : folderVersion;
  const newChangelog = ((current && current.changelog) || [])
    .filter((entry) => entry && typeof entry.version === "number" && entry.version > baseVersion)
    .slice()
    .sort((a, b) => b.version - a.version);
  return {
    behind: changedFiles.length > 0 || rootChangedFiles.length > 0 || rootUnavailable,
    changedFiles,
    rootChangedFiles,
    rootUnavailable,
    newChangelog,
  };
}

// Mirror of apps/hosted/lib/cockpit/method-heal.js inferFolderMode.
function inferFolderMode({ manifestMode, oldPromptExists, existingSprintFolderExists }) {
  if (
    manifestMode === "existing-project" ||
    manifestMode === "new-project" ||
    manifestMode === "website"
  ) {
    return manifestMode;
  }
  if (oldPromptExists || existingSprintFolderExists) {
    return "existing-project";
  }
  return "new-project";
}

// Mirror of apps/hosted/lib/cockpit/method-heal.js planHeal.
function planHeal({ mode, canonicalPromptExists, oldPromptExists, statusExists }) {
  if (mode !== "existing-project") {
    return { copyPrompt: false, seedStatus: false };
  }
  return {
    copyPrompt: !canonicalPromptExists && oldPromptExists,
    seedStatus: !statusExists,
  };
}

// ── filesystem helpers ──────────────────────────────────────────────────────────────────

// Walk up from `start` to the nearest directory that holds .120x/method-manifest.json.
// Returns that directory, or null if none is found up to the filesystem root.
function findProjectRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, MANIFEST_PATH))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return null;
    }
    dir = parent;
  }
}

function isSafeWorkspaceBasename(name) {
  return (
    typeof name === "string" &&
    name.length > 0 &&
    name !== "." &&
    name !== ".." &&
    !/[\\/\u0000-\u001f\u007f]/.test(name) &&
    path.basename(name) === name &&
    SAFE_WORKSPACE_BASENAME_PATTERN.test(name)
  );
}

function resolveExistingProjectPlacement(root) {
  const workspaceRoot = fs.realpathSync(root);
  const workspaceName = path.basename(workspaceRoot);
  if (!isSafeWorkspaceBasename(workspaceName)) {
    throw new Error(
      "The existing-project workspace folder name is unsafe. Use lowercase letters, numbers, and single hyphens only."
    );
  }
  const repositoryRoot = path.dirname(workspaceRoot);
  if (
    repositoryRoot === workspaceRoot ||
    path.resolve(repositoryRoot, workspaceName) !== workspaceRoot
  ) {
    throw new Error("Couldn't resolve the surrounding repository root safely.");
  }
  return { workspaceRoot, workspaceName, repositoryRoot };
}

function isSafeRelativePath(relativePath) {
  if (
    !relativePath ||
    typeof relativePath !== "string" ||
    relativePath.startsWith("/") ||
    relativePath.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(relativePath)
  ) {
    return false;
  }
  return relativePath
    .split("/")
    .every((segment) => segment && segment !== "." && segment !== "..");
}

function isSafeRootFlyLauncherPath(relativePath) {
  return (
    isSafeRelativePath(relativePath) &&
    ROOT_FLY_LAUNCHER_PATTERNS.some((pattern) => pattern.test(relativePath))
  );
}

function readManifest(root) {
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(root, MANIFEST_PATH), "utf8"));
    return {
      version: typeof parsed.version === "number" ? parsed.version : null,
      mode: typeof parsed.mode === "string" ? parsed.mode : null,
      source: typeof parsed.source === "string" ? parsed.source : null,
    };
  } catch {
    return { version: null, mode: null, source: null };
  }
}

function hashFile(absPath) {
  return crypto.createHash("sha256").update(fs.readFileSync(absPath, "utf8"), "utf8").digest("hex");
}

function writeRepoFile(root, relativePath, content) {
  const absPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, content);
}

// ── main ────────────────────────────────────────────────────────────────────────────────

// Injectable for tests: pass { cwd, fetchImpl, log }. Returns a result object describing
// what happened (so a test can assert without parsing stdout).
async function run({ cwd = process.cwd(), fetchImpl = globalThis.fetch, log = console.log } = {}) {
  const root = findProjectRoot(cwd) || path.resolve(cwd);
  const manifest = readManifest(root);

  const oldPromptExists = fs.existsSync(path.join(root, OLD_PROMPT_NAME));
  const existingSprintFolderExists = fs.existsSync(path.join(root, EXISTING_PROJECT_SPRINT_FOLDER));
  const mode = inferFolderMode({
    manifestMode: manifest.mode,
    oldPromptExists,
    existingSprintFolderExists,
  });

  const base = (process.env.METHOD_API_BASE || manifest.source || DEFAULT_METHOD_SOURCE).replace(
    /\/+$/,
    ""
  );

  if (typeof fetchImpl !== "function") {
    throw new Error("This Node version has no global fetch. Use Node 18+ to run /update.");
  }
  const placement = mode === "existing-project" ? resolveExistingProjectPlacement(root) : null;
  const workspaceQuery = placement
    ? `&workspace=${encodeURIComponent(placement.workspaceName)}`
    : "";
  const res = await fetchImpl(
    `${base}/api/method?mode=${encodeURIComponent(mode)}&contents=1&delivery=${METHOD_DELIVERY_CONTRACT}${workspaceQuery}`
  );
  if (!res.ok) {
    throw new Error(`Couldn't fetch the latest method files (${res.status}) from ${base}.`);
  }
  const current = await res.json();
  if (!current || !current.files) {
    throw new Error("The method endpoint returned an unexpected response.");
  }
  const contents = current.contents || {};
  if (current.contract !== METHOD_DELIVERY_CONTRACT) {
    throw new Error("The method endpoint did not provide the placement-aware update contract.");
  }
  if (mode === "existing-project" && Object.keys(current.rootLaunchers || {}).length === 0) {
    throw new Error("The method endpoint did not provide the required existing-project root launchers.");
  }

  // Diff this mode's allowlist against the folder.
  const folderHashes = {};
  for (const relativePath of Object.keys(current.files)) {
    const absPath = path.join(root, relativePath);
    folderHashes[relativePath] = fs.existsSync(absPath) ? hashFile(absPath) : null;
  }
  const rootHashes = {};
  if (placement) {
    for (const [relativePath, entry] of Object.entries(current.rootLaunchers || {})) {
      if (
        !entry ||
        entry.placement !== "root" ||
        !isSafeRootFlyLauncherPath(relativePath) ||
        typeof entry.sha256 !== "string" ||
        typeof entry.content !== "string"
      ) {
        throw new Error(`Refused an unsafe or incomplete root launcher: ${relativePath}`);
      }
      const absPath = path.join(placement.repositoryRoot, relativePath);
      rootHashes[relativePath] = fs.existsSync(absPath) ? hashFile(absPath) : null;
    }
  }
  const diff = diffManifest(current, folderHashes, manifest.version, {
    available: placement !== null,
    hashes: rootHashes,
  });

  // Validate every workspace path and content before the first write.
  for (const relativePath of diff.changedFiles) {
    if (
      !isSafeRelativePath(relativePath) ||
      !Object.prototype.hasOwnProperty.call(current.files, relativePath)
    ) {
      throw new Error(`Refused to write a file outside the method allowlist: ${relativePath}`);
    }
    if (typeof contents[relativePath] !== "string") {
      throw new Error(`The latest method files were incomplete (missing ${relativePath}).`);
    }
  }

  // Write only changed allowlist files; assert membership before every write.
  let refreshed = 0;
  for (const relativePath of diff.changedFiles) {
    writeRepoFile(root, relativePath, contents[relativePath]);
    refreshed += 1;
  }

  // Heal — existing-project only; copy-not-delete, seed-if-absent.
  let copiedPrompt = false;
  let seededStatus = false;
  const plan = planHeal({
    mode,
    canonicalPromptExists: fs.existsSync(path.join(root, CANONICAL_PROMPT_NAME)),
    oldPromptExists,
    statusExists: fs.existsSync(path.join(root, STATUS_PATH)),
  });
  if (plan.copyPrompt) {
    writeRepoFile(root, CANONICAL_PROMPT_NAME, fs.readFileSync(path.join(root, OLD_PROMPT_NAME), "utf8"));
    copiedPrompt = true;
  }
  if (plan.seedStatus) {
    writeRepoFile(root, STATUS_PATH, STATUS_SEED);
    seededStatus = true;
  }

  let rootRefreshed = 0;
  if (placement) {
    for (const relativePath of diff.rootChangedFiles) {
      const entry = current.rootLaunchers[relativePath];
      writeRepoFile(placement.repositoryRoot, relativePath, entry.content);
      rootRefreshed += 1;
    }
  }

  const changed = refreshed > 0 || rootRefreshed > 0 || copiedPrompt || seededStatus;

  // Re-stamp the mode-aware manifest only when something changed.
  if (changed) {
    const stamp =
      JSON.stringify(
        {
          version: current.version,
          released: current.released,
          mode: mode || "new-project",
          source: base,
          files: current.files,
        },
        null,
        2
      ) + "\n";
    writeRepoFile(root, MANIFEST_PATH, stamp);
  }

  // Plain-English summary.
  let summary;
  if (!changed) {
    summary = `Your 120x method is already up to date (v${current.version}).`;
  } else {
    const extras = [];
    if (rootRefreshed) {
      extras.push(
        `refreshed ${rootRefreshed} root launcher${rootRefreshed === 1 ? "" : "s"}`
      );
    }
    if (copiedPrompt) extras.push("added your Architect starter prompt");
    if (seededStatus) extras.push("added status tracking");
    const tail = extras.length ? `, ${extras.join(", ")}` : "";
    summary = `Updated to v${current.version}: refreshed ${refreshed} file${refreshed === 1 ? "" : "s"}${tail}.`;
  }
  log(summary);

  return {
    root,
    mode,
    base,
    version: current.version,
    upToDate: !changed,
    refreshed,
    rootRefreshed,
    changedFiles: diff.changedFiles,
    rootChangedFiles: diff.rootChangedFiles,
    healed: { copiedPrompt, seededStatus },
    summary,
  };
}

module.exports = {
  run,
  diffManifest,
  inferFolderMode,
  planHeal,
  findProjectRoot,
  DEFAULT_METHOD_SOURCE,
  STATUS_SEED,
  OLD_PROMPT_NAME,
  CANONICAL_PROMPT_NAME,
  STATUS_PATH,
  EXISTING_PROJECT_SPRINT_FOLDER,
  METHOD_DELIVERY_CONTRACT,
  isSafeWorkspaceBasename,
  resolveExistingProjectPlacement,
  isSafeRootFlyLauncherPath,
};

if (require.main === module) {
  run().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
