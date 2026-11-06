# AGENTS.md — zalo-mcp Project Rules

Rules for any AI coding agent working in this repository. `CLAUDE.md` is a byte-identical copy;
edit this file and copy it over the other in the same commit.

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
3. **Before every commit:** `npm test` (`tests/launcher.test.cjs`) green; if `mcp-server.js`
   changed, run it once; if a script changed, run the changed subcommand once — the scripts are
   the first thing a real user hits.
4. **Every commit is immediately followed by a push.** Conventional messages (`feat:`, `fix:`,
   `chore:`, `docs:`, `build:`).
5. **Never ask the user to run something you can run yourself.**
6. **Never commit a real account id, name, phone or credential.** `.env` is gitignored and holds OA
   secrets; never print it.

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
