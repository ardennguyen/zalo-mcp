# Changelog

[Tiếng Việt](CHANGELOG.vi.md)

## Unreleased — 2026-10-15

- Remove root project-context files; keep changelog. Add proposed 1.1.0 notes
  and a GitHub-hosted version/lockfile PR template in release_notes/.
- Enable CI for v1.1.0. Requested PR base remains blocked until an upstream
  maintainer creates that branch; contributor has no upstream push permission.

- Forward `--account <ID>` and `--account=<ID>` without numeric conversion.
- Reject invalid/duplicate IDs before installation or login; never retry using
  the default account if the engine rejects the flag.
- Add 15 offline launcher tests. Accept engine ^2.0.1 instead of fixed 2.0.0;
  account pinning still requires a future published engine containing it.
- Recommend engine 2.1.0 and wrapper 1.1.0 upstream releases after merge.
