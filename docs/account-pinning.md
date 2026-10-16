# Account selection (`--account <ID>`)

[Tiếng Việt](account-pinning.vi.md)

The `zalo-mcp` launcher forwards `--account <ID>` or `--account=<ID>` both when
starting the MCP server (`zalo-agent mcp start`) and when running any CLI
subcommand (`zalo-mcp --account <ID> <command> ...`). Use the complete numeric
ID from `zalo-mcp account list`, as a string. Names, aliases, leading zeros,
missing values, and duplicate options are rejected before installation or login.
Omitting the option preserves the engine's default selection. Passing
`--account <ID>` never modifies the shared active account in `accounts.json`.

## Running multiple live accounts simultaneously

Each process selects and locks one account (`<DATA_DIR>/<ownId>/zalo.db`,
`media/`, `daemon.lock`, `daemon-channel.json`). To keep multiple accounts live
at the same time:

1. **stdio MCP (Claude Code / Cursor):** configure one `mcpServers` entry per
   account with distinct numeric IDs (`101` and `202` below are synthetic examples):
   ```json
   {
     "mcpServers": {
       "zalo-work": {
         "command": "zalo-mcp",
         "args": ["--account", "101"]
       },
       "zalo-shop": {
         "command": "zalo-mcp",
         "args": ["--account", "202"]
       }
     }
   }
   ```
2. **HTTP MCP (VPS):** run one process per account on separate ports:
   ```bash
   zalo-mcp --account 101 --http 3847 --auth <token-1> --host 0.0.0.0
   zalo-mcp --account 202 --http 3848 --auth <token-2> --host 0.0.0.0
   ```
3. **CLI pass-through:** target any specific account on one-shot CLI commands
   without racing on `accounts.json`:
   ```bash
   zalo-mcp --account 101 msg list --json
   zalo-mcp --account 202 sync --days 7
   ```

## Engine requirement and validation

- **MCP server account pinning (`zalo-mcp --account <ID>`):** supported in
  `@ardennguyen/zalo-mcp` `>=2.0.0` with `@ardennguyen/zalo-agent-cli` `>=2.1.0`.
- **CLI subcommand account pinning (`zalo-mcp --account <ID> <command>`):**
  supported in `@ardennguyen/zalo-mcp` `>=2.0.2` with
  `@ardennguyen/zalo-agent-cli` `>=2.2.0`.

Run `npm test` to verify launcher forwarding: tests start a copied launcher with
a disposable fake engine, covering exact ID forwarding in both MCP server and
CLI pass-through modes, HTTP/auth composition, and fail-closed validation.
