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

This wrapper still pins published engine **2.0.0**, which does not support the
option. Account pinning requires the engine change in
[engine PR #3](https://github.com/ardennguyen/zalo-agent-cli/pull/3) to be merged,
published, and the wrapper dependency updated to that published release. Until
then, explicitly selecting an account fails at the engine; the wrapper never
retries with the active account. No unpublished dependency is introduced here.

MCP tools, including any future sync tools, are implemented by the engine. The
wrapper cannot expose a new tool until its engine pin is updated and released.

## Validation and rollout

Run `npm test`: tests start a copied launcher with a disposable fake engine,
cover exact ID forwarding, HTTP/auth composition and fail-closed behavior. They
do not log in or read account data. Existing deployments are unchanged. After
the published prerequisites, update using `zalo-mcp.ps1 update` or
`bash zalo-mcp.sh update`, restart the MCP client, and verify the selected account.
To roll back configuration, remove `--account` and its value, then restart; this
returns to the engine default account selection.
