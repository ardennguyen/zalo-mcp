# Changelog

[Tiếng Việt](CHANGELOG.vi.md)

## Unreleased — 2026-10-15

- Forward `--account <ID>` and `--account=<ID>` without numeric conversion.
- Reject invalid/duplicate IDs before installation or login; never retry using
  the default account if the engine rejects the flag.
- Add 15 offline launcher tests. Engine pin unchanged; requires a future
  published engine containing account pinning.
