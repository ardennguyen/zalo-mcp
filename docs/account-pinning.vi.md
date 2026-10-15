# Chọn tài khoản

[English](account-pinning.md)

Launcher chuyển `--account <ID>` hoặc `--account=<ID>` xuống
`zalo-agent mcp start`. Dùng toàn bộ ID số từ `zalo-agent account list`, giữ dạng
chuỗi. Tên, alias, số có số 0 đầu, thiếu giá trị hoặc lặp tùy chọn bị từ chối
trước khi cài đặt hay đăng nhập. Bỏ tùy chọn giữ cách chọn mặc định của engine.
Không thay đổi tài khoản active trong registry.

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

`101` là ví dụ giả. Mỗi process chọn một tài khoản; dùng ID khác nhau cho các
process MCP riêng. Engine quản lý credentials, khóa và reconnect.

## Điều kiện phát hành

Wrapper vẫn ghim engine đã phát hành **2.0.0**, chưa hỗ trợ tùy chọn này.
Cần merge [engine PR #3](https://github.com/ardennguyen/zalo-agent-cli/pull/3),
phát hành engine rồi cập nhật dependency wrapper sang bản đã phát hành đó.
Trước thời điểm này, chọn tài khoản tường minh sẽ bị engine từ chối; wrapper
không thử lại bằng tài khoản active. Không dùng dependency chưa phát hành.

Các tool MCP, kể cả tool sync tương lai, thuộc engine. Wrapper chỉ có tool mới
sau khi cập nhật phiên bản engine được ghim và phát hành.

## Kiểm thử và triển khai

Chạy `npm test`: test khởi động bản sao launcher với engine giả trong thư mục
tạm, kiểm tra giữ nguyên ID, kết hợp HTTP/auth và từ chối an toàn. Test không
đăng nhập hay đọc dữ liệu tài khoản. Bản deploy hiện có giữ nguyên. Khi đủ điều
kiện phát hành, cập nhật bằng `zalo-mcp.ps1 update` hoặc `bash zalo-mcp.sh update`,
khởi động lại MCP client và xác minh tài khoản được chọn. Rollback cấu hình:
xóa `--account` cùng giá trị rồi khởi động lại để dùng cách chọn mặc định.
