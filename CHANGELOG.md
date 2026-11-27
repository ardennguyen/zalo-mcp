# Changelog

All notable changes to `@ardennguyen/zalo-mcp`. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions are the npm versions and git tags.

The wrapper carries no engine code: what the MCP tools and CLI commands do is recorded in the engine's
[CHANGELOG](https://github.com/ardennguyen/zalo-agent-cli/blob/main/CHANGELOG.md). This file records
what changed in the wrapper and which engine it installs. Releases before 2.1.0 are described on
[GitHub Releases](https://github.com/ardennguyen/zalo-mcp/releases).

## [Unreleased]

## [2.1.1] — 2026-11-27

Installs engine 3.5.1 (pinned exactly in `package.json`).

### Fixed

- **`zalo-mcp` with no arguments serves stdio, as documented.** The installers write
  `ZALO_MCP_HTTP_PORT` into the folder's `.env` as the port `--http` uses when given none, and the
  launcher handed it on to the engine, which reads it as "serve HTTP": every stdio client config
  (Claude Desktop, Claude Code, Cursor) started an HTTP server instead. That `.env` value is now
  used only by `--http`; a port set in the real environment or in `<CONFIG_DIR>/.env` still means
  HTTP, as the engine documents. dotenv 17 also printed a line on stdout (the stdio JSON-RPC
  channel) when it read the `.env`; it is quiet now, and the built-in reader no longer overwrites
  a variable already set.
- **The engine pin reaches every install.** The pin is the engine version a wrapper release was
  tested with. It lived in `package-lock.json`, which npm never publishes and the scripts did not
  use (`install` fetched only `package.json`, `update` installed `@latest`, `clean` deleted the
  lock), so installs floated to whatever engine was newest. `package.json` now names the engine
  version exactly instead of the `^3.0.0` range, which every npm version reads: `npm install -g`,
  `install`/`init` and `update` (by `package.json` alone, as `npm install -g` does; never
  `@latest`) install exactly the pinned engine, and `clean` keeps it. `package-lock.json` stays
  the repository's lock for CI.

## [2.1.0] — 2026-11-15

### What's changed since v2.0.9

- **Requires engine 3.0.0** (`@ardennguyen/zalo-agent-cli` `^3.0.0`). The engine replaces zca-js with
  its own Zalo engine, built from and tracking Zalo's current protocol, so it keeps working with
  the latest Zalo version without waiting for a third-party library.
- **37 MCP tools**, ten of them new (`zalo_conversation`, `zalo_profile`, `zalo_auto_reply`,
  `zalo_quick_message`, `zalo_catalog`, `zalo_bank`, `zalo_cloud`, `zalo_sticker`, `zalo_link`,
  `zalo_official`): every CLI command has an MCP action, the Official Account, ZBS and Social
  commands included.
- **Destructive actions are asked about first.** Guarded MCP actions take `confirm` and `dryRun`, and
  `confirmMode` (`agent`, `human` or `off`) decides who confirms; destructive CLI commands run through
  `zalo-mcp` need `--yes` and exit 2 without it.
- README (Vietnamese and English) and `docs/account-pinning` updated for the new engine.
- **Node 22.19.0 or later**, as the engine needs; `zalo-mcp.ps1` / `zalo-mcp.sh` check the minor version too.
- The startup log masks the webhook URL (`--webhook`, `-w`) besides `--auth`, `--client-secret` and `--webhook-secret`.
- Dependencies resolved past published advisories (`npm audit --omit=dev`: 0).

### Usage notices

- **Breaking, MCP clients:** read `msgId` (not `id` or `messageId`) and `userId` (not `uid`); send
  `threadType` as `"dm"` or `"group"` (a number is refused); every id is a string. The new tools,
  `zalo_friend`, `zalo_group` and `zalo_send_message` refuse an input they do not take.
- **Scripts that run destructive commands** through `zalo-mcp` add `--yes`.
- **`ZALO_QR_FLOW=legacy` is refused** by engine 3.0.0; remove it from `.env`.
- Update with `npm install -g @ardennguyen/zalo-mcp@latest`, or `.\zalo-mcp.ps1 update` /
  `./zalo-mcp.sh update` in a one-folder install.

[Unreleased]: https://github.com/ardennguyen/zalo-mcp/compare/v2.1.1...v2.0-dev
[2.1.1]: https://github.com/ardennguyen/zalo-mcp/releases/tag/v2.1.1
[2.1.0]: https://github.com/ardennguyen/zalo-mcp/releases/tag/v2.1.0
