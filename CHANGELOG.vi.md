# Lịch sử thay đổi

[English](CHANGELOG.md)

## Chưa phát hành — 2026-10-15

- Bỏ file project-context gốc, giữ changelog. Thêm notes 1.1.0 và template tạo
  PR version/lockfile trên GitHub-hosted runner trong release_notes/.
- CI chỉ chạy Node 22, khớp major package hỗ trợ. Upstream đã có v1.1.0 và PR #1
  trỏ vào đó; sửa README chuẩn bị release Anh–Việt và tạo lại lockfile theo engine
  2.1.0 đã phát hành.

- Chuyển `--account <ID>` và `--account=<ID>` không ép kiểu số.
- Từ chối ID sai/lặp trước khi cài hay đăng nhập; không thử lại bằng tài khoản
  mặc định khi engine từ chối tùy chọn.
- Thêm 15 test launcher offline. Nhận engine ^2.0.1 thay vì cố định 2.0.0;
  engine 2.1.0 đã phát hành có ghim tài khoản và các tool sync MCP.
- Engine 2.1.0 đã phát hành; wrapper 1.1.0 vẫn là bản đề xuất sau merge.
