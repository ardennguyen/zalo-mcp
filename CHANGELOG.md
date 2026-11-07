# Changelog

All notable changes to `@ardennguyen/zalo-mcp`. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions are the npm versions and git tags.

The wrapper carries no engine code: what the MCP tools and CLI commands do is recorded in the engine's
[CHANGELOG](https://github.com/ardennguyen/zalo-agent-cli/blob/main/CHANGELOG.md). This file records
what changed in the wrapper and which engine it installs. Releases before 2.1.0 are described on
[GitHub Releases](https://github.com/ardennguyen/zalo-mcp/releases).

## [Unreleased]

## [2.1.0] — 2026-11-06

### What's changed since v2.0.9

- **Requires engine 3.0.0** (`@ardennguyen/zalo-agent-cli` `^3.0.0`). The engine replaces zca-js with
  its own Zalo engine, built from and tracking the current Zalo Web protocol, so it keeps working with
  the latest Zalo version without waiting for a third-party library.
- **36 MCP tools**, nine of them new (`zalo_conversation`, `zalo_profile`, `zalo_auto_reply`,
  `zalo_quick_message`, `zalo_catalog`, `zalo_bank`, `zalo_cloud`, `zalo_sticker`, `zalo_link`): every
  personal CLI command has an MCP action.
- **Destructive actions are asked about first.** Guarded MCP actions take `confirm` and `dryRun`, and
  `confirmMode` (`agent`, `human` or `off`) decides who confirms; destructive CLI commands run through
  `zalo-mcp` need `--yes` and exit 2 without it.
- README (Vietnamese and English) and `docs/account-pinning` updated for the new engine.

### Usage notices

- **Breaking, MCP clients:** read `msgId` (not `id` or `messageId`) and `userId` (not `uid`); send
  `threadType` as `"dm"` or `"group"` (a number is refused); every id is a string. The new tools,
  `zalo_friend`, `zalo_group` and `zalo_send_message` refuse an input they do not take.
- **Scripts that run destructive commands** through `zalo-mcp` add `--yes`.
- **`ZALO_QR_FLOW=legacy` is refused** by engine 3.0.0; remove it from `.env`.
- Update with `npm install -g @ardennguyen/zalo-mcp@latest`, or `.\zalo-mcp.ps1 update` /
  `./zalo-mcp.sh update` in a one-folder install.

[Unreleased]: https://github.com/ardennguyen/zalo-mcp/compare/v2.1.0...v2.0-dev
[2.1.0]: https://github.com/ardennguyen/zalo-mcp/releases/tag/v2.1.0
