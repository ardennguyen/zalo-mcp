# Changelog

[Tiếng Việt](CHANGELOG.vi.md)

## Unreleased — 2026-10-15

- Forward `--account <ID>` and `--account=<ID>` without numeric conversion.
- Reject invalid/duplicate IDs before installation or login; never retry using
  the default account if the engine rejects the flag.
- Add 15 offline launcher tests. Accept engine ^2.0.1 instead of fixed 2.0.0;
  account pinning still requires a future published engine containing it.
- Recommend engine 2.1.0 and wrapper 1.1.0 upstream releases after merge.
