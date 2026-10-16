# Chọn tài khoản (`--account <ID>`)

[English](account-pinning.md)

Launcher `zalo-mcp` chuyển tiếp `--account <ID>` hoặc `--account=<ID>` cả khi
khởi động MCP server (`zalo-agent mcp start`) lẫn khi chạy bất kỳ lệnh con CLI
nào (`zalo-mcp --account <ID> <lệnh> ...`). Dùng toàn bộ ID số từ
`zalo-mcp account list`, giữ dạng chuỗi. Tên, alias, số có số 0 đầu, thiếu giá
trị hoặc lặp tùy chọn bị từ chối trước khi cài đặt hay đăng nhập. Bỏ tùy chọn
sẽ giữ cách chọn mặc định của engine. Truyền `--account <ID>` không bao giờ làm
thay đổi tài khoản active chung trong `accounts.json`.

## Chạy nhiều tài khoản live cùng lúc

Mỗi tiến trình chọn và khóa riêng một tài khoản (`<DATA_DIR>/<ownId>/zalo.db`,
`media/`, `daemon.lock`, `daemon-channel.json`). Để duy trì nhiều tài khoản hoạt
động đồng thời:

1. **MCP chế độ stdio (Claude Code / Cursor):** khai báo mỗi tài khoản một mục
   trong `mcpServers` với các ID khác nhau (`101` và `202` dưới đây là ví dụ giả):
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
2. **MCP chế độ HTTP (VPS):** chạy mỗi tài khoản một tiến trình trên port riêng:
   ```bash
   zalo-mcp --account 101 --http 3847 --auth <token-1> --host 0.0.0.0
   zalo-mcp --account 202 --http 3848 --auth <token-2> --host 0.0.0.0
   ```
3. **Chuyển tiếp lệnh CLI:** nhắm vào đúng tài khoản cho từng lệnh CLI mà không
   gây tranh chấp `accounts.json`:
   ```bash
   zalo-mcp --account 101 msg list --json
   zalo-mcp --account 202 sync --days 7
   ```

## Yêu cầu phiên bản và kiểm thử

- **Ghim tài khoản cho MCP server (`zalo-mcp --account <ID>`):** hỗ trợ từ
  `@ardennguyen/zalo-mcp` `>=2.0.0` cùng `@ardennguyen/zalo-agent-cli` `>=2.1.0`.
- **Ghim tài khoản cho lệnh con CLI (`zalo-mcp --account <ID> <lệnh>`):** hỗ trợ
  từ `@ardennguyen/zalo-mcp` `>=2.0.1` cùng `@ardennguyen/zalo-agent-cli` `>=2.1.1`.

Chạy `npm test` để kiểm tra launcher: bộ test khởi động bản sao launcher với
engine giả trong thư mục tạm, kiểm tra chuyển tiếp ID ở cả chế độ MCP server và
chế độ CLI pass-through, kết hợp HTTP/auth và từ chối an toàn khi tham số sai.
