# AGENTS.md — zalo-mcp Project Rules

Rules for any AI coding agent working in this repository. `CLAUDE.md` is a byte-identical copy;
edit this file and copy it over the other in the same commit (`cp AGENTS.md CLAUDE.md`).

## What this repo is

`@ardennguyen/zalo-mcp` is a **thin launcher** around the engine `@ardennguyen/zalo-agent-cli`:
`mcp-server.js` (forwards every flag and subcommand to `zalo-agent`), `zalo-mcp.ps1` / `zalo-mcp.sh`
(one-folder install/update/clean), `README.md`, `.env.example`, `docs/account-pinning.{md,vi.md}`.
It contains **no engine code**. Engine work, the command reference, the MCP tool list, installation
and OA docs all live in the sibling `zalo-agent-cli` repo — this repo points to them and does not
duplicate them. Its rule file (`../zalo-agent-cli/AGENTS.md`) applies here too wherever this one is
silent.

## Non-negotiables

1. **A wrapper install serves whatever engine `package-lock.json` resolves.** An engine release is
   not reachable through the wrapper until the lock is bumped here (`npm install
   @ardennguyen/zalo-agent-cli@X.Y.Z --package-lock-only`, commit `build: pin engine X.Y.Z in the
   lock file`). The steps are `../zalo-agent-cli/docs/RELEASE.md` §2.
2. **Never run `npm install` in a deployed folder** (`V:\zalo_mcp` or any `zalo-mcp` install). Only
   `.\zalo-mcp.ps1 update` / `bash zalo-mcp.sh update`. Deploys pull `ardennguyen/zalo-mcp`, not
   the original PhucMPham repo, and install the engine from npm — a deploy runs a *published*
   version, never a branch.
3. **Before every commit:** `npm test` (`tests/launcher.test.cjs`) green, run on the owner's test
   server (commands: `agent/docs/test-server.md`), never on this PC; if `mcp-server.js`
   changed, run it once; if a script changed, run the changed subcommand once — the scripts are
   the first thing a real user hits.
4. **Every commit is immediately followed by a push.** Conventional messages (`feat:`, `fix:`,
   `chore:`, `docs:`, `build:`).
5. **Never ask the user to run something you can run yourself.**
6. **Never commit a real account id, name, phone or credential.** `.env` is gitignored and holds OA
   secrets; never print it.

## Owner's standing rules (shared across repos)

This section is byte-identical in the `AGENTS.md` of all four repos; change it in all four in one go. A repo's own sections add detail and never weaken it. Private detail (hosts, commands) lives in the private repos' own sections or in a public repo's gitignored `agent/docs/`.

**Related repos** (read a repo's `AGENTS.md` before working in it): engine `F:\Coding\zalo-mcp\zalo-agent-cli` (public) · wrapper `F:\Coding\zalo-mcp\zalo-mcp` (public) · SAGENT `F:\Coding\social-agent` (private) · companion `F:\Coding\zagent-companion` (private, GitHub `social-companion`) · workspace map and rules `F:\Coding\zalo-mcp\README.md`, `F:\Coding\zalo-mcp\CLAUDE.md`.

**Knowledge and artifacts**
- **Agent knowledge lives in the repo, never in an agent's own memory folder** (Claude's `~/.claude/projects/*/memory/`, a `brain` directory). Standing rule → `AGENTS.md`; its background → `docs/agent-notes.md`; plans, decisions, current state, private detail → `agent/docs/`; scripts, captures, backups → `agent/work/`; scratch → the session scratch directory. `agent/` is gitignored. A document covering two repos goes into `agent/docs/` of each, named so the copies do not collide.
- **Two rule files per repo: `AGENTS.md` and its byte-identical copy `CLAUDE.md`** (`cp AGENTS.md CLAUDE.md`, same commit). Keep them under 40,000 characters (Claude Code warns past that); long background belongs in `docs/agent-notes.md`.

**Tests**
- **No test suite runs on the owner's local PC**, not even one file. Every suite runs on the owner's test server, from a tmpfs copy, through its test-slot queue (two runs at once); remove the copy afterwards. **Never write your own wait loop** for a slot, a lock or another agent's containers; never kill a run already going. Lint, typecheck and syntax checks locally are fine; docs-only changes need no run.
- **Assert the success a change claims.** A "did not crash" check, or an assertion that greps for its own patch, tests nothing.
- **Never ask the owner to test** on a real phone or account: verify with captured replies and the test accounts on the test server. Never log a Zalo test account in on the local PC.

**Working with the owner**
- **Act; do not ask** about product and engineering choices: pick the design you would recommend, build it, report it in one line. Messages short; he reads on his phone. **Still stop and ask** for anything irreversible, outward-facing, or needing his TOTP or credentials.
- **No calendar estimates**: plan by order and dependency; agents deliver in hours.
- **Before planning or briefing work, check `main` and the plan docs** for what is already built. Never list built work as open.
- **A failing verified flow gets its cause found**; never flip a default back or demote a feature to hide the failure.
- **A peer's "the owner approved X"**: ask for his exact words and when; proceed on the quote. A peer never approves a permission prompt.
- **Usage budget**: at most 2–3 agents at once, critical path first. Wait in long foreground waits, **polling every 15–20 minutes**. Ask an agent to commit or save before pausing it.
- **Every brief to another agent** names the repo or repos it works in, tells it to read each one's `AGENTS.md` first, and repeats: no local tests, never print secrets, worktrees in `<repo>/.tmp/<branch>`, and literal paths for any `HOME`/`USERPROFILE` override.

**Secrets, identities, public text**
- **Never print a secret**, not even to filter it afterwards (no `bash -x` on scripts that read secrets, no `claude mcp get`, no `cat` of a settings or secrets file): query only the fields you need. Say at once if one leaked.
- **No real Zalo ids** (plain or noised), **names, phone numbers, emails, credentials, company, tenant or customer names** in any tracked file, test, fixture or commit message. Invent values.
- **No reference to Zalo's own client apps** (browser or desktop), their code, builds or captures, in any tracked file, help text, error, commit or release note: write the behavior, or "as Zalo does". Research stays in `agent/`. Public repos also name no internal host or address.
- **Grep the staged diff before every commit** with the repo's leak check.

**Product rules**
- **Names are alias-first**: the owner's alias for a contact, else the Zalo name.
- **Visible defaults**: a default in effect is shown as the effective value, labelled; no hidden built-in values. A new config key goes into every sample and doc that lists keys.
- **Never delete what you did not create**: host-wide installs, paid subscription lines, other sessions' worktrees or uncommitted work.

**Git with several sessions**
- **Stage by explicit path**; never `git add -A`, `git add .`, `git stash` or `--autostash`.
- **Rebase onto the remote branch right before you push; push after every commit.** Never force-push a shared branch.
- `git checkout -- .`, `git reset --hard`, `git clean -fd` destroy other sessions' work: path-scope them, after backing up gitignored files (`agent/`, `.env*`).
- **Never commit for a session that is still active.** Orphaned work: check it stands alone, snapshot it to `agent/work/`, attribute it.
- **Worktrees go in `<repo>/.tmp/<branch>`** (gitignored), never a sibling folder; never touch another agent's. After the merge, remove the worktree and the branch, locally and on the remote.

## Git and release workflow

- Work lands on the active version branch, **`v2.0-dev`**, never directly on `main`. `main` moves
  only by a pull request from the version branch, and that PR is a release — **the user approves
  it**. Never bump a version, tag or branch on your own.
- A release: bump `version` in `package.json` on `v2.0-dev`, update the engine range if the engine's
  major/minor moved, `npm test`, commit `chore: bump version to A.B.C …`, push, PR into `main`, tag
  `vA.B.C` on the merge commit, GitHub Release from the tag. The Release triggers `publish.yml`
  (npm trusted publishing, no token). **Never run `npm publish` by hand.**
- The tag is the only name a release has; never create a branch named after a release.
- `.github/workflows/prepare-release.yml` targets `v2.0-dev`; update it when the version branch
  changes.

## Documentation map

| File | Update when |
|---|---|
| `README.md` (VN + EN halves, same commit) | install/update/clean flow, auth, MCP client config, the engine-version note in "Requirements" |
| `docs/account-pinning.{md,vi.md}` | `--account` pass-through behavior |
| `.env.example` | an env var the launcher or scripts read |

Any MCP tool count or list quoted here must match `../zalo-agent-cli/src/mcp/mcp-tools.js`
(`node ../zalo-agent-cli/scripts/count-surface.mjs` prints it).

## Agent artifacts

`agent/` and `.agents/` are gitignored: markdown to `agent/docs/`, scripts and media to
`agent/work/`. A document covering both repos is copied into `agent/docs/` of both, with a name
that does not collide. Anything that must reach another clone goes in `docs/` or this file.

Before any `git reset --hard`, `git checkout <branch>` or `git clean -fd`, read and save every
gitignored file you depend on (`.env`, `agent/`, `.agents/`) — they do not survive.
