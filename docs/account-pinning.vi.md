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

Wrapper nhận engine đã phát hành **^2.0.1** (>=2.0.1, <3.0.0).
Ngày 2026-10-15, npm mới có 2.0.0; chưa cài được ^2.0.1 (ETARGET).
Source mang số 2.0.1 chưa có tùy chọn này.
Cần merge [engine PR #3](https://github.com/ardennguyen/zalo-agent-cli/pull/3),
phát hành engine rồi cập nhật engine đã cài sang bản đã phát hành đó.
Trước thời điểm này, cài dependency mới sẽ bị chặn; engine cũ đã cài từ chối
tùy chọn. Wrapper không thử lại bằng tài khoản active. Không cài tarball hay
Git branch chưa phát hành.

Các tool MCP, kể cả sync, thuộc engine. Dải phiên bản cho phép nhận các bản 2.x
mới nhưng không tự cập nhật bản đã cài hay lockfile. `npm ci` dùng đúng phiên
bản trong lockfile.

Điều kiện chặn phát hành: PR giữ draft khi dependency chưa được phát hành.
package-lock.json hiện có là snapshot 2.0.0 cũ, chưa hợp lệ với dải mới. Cần
tạo lại từ npm sau khi phát hành engine, kiểm tra cài đặt rồi mới merge/phát
hành wrapper. Không bịa integrity hay phiên bản chưa phát hành trong lockfile.

Đề xuất upstream phát hành engine **2.1.0** cho tính năng tài khoản/sync mới,
rồi wrapper **1.1.0** cho chuyển tiếp tài khoản và dải dependency mới. Đây là
khuyến nghị cho maintainer, không phải phiên bản đã phát hành trong công việc này.

## Kiểm thử và triển khai

Chạy `npm test`: test khởi động bản sao launcher với engine giả trong thư mục
tạm, kiểm tra giữ nguyên ID, kết hợp HTTP/auth và từ chối an toàn. Test không
đăng nhập hay đọc dữ liệu tài khoản. Bản deploy hiện có giữ nguyên. Khi đủ điều
kiện phát hành, cập nhật bằng `zalo-mcp.ps1 update` hoặc `bash zalo-mcp.sh update`,
khởi động lại MCP client và xác minh tài khoản được chọn. Rollback cấu hình:
xóa `--account` cùng giá trị rồi khởi động lại để dùng cách chọn mặc định.
