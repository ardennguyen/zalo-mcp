# Release notes and preparation

[Tiếng Việt](README.vi.md)

The proposed [1.1.0 notes](v1.1.0.md) follow upstream's latest published
[1.0.16 notes](https://github.com/ardennguyen/zalo-mcp/releases/tag/v1.0.16):
package/version heading, a short outcome, highlights, engine changes, upgrade,
and limits. They are a draft, not a publication. Keep CHANGELOG.md for source
history; no separate root project-context file is needed.

## Release order without a maintainer's coding PC

1. Merge reviewed engine features into `v2.0-dev`. Use the engine's preparation
   template to propose its package version/lockfile change. Review and merge,
   promote to main per upstream's release policy, then use GitHub's release UI
   to create the matching tag/release. Existing `publish.yml` runs npm publication.
2. After npm has an engine satisfying `^2.0.1` **and containing the requested
   features**, regenerate the wrapper lockfile on a GitHub-hosted runner. Review
   and merge its version/lockfile PR into `v1.1.0`; then promote to main and tag
   the wrapper release. Do not publish a wrapper whose install cannot resolve.
3. Paste the versioned notes into the GitHub release after removing the proposal
   banner and confirming every listed feature/test applies to that tag. Upgrade
   existing deployments only through the documented wrapper update flow.

Current blocker (2026-10-15): upstream has no `v1.1.0` branch and this contributor
has no upstream push permission. A maintainer can create it from `main` in GitHub's
branch UI; then PR #1 can be retargeted. No local coding PC is needed.

## Lockfile synchronization

`package.json` declares `^2.0.1`; package-lock.json must record real npm `version`,
`resolved` and `integrity` values. Never copy the engine repo's package-lock into
the wrapper: they are different dependency graphs. First merge/sync the latest
target branch through the PR, then run npm's resolver in the wrapper source:

```bash
npm install --package-lock-only --ignore-scripts --no-audit --no-fund
npm ci
npm test
```

Commit both manifests on the PR branch if either changed. `npm ci` validates
the lock but does not repair a mismatch. Do not hand-edit integrity values or
change the dependency to a Git branch. If npm reports ETARGET, wait for engine
publication; changing branch targets cannot fix missing registry versions.

For the current fork PR, the shortest path is for its contributor to regenerate
and push the lockfile to the same PR after engine publication; the maintainer
only reviews and merges in GitHub. No upstream coding PC or bot setup is needed.

## Proposed Actions workflow

[prepare-release.yml](prepare-release.yml) is a **template**, not an active
workflow. Submit it once as `.github/workflows/prepare-release.yml` on the
upstream default branch. Then a maintainer can use **Actions → Prepare release
PR → Run workflow**, enter `1.1.0`, and review the resulting
`chore/release-1.1.0` → `v1.1.0` PR. It:

- checks out the trusted upstream target, sets the requested ^2.0.1 range, and fails
  if npm has no compatible published engine;
- updates the package version and real lockfile, runs `npm ci` and offline
  validation, and uploads the two manifests as an artifact;
- commits/pushes only the manifests to a new branch and opens a PR. It never
  pushes directly to the release target, tags, publishes, or modifies a deployment.

It can prepare manifests before feature PR #1 is merged: review/merge the
manifest PR, sync PR #1 with that base and require its final CI. On an older
wrapper base with no test script, the preparation run only validates installation
and engine CLI smoke checks; it does not claim launcher coverage. Do not tag
until the feature PR and integrated checks are complete.

One-time upstream setup: the target branch must exist, the workflow must be on
the default branch, and repository settings must allow Actions to create PRs
with `contents: write` / `pull-requests: write`. No npm publish token is needed
for preparation. GitHub may require **Approve workflows to run** for the bot's
PR checks. An existing preparation branch is never force-pushed; review its PR
instead. The template does not execute fork code with a privileged token.

This workflow has static YAML/shell validation only; it has not been installed
or run upstream. Existing publication workflow and its npm OIDC/token settings
remain unchanged.

References: [npm install](https://docs.npmjs.com/cli/v11/commands/npm-install/),
[npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/),
[manual Actions runs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow),
[GITHUB_TOKEN and PR checks](https://docs.github.com/en/actions/concepts/security/github_token).
