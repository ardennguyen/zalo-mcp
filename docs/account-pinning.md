# Account selection

[Tiếng Việt](account-pinning.vi.md)

The launcher forwards `--account <ID>` or `--account=<ID>` to
`zalo-agent mcp start`. Use the complete numeric ID from `zalo-agent account list`,
as a string. Names, aliases, leading zeros, missing values, and duplicate options
are rejected before installation or login. Omitting the option preserves the
engine's default selection. It does not change the active account registry.

```json
{
  "mcpServers": {
    "zalo-work": {
      "command": "node",
      "args": ["/absolute/path/zalo-mcp/mcp-server.js", "--account", "101"]
    }
  }
}
```

`101` is a synthetic example. Each process selects one account; use distinct IDs
for separate MCP processes. The engine owns credentials, locking, and reconnects.

## Release prerequisite

The wrapper accepts published engine **^2.0.1** (>=2.0.1, <3.0.0).
As of 2026-10-15 npm's latest is 2.0.0; ^2.0.1 cannot be installed yet (ETARGET).
The source labeled 2.0.1 does not include the option. Account pinning requires the engine change in
[engine PR #3](https://github.com/ardennguyen/zalo-agent-cli/pull/3) to be merged,
published, and the installed engine updated to that published release. Until
then, a fresh dependency install is blocked, and an older installed engine
rejects the flag. The wrapper never retries with the active account. No
unpublished tarball or Git branch is installed here.

MCP tools, including sync tools, are implemented by the engine. A compatible
range allows newer 2.x releases but does not update an existing installation or
lockfile automatically. `npm ci` uses the exact lockfile version.

Release blocker: this contribution remains a draft while that dependency is
unpublished. The existing package-lock.json is the old 2.0.0 snapshot, not a
valid lock for the new range. Regenerate it from npm after the engine release,
then verify installation before merging/releasing the wrapper. No lockfile
integrity or unpublished version is fabricated here.

Suggested upstream releases: engine **2.1.0** for the additive account/sync
features, then wrapper **1.1.0** for account forwarding and the new dependency
range. These are recommendations for the maintainer, not releases made here.

## Validation and rollout

Run `npm test`: tests start a copied launcher with a disposable fake engine,
cover exact ID forwarding, HTTP/auth composition and fail-closed behavior. They
do not log in or read account data. Existing deployments are unchanged. After
the published prerequisites, update using `zalo-mcp.ps1 update` or
`bash zalo-mcp.sh update`, restart the MCP client, and verify the selected account.
To roll back configuration, remove `--account` and its value, then restart; this
returns to the engine default account selection.
