# Project context

[Tiếng Việt](PROJECT-CONTEXT.vi.md)

Updated: 2026-10-15. Branch: `fix/forward-account-id`; base: `b2f8e80`.

The source change forwards and validates the full account ID in the launcher.
The engine remains responsible for account lookup, authentication, reconnects,
and the MCP tool surface. No database or credential migration.

Status: coded locally; 15 offline launcher tests passed. No deployment or live
account test. The published engine pin stays at 2.0.0; the option requires a
published version containing engine PR #3 and a subsequent wrapper pin update.
See [usage, architecture, validation and rollout](docs/account-pinning.md).
