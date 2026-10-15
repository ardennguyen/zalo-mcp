# Project context

[Tiếng Việt](PROJECT-CONTEXT.vi.md)

Updated: 2026-10-15. Branch: `fix/forward-account-id`; base: `b2f8e80`.

The source change forwards and validates the full account ID in the launcher.
The engine remains responsible for account lookup, authentication, reconnects,
and the MCP tool surface. No database or credential migration.

Status: coded locally; 15 offline launcher tests passed. No deployment or live
account test. Engine dependency is ^2.0.1; the option requires an installed
published version containing engine PR #3. Suggest engine 2.1.0 and wrapper
1.1.0 releases after merge; no version is published here.
Release blocker: npm latest verified as 2.0.0; generating a ^2.0.1 lockfile
fails ETARGET. PR stays draft; regenerate the old lockfile after engine release
and validate installation before merge.
See [usage, architecture, validation and rollout](docs/account-pinning.md).
