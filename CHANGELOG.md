# Changelog

[Tiếng Việt](CHANGELOG.vi.md)

## Unreleased — 2026-10-15

- Remove root project-context files; keep changelog. Add proposed 1.1.0 notes
  and a GitHub-hosted version/lockfile PR template in release_notes/.
- Run CI on Node 22 only, matching the package's supported major version.
  Upstream v1.1.0 exists and PR #1 targets it; correct the release preparation
  README in both languages and regenerate the lockfile for published engine 2.1.0.

- Forward `--account <ID>` and `--account=<ID>` without numeric conversion.
- Reject invalid/duplicate IDs before installation or login; never retry using
  the default account if the engine rejects the flag.
- Add 15 offline launcher tests. Accept engine ^2.0.1 instead of fixed 2.0.0;
  published engine 2.1.0 provides account pinning and MCP sync tools.
- Engine 2.1.0 is published; wrapper 1.1.0 remains a proposed release after merge.
